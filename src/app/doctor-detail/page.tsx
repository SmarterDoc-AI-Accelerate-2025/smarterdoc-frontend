"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doctor, setDoctor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const loadDoctorData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10">
      <Header />

      {/* Doctor Profile */}
      <section className="py-6 w-full max-w-6xl z-10 mb-10 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src={doctor.profile_picture_url || "/doctor.png"}
            alt={`${doctor.first_name} ${doctor.last_name}`}
            width={120}
            height={120}
            className="rounded-xl mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {doctor.first_name} {doctor.last_name}
            </h2>
            <p className="text-gray-500">{doctor.primary_specialty}</p>
            <div className="flex items-center text-yellow-500 mt-2">
              <i className="ri-star-fill"></i>
              <span className="ml-1 text-gray-700">
                {doctor.ratings?.[0]?.score ?? "N/A"} (
                {doctor.ratings?.[0]?.count ?? 0} reviews)
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              <i className="ri-map-pin-2-line mr-1 text-gray-400"></i>
              {doctor.address}
            </p>
          </div>
        </div>
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" className="mr-2" /> AI Appointment
        </label>
      </section>

      {/* Tabs */}
      <section className="w-full max-w-6xl z-10">
        <div className="flex items-center mb-4">
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
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#8C57FF] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i> {tab.label}
            </button>
          ))}
        </div>

        <div className="border-2 border-[#9D73F7] bg-white rounded-xl shadow-md p-6">
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
    </main>
  );
}
