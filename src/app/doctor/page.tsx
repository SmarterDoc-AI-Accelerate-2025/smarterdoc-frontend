"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import DoctorMap from "@/components/DoctorMap";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  address: string;
  lat: number;
  lng: number;
  time: string;
  img: string;
  insurance_accepted?: string[];
}

const defaultDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Mark Johnson",
    specialty: "Family Medicine",
    rating: 4.2,
    reviews: 424,
    address: "120 Hobart St · Utica, NY 13501",
    lat: 43.1009,
    lng: -75.2327,
    time: "16 minutes",
    img: "/doctor.png",
    insurance_accepted: ["Aetna", "Blue Cross", "Cigna"],
  },
  {
    id: 2,
    name: "Dr. Lisa Chen",
    specialty: "Dermatology",
    rating: 4.6,
    reviews: 320,
    address: "50 Main St · Utica, NY 13501",
    lat: 43.1059,
    lng: -75.2301,
    time: "20 minutes",
    img: "/doctor.png",
    insurance_accepted: ["Aetna", "United Healthcare"],
  },
  {
    id: 3,
    name: "Dr. Kevin Rodriguez",
    specialty: "Pediatrics",
    rating: 4.8,
    reviews: 285,
    address: "80 Broad St · Utica, NY 13501",
    lat: 43.1021,
    lng: -75.2408,
    time: "10 minutes",
    img: "/doctor.png",
    insurance_accepted: ["Blue Cross", "Medicaid"],
  },
];

function DoctorPageContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const doctorsParam = searchParams.get("doctors");
    try {
      if (doctorsParam) {
        const parsed = JSON.parse(decodeURIComponent(doctorsParam));
        setDoctors(Array.isArray(parsed) ? parsed : parsed.doctors || []);
      } else {
        setDoctors(defaultDoctors);
      }
    } catch (err) {
      console.error("Failed to parse doctor data:", err);
      setDoctors(defaultDoctors);
    }
  }, [searchParams]);

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

      {/* Recommended Doctors */}
      <section className="backdrop-blur-md bg-white/60 rounded-3xl shadow-lg p-6 w-full max-w-6xl z-10 mb-10">
        <h2 className="text-xl font-semibold text-[#433C50] mb-4">
          Your {doctors.length} specially{" "}
          <span className="text-[#5F72BE]">AI-recommended</span> doctors
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <Image
                  src={doc.img || "/doctor.png"}
                  alt={doc.name}
                  width={80}
                  height={80}
                  className="rounded-full mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.specialty}</p>
                  <div className="flex items-center text-yellow-500 text-sm my-1">
                    <i className="ri-star-fill"></i>
                    <span className="ml-1 text-gray-700">
                      {doc.rating} ({doc.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{doc.address}</p>
                  <p className="text-sm text-gray-500">
                    Insurance: {doc.insurance_accepted?.join(", ")}
                  </p>
                </div>
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="mr-2" /> AI Appointment
                </label>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden">
            <DoctorMap doctors={doctors} />
          </div>
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
