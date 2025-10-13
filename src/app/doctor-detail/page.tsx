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
  const [doctor, setDoctor] = useState<any>();
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setDoctor({
        name: "Dr. Mark",
        specialty: "Family Medicine",
        rating: 4.2,
        reviews: 424,
        address: "120 Hobart St · Utica, NY 13501",
        insurance: "CareOregon",
        img: "/doctor.png",
      });
      setIsLoading(false);
      return;
    }

    const fetchDoctorDetail = async () => {
      try {
        const response = await fetch(
          `https://smarterdoc-backend-1094971678787.us-central1.run.app/v1/doctors/${doctorId}`
        );
        if (!response.ok) throw new Error("Failed to fetch doctor data");
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor detail:", error);
        setDoctor({
          name: "Dr. Mark",
          specialty: "Family Medicine",
          rating: 4.2,
          reviews: 424,
          address: "120 Hobart St · Utica, NY 13501",
          insurance: "CareOregon",
          img: "/doctor.png",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorDetail();
  }, [doctorId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <i className="ri-loader-4-line animate-spin text-3xl text-purple-600"></i>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10">
      {/* Background */}
      <Image
        src="/homebg.png"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
      />

      <Header />

      {/* Doctor Profile Card */}
      <section className="backdrop-blur-md bg-white/70 rounded-3xl shadow-lg p-6 w-full max-w-6xl z-10 mb-10 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src={doctor.img || "/doctor.png"}
            alt={doctor.name}
            width={120}
            height={120}
            className="rounded-xl mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-gray-500">{doctor.specialty}</p>
            <div className="flex items-center text-yellow-500 mt-2">
              <i className="ri-star-fill"></i>
              <span className="ml-1 text-gray-700">
                {doctor.rating} ({doctor.reviews})
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              <i className="ri-map-pin-2-line mr-1 text-gray-400"></i>
              {doctor.address}
            </p>
            <p className="text-gray-500 mt-1">
              <i className="ri-hospital-line mr-1 text-gray-400"></i>
              {doctor.insurance}
            </p>
          </div>
        </div>
        <button className="bg-[#5F72BE] hover:bg-[#433C50] text-white px-6 py-2 rounded-full font-medium transition">
          Appointment
        </button>
      </section>

      {/* Biography / Review / Qualification Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-10 z-10">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-700 mb-2">Biography</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Feel better about finding healthcare. Feel confident that our
            AI-recommended doctors match your personal needs and preferences.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-700 mb-2">Review</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            “Dr. Mark was amazing! The consultation was thorough, and I felt
            very supported throughout my care journey.”
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-700 mb-2">Qualification</h3>
          <ul className="text-gray-500 text-sm list-disc list-inside space-y-1">
            <li>Doctor of Dental Surgery (DDS)</li>
            <li>Degree from the University of Madayana</li>
          </ul>
        </div>
      </section>

      {/* Tab Section */}
      <section className="w-full max-w-6xl z-10">
        <div className="flex items-center space-x-4 mb-4 border-b border-gray-200">
          {[
            { id: "about", label: "About Doctor", icon: "ri-user-3-line" },
            {
              id: "education",
              label: "Education",
              icon: "ri-graduation-cap-line",
            },
            { id: "insurance", label: "Insurance", icon: "ri-bank-card-line" },
            { id: "locations", label: "Locations", icon: "ri-map-pin-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#5F72BE] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "about" && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Specialty</h4>
              <p className="text-gray-600 mb-4">Rheumatology Specialist</p>
              <h4 className="font-semibold text-gray-700 mb-2">Language</h4>
              <p className="text-gray-600 mb-4">English, Spanish</p>
              <h4 className="font-semibold text-gray-700 mb-2">
                Clinical Experience
              </h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                <li>
                  2015–2019: Attending Physician, Department of Rheumatology,
                  City University Medical Center.
                </li>
                <li>
                  2019–2022: Senior Clinical Research Physician, National
                  Institute of Immunology.
                </li>
                <li>
                  2022–Present: Director, Connective Tissue Clinic, National
                  University Hospital.
                </li>
              </ul>
              <h4 className="font-semibold text-gray-700 mt-4 mb-1">Gender</h4>
              <p className="text-gray-600">Female</p>
            </div>
          )}

          {activeTab === "education" && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Education</h4>
              <p className="text-gray-600 mb-4">
                Doctor of Dental Surgery (DDS)
              </p>
              <h4 className="font-semibold text-gray-700 mb-2">Publications</h4>
              <p className="text-gray-600 mb-4">
                Authored 5+ research papers in international journals on
                autoimmune disorders and connective tissue diseases.
              </p>
              <h4 className="font-semibold text-gray-700 mb-2">
                Certification
              </h4>
              <p className="text-gray-600">
                Licensed Medical Practitioner — USA, Canada
              </p>
            </div>
          )}

          {activeTab === "insurance" && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Insurance Accepted
              </h4>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>Aetna</li>
                <li>Blue Cross</li>
                <li>Cigna</li>
                <li>United Healthcare</li>
              </ul>
            </div>
          )}

          {activeTab === "locations" && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Clinic Locations
              </h4>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>120 Hobart St · Utica, NY 13501</li>
                <li>50 Main St · Utica, NY 13501</li>
                <li>80 Broad St · Utica, NY 13501</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
