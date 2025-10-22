/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import DoctorMap from "@/components/DoctorMap";
import Header from "@/components/Header";
import mockDoctorsData from "@/data/mockDoctors.json";
import DoctorCard from "@/components/DoctorCard";
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
  const [activeDoctorId, setActiveDoctorId] = useState<number | null>(null);

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

  const doctorsForMap = [...topDoctors, ...otherDoctors].map((doc, index) => ({
    id: Number(doc.npi) || index,
    name: `${doc.first_name} ${doc.last_name}`,
    lat: doc.latitude,
    lng: doc.longitude,
    address: doc.address,
  }));

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <Header />

      {/* Top 3 Recommended */}
      <div
        className="relative w-full max-w-6xl z-10 mb-8 sm:mb-10 rounded-3xl p-[2px] backdrop-blur-md"
        style={{
          background: "linear-gradient(to bottom right, #FFD9F4, #C0B5FF)",
        }}
      >
        <section className="rounded-3xl bg-[#F8F7FF] shadow-lg p-4 sm:p-6 w-full h-full">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
            <div className="flex items-center justify-center bg-[#EDE3FF] w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm mx-auto sm:mx-0 mb-3 sm:mb-0">
              <Image
                src="/star.png"
                alt="AI Star Icon"
                width={32}
                height={32}
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-[#433C50]">
                Your {topDoctors.length} specially{" "}
                <span className="font-semibold bg-gradient-to-tr from-[#8636F8] via-[#F020B3] via-[#F8475E] to-[#FF9421] text-transparent bg-clip-text">
                  AI-recommended
                </span>{" "}
                doctors
              </h2>

              <div className="flex flex-wrap justify-center sm:justify-start mt-2 text-sm text-[#636669] gap-x-3 sm:gap-x-5">
                <div className="flex items-center gap-1">
                  <i className="ri-check-line text-green-600"></i>
                  <span>Top Recommended</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="ri-check-line text-green-600"></i>
                  <span>Medical Scholars</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="ri-check-line text-green-600"></i>
                  <span>In-Network</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor list + map */}
          <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              {topDoctors.map((doc) => (
                <DoctorCard
                  key={doc.npi}
                  doctor={doc}
                  selectedDoctors={selectedDoctors}
                  onCheckboxChange={handleCheckboxChange}
                  onHover={() => setActiveDoctorId(Number(doc.npi) || null)}
                  type="top3"
                />
              ))}
            </div>
            <div className="h-[300px] sm:h-auto rounded-xl overflow-hidden">
              <DoctorMap
                doctors={doctorsForMap}
                activeDoctorId={activeDoctorId}
                onDoctorSelect={(id) => {
                  setActiveDoctorId(id);
                  const element = document.getElementById(`doctor-${id}`);
                  if (element)
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Explore More Doctors */}
      <section className="w-full max-w-6xl z-10 mb-8 sm:mb-10">
        <h3
          className="text-2xl sm:text-3xl mb-4 text-center sm:text-left"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          Explore more doctors
        </h3>

        <div className="rounded-3xl shadow-lg space-y-3 p-4 sm:p-6 sm:space-y-4">
          {otherDoctors.map((doc) => (
            <DoctorCard
              key={doc.npi}
              doctor={doc}
              selectedDoctors={selectedDoctors}
              onCheckboxChange={handleCheckboxChange}
              onHover={() => setActiveDoctorId(Number(doc.npi) || null)}
              type="normal"
            />
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
