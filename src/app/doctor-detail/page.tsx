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
      <section className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center w-full max-w-6xl z-10 mb-10 bg-white rounded-3xl">
        <label
          className="absolute top-10 right-4 flex items-center text-sm"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="mr-2 w-4 h-4 accent-[#9D73F7]"
            checked={isSelected}
            onChange={(e) => handleSelectDoctor(e.target.checked)}
          />
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
            AI Appointment
          </span>
        </label>
        {/* Doctor Image */}
        <div className="flex-shrink-0 rounded-xl overflow-hidden mb-3 sm:mb-0 sm:mr-5 w-full sm:w-[160px] h-[180px] sm:h-[160px] bg-gray-100">
          <Image
            src={doctor.profile_picture_url || "/doctor.png"}
            alt={`${doctor.first_name} ${doctor.last_name}`}
            width={160}
            height={160}
            className="object-cover w-full h-full"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            priority={false}
          />
        </div>
        {/* Doctor Info */}
        <div className="flex-1 flex flex-col justify-center space-y-2 sm:space-y-3">
          {/* Name */}
          <h3
            className="text-lg sm:text-xl"
            style={{ color: "var(--text-primary)", fontWeight: 600 }}
          >
            Dr. {doctor.first_name} {doctor.last_name}
          </h3>

          {/* Specialty */}
          <p
            className="text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
          >
            {doctor.primary_specialty}
          </p>

          {/* Rating Section */}
          <div className="flex items-center text-xs my-1 space-x-1">
            <i className="ri-star-fill text-yellow-500 text-sm relative top-[1px]"></i>
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {doctor.ratings?.[0]?.score ?? "N/A"}
            </span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              ({doctor.ratings?.[0]?.count ?? 0} reviews)
            </span>
          </div>

          {/* Address */}
          <p
            className="flex items-center text-xs"
            style={{ color: "var(--text-secondary)", fontWeight: 400 }}
          >
            <i className="ri-map-pin-2-line text-[#5F72BE] text-sm relative top-[1px] mr-1"></i>
            <span>{doctor.address}</span>
          </p>
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
              className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#8C57FF] text-white"
                  : "cursor-pointer hover:bg-gray-100"
              }`}
              style={{
                color: activeTab === tab.id ? "white" : "var(--text-primary)",
                fontWeight: activeTab === tab.id ? 600 : 500,
              }}
            >
              <i className={`${tab.icon} mr-2 text-base`}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="border-2 border-[#9D73F7] bg-white rounded-xl shadow-md p-4 sm:p-6 text-sm sm:text-base">
          {activeTab === "about" && (
            <div>
              <h3
                className="mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Biography
              </h3>
              <p
                className="mb-4 leading-relaxed"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {doctor.bio}
              </p>

              <h3
                className="mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Testimonial Summary
              </h3>
              <p style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                {doctor.testimonial_summary_text}
              </p>
            </div>
          )}

          {activeTab === "education" && (
            <div>
              <h3
                className="mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Education
              </h3>
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {doctor.education?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3
                className="mt-4 mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Hospitals
              </h3>
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {doctor.hospitals?.map((h: string, i: number) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "certifications" && (
            <div>
              <h3
                className="mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Certifications
              </h3>
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {doctor.certifications?.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "publications" && (
            <div>
              <h3
                className="mb-2 text-base"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Publications
              </h3>
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
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
