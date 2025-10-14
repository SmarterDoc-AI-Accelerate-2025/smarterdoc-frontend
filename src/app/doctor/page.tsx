"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import DoctorMap from "@/components/DoctorMap";
import Header from "@/components/Header";
import mockDoctorsData from "@/data/mockDoctors.json";

interface Rating {
  source: string;
  score: number;
  count: number;
  link: string;
}

interface Doctor {
  npi: string;
  first_name: string;
  last_name: string;
  primary_specialty: string;
  ratings: Rating[];
  address: string;
  latitude: number;
  longitude: number;
  profile_picture_url: string;
}

function DoctorPageContent() {
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [otherDoctors, setOtherDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalhost) {
    console.log("Using mock data (localhost)");
    const mockDoctors = mockDoctorsData.doctors;
    setTopDoctors(mockDoctors.slice(0, 3));
    setOtherDoctors(mockDoctors.slice(3));
  } else {
    console.log("Using localStorage data (production)");
    const storedDoctors = localStorage.getItem("doctorResults");
    if (storedDoctors) {
      try {
        const parsed = JSON.parse(storedDoctors);
        setTopDoctors(parsed.slice(0, 3));
        setOtherDoctors(parsed.slice(3));
      } catch (error) {
        console.error("Failed to parse doctorResults from localStorage:", error);
      }
    } else {
      console.warn("No doctorResults found in localStorage. Showing empty list.");
    }
  }
}, []);

  const getRatingInfo = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return { score: "N/A", count: 0 };
    const topSource = ratings[0];
    return { score: topSource.score, count: topSource.count };
  };

  const doctorsForMap = [...topDoctors, ...otherDoctors].map((doc, index) => ({
    id: Number(doc.npi) || index, // convert string to number, fallback to index
    name: `${doc.first_name} ${doc.last_name}`,
    lat: doc.latitude,
    lng: doc.longitude,
    address: doc.address,
  }));

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10">
      <Header />

      {/* Top 3 Recommended*/}
      <section className="backdrop-blur-md bg-[#F8F7FF] border-2 border-[#FFD9F4] rounded-3xl shadow-lg p-6 w-full max-w-6xl z-10 mb-10">
        <h2 className="text-xl font-semibold text-[#433C50] mb-4">
          Your {topDoctors.length} specially{" "}
          <span className="text-[#5F72BE]">AI-recommended</span> doctors
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor List */}
          <div className="space-y-4">
            {topDoctors.map((doc) => {
              const { score, count } = getRatingInfo(doc.ratings);
              return (
                <div
                  key={doc.npi}
                  className="cursor-pointer hover:bg-gray-100 flex items-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <Image
                    src={doc.profile_picture_url || "/doctor.png"}
                    alt={doc.first_name}
                    width={80}
                    height={80}
                    className="rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {doc.first_name} {doc.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {doc.primary_specialty}
                    </p>
                    <div className="flex items-center text-yellow-500 text-sm my-1">
                      <i className="ri-star-fill"></i>
                      <span className="ml-1 text-gray-700">
                        {score} ({count} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{doc.address}</p>
                  </div>
                  <label className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2" /> AI Appointment
                  </label>
                </div>
              );
            })}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden">
            <DoctorMap doctors={doctorsForMap} />
          </div>
        </div>
      </section>

      {/* Explore More Doctors */}
      <section className="bg-white border-2 border-[#2E263D38] rounded-3xl shadow-lg p-6 w-full max-w-6xl z-10 mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Explore more doctors
        </h3>
        <div className="space-y-4">
          {otherDoctors.map((doc) => {
            const { score, count } = getRatingInfo(doc.ratings);
            return (
              <div
                key={doc.npi}
                className="cursor-pointer hover:bg-gray-100 flex justify-between items-center bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={doc.profile_picture_url || "/doctor.png"}
                    alt={doc.first_name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {doc.first_name} {doc.last_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {doc.primary_specialty}
                    </p>
                    <p className="text-sm text-gray-600">{doc.address}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <i className="ri-star-fill text-yellow-500"></i>
                  <span>
                    {score} ({count} Reviews)
                  </span>
                  <label className="flex items-center ml-4">
                    <input type="checkbox" className="mr-1" /> AI Appointment
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default function DoctorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <i className="ri-loader-4-line animate-spin text-3xl text-purple-600"></i>
        </div>
      }
    >
      <DoctorPageContent />
    </Suspense>
  );
}
