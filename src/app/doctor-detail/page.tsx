/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import DoctorAddedPopup from "@/components/DoctorAddedPopup";

export default function DoctorDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <i className="ri-loader-4-line animate-spin text-3xl text-purple-600"></i>
        </div>
      }
    >
      <DoctorDetailPageContent />
    </Suspense>
  );
}

function DoctorDetailPageContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("id");
  const [doctor, setDoctor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<any>(null);

  useEffect(() => {
    if (!doctorId) return;

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const loadDoctorData = async () => {
      try {
        let doctors: any[] = [];

        if (isLocalhost) {
          const data = await import("@/data/mockDoctors.json");
          doctors = data.default.doctors;
        } else {
          const storedDoctors = localStorage.getItem("doctorResults");
          if (storedDoctors) {
            doctors = JSON.parse(storedDoctors);
          }
        }

        const found = doctors.find((doc) => doc.npi === doctorId);
        setDoctor(found || null);
      } catch (error) {
        console.error("Error loading doctor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, [doctorId]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("selectedDoctors") || "[]");
    setSelectedDoctors(stored.map((d: any) => d.npi));
  }, []);

  const handleSelectDoctor = (checked: boolean) => {
    if (!doctor) return;

    const stored = JSON.parse(localStorage.getItem("selectedDoctors") || "[]");
    const doctorData = {
      npi: doctor.npi,
      name: `${doctor.first_name} ${doctor.last_name}`,
      specialty: doctor.primary_specialty,
      rating: doctor.ratings?.[0]?.score || "N/A",
      reviews: doctor.ratings?.[0]?.count || 0,
      img: doctor.profile_picture_url || "/doctor.png",
    };

    let updated;
    if (checked) {
      const exists = stored.some((d: any) => d.npi === doctor.npi);
      updated = exists ? stored : [...stored, doctorData];
      setSelectedDoctorInfo(doctorData);
      setShowPopup(true);
    } else {
      updated = stored.filter((d: any) => d.npi !== doctor.npi);
    }

    localStorage.setItem("selectedDoctors", JSON.stringify(updated));
    setSelectedDoctors(updated.map((d: any) => d.npi));
    window.dispatchEvent(new Event("storage"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <i className="ri-loader-4-line animate-spin text-3xl text-purple-600"></i>
      </div>
    );
  }

  if (!doctor) {
    return (
      <main className="flex items-center justify-center h-screen text-gray-600">
        <p>Doctor not found.</p>
      </main>
    );
  }

  const isSelected = selectedDoctors.includes(doctor.npi);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <Header />

      {/* Doctor Profile */}
      <section className="w-full max-w-6xl z-10 mb-10 bg-white border border-gray-200 rounded-3xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {/* Doctor info */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-0">
            <Image
              src={doctor.profile_picture_url || "/doctor.png"}
              alt={`${doctor.first_name} ${doctor.last_name}`}
              width={100}
              height={100}
              className="rounded-xl mb-4 sm:mb-0 sm:mr-6 object-cover"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {doctor.first_name} {doctor.last_name}
              </h2>
              <p className="text-gray-500">{doctor.primary_specialty}</p>
              <div className="flex items-center text-yellow-500 mt-2 text-sm sm:text-base">
                <i className="ri-star-fill"></i>
                <span className="ml-1 text-gray-700">
                  {doctor.ratings?.[0]?.score ?? "N/A"} (
                  {doctor.ratings?.[0]?.count ?? 0} reviews)
                </span>
              </div>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                <i className="ri-map-pin-2-line mr-1 text-gray-400"></i>
                {doctor.address}
              </p>
            </div>
          </div>

          {/* AI Appointment */}
          <label className="cursor-pointer flex items-center text-sm text-gray-600 justify-end sm:justify-start">
            <input
              type="checkbox"
              className="mr-2 cursor-pointer"
              checked={isSelected}
              onChange={(e) => handleSelectDoctor(e.target.checked)}
            />
            AI Appointment
          </label>
        </div>
      </section>

      {/* Tabs */}
      <section className="w-full max-w-6xl z-10">
        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "about", label: "About Doctor", icon: "ri-user-3-line" },
            {
              id: "education",
              label: "Education",
              icon: "ri-graduation-cap-line",
            },
            {
              id: "certifications",
              label: "Certifications",
              icon: "ri-medal-line",
            },
            {
              id: "publications",
              label: "Publications",
              icon: "ri-book-open-line",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-all ${
                activeTab === tab.id
                  ? "bg-[#8C57FF] text-white"
                  : "cursor-pointer text-gray-600 hover:bg-gray-100"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="border-2 border-[#9D73F7] bg-white rounded-xl shadow-md p-4 sm:p-6 text-sm sm:text-base">
          {activeTab === "about" && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Biography</h3>
              <p className="text-gray-600 mb-4">{doctor.bio}</p>

              <h3 className="font-semibold text-gray-700 mb-2">
                Testimonial Summary
              </h3>
              <p className="text-gray-600">{doctor.testimonial_summary_text}</p>
            </div>
          )}

          {activeTab === "education" && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Education</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {doctor.education?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">
                Hospitals
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {doctor.hospitals?.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "certifications" && (
            <div>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {doctor.certifications?.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "publications" && (
            <div>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {doctor.publications?.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
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
