/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import DoctorMap from "@/components/DoctorMap";
import Header from "@/components/Header";
import mockDoctorsData from "@/data/mockDoctors.json";
import Link from "next/link";
import DoctorAddedPopup from "@/components/DoctorAddedPopup";

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
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<any>(null);

  useEffect(() => {
    const storedDoctors = localStorage.getItem("doctorResults");
    if (storedDoctors) {
      try {
        const parsed = JSON.parse(storedDoctors);
        setTopDoctors(parsed.slice(0, 3));
        setOtherDoctors(parsed.slice(3));
        return;
      } catch (error) {
        console.error("Failed to parse doctorResults:", error);
      }
    }

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (isLocalhost) {
      const mockDoctors = mockDoctorsData.doctors;
      setTopDoctors(mockDoctors.slice(0, 3));
      setOtherDoctors(mockDoctors.slice(3));
    }

    const storedSelected = JSON.parse(
      localStorage.getItem("selectedDoctors") || "[]"
    );
    setSelectedDoctors(storedSelected.map((d: any) => d.npi));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedDoctors",
      JSON.stringify(
        [...topDoctors, ...otherDoctors]
          .filter((d) => selectedDoctors.includes(d.npi))
          .map((d) => ({
            npi: d.npi,
            name: `${d.first_name} ${d.last_name}`,
            specialty: d.primary_specialty,
            rating: d.ratings?.[0]?.score || "N/A",
            reviews: d.ratings?.[0]?.count || 0,
            img: d.profile_picture_url || "/doctor.png",
          }))
      )
    );
    window.dispatchEvent(new Event("storage"));
  }, [selectedDoctors, topDoctors, otherDoctors]);

  const handleCheckboxChange = (doc: Doctor) => {
    setSelectedDoctors((prev) => {
      if (prev.includes(doc.npi)) {
        return prev.filter((id) => id !== doc.npi);
      } else {
        const doctorData = {
          npi: doc.npi,
          name: `${doc.first_name} ${doc.last_name}`,
          specialty: doc.primary_specialty,
          rating: doc.ratings?.[0]?.score || "N/A",
          reviews: doc.ratings?.[0]?.count || 0,
          img: doc.profile_picture_url || "/doctor.png",
        };
        setSelectedDoctorInfo(doctorData);
        setShowPopup(true);
        return [...prev, doc.npi];
      }
    });
  };

  const getRatingInfo = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return { score: "N/A", count: 0 };
    const topSource = ratings[0];
    return { score: topSource.score, count: topSource.count };
  };

  const doctorsForMap = [...topDoctors, ...otherDoctors].map((doc, index) => ({
    id: Number(doc.npi) || index,
    name: `${doc.first_name} ${doc.last_name}`,
    lat: doc.latitude,
    lng: doc.longitude,
    address: doc.address,
  }));

  const DoctorCard = (doc: Doctor) => {
    const { score, count } = getRatingInfo(doc.ratings);
    return (
      <Link
        href={`/doctor-detail?id=${doc.npi}`}
        key={doc.npi}
        className="cursor-pointer hover:bg-gray-100 flex flex-col sm:flex-row sm:items-center bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm text-sm sm:text-base"
      >
        <Image
          src={doc.profile_picture_url || "/doctor.png"}
          alt={doc.first_name}
          width={70}
          height={70}
          className="rounded-full mb-3 sm:mb-0 sm:mr-4 object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">
            {doc.first_name} {doc.last_name}
          </h3>
          <p className="text-sm text-gray-500">{doc.primary_specialty}</p>
          <div className="flex items-center text-yellow-500 text-sm my-1">
            <i className="ri-star-fill"></i>
            <span className="ml-1 text-gray-700">
              {score} ({count} reviews)
            </span>
          </div>
          <p className="text-sm text-gray-600">{doc.address}</p>
        </div>
        <label
          className="flex items-center text-sm text-gray-600 mt-2 sm:mt-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="mr-2"
            checked={selectedDoctors.includes(doc.npi)}
            onChange={() => handleCheckboxChange(doc)}
          />
          AI Appointment
        </label>
      </Link>
    );
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <Header />

      {/* Top 3 Recommended */}
      <section className="backdrop-blur-md bg-[#F8F7FF] border-2 border-[#FFD9F4] rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-6xl z-10 mb-8 sm:mb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-[#433C50] mb-4 text-center sm:text-left">
          Your {topDoctors.length} specially{" "}
          <span className="text-[#5F72BE]">AI-recommended</span> doctors
        </h2>

        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {topDoctors.map((doc) => (
              <DoctorCard key={doc.npi} {...doc} />
            ))}
          </div>
          <div className="h-[300px] sm:h-auto rounded-xl overflow-hidden">
            <DoctorMap doctors={doctorsForMap} />
          </div>
        </div>
      </section>

      {/* Explore More Doctors */}
      <section className="bg-white border-2 border-[#2E263D38] rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-6xl z-10 mb-8 sm:mb-10">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center sm:text-left">
          Explore more doctors
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {otherDoctors.map((doc) => (
            <DoctorCard key={doc.npi} {...doc} />
          ))}
        </div>
      </section>

      {showPopup && selectedDoctorInfo && (
        <DoctorAddedPopup
          doctor={selectedDoctorInfo}
          onClose={() => setShowPopup(false)}
        />
      )}
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
