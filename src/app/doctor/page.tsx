"use client";
import React from "react";
import Image from "next/image";
import DoctorMap from "@/components/DoctorMap";

export default function DoctorPage() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Mark",
      specialty: "Family Medicine",
      rating: 4.2,
      reviews: 424,
      address: "120 Hobart St · Utica, NY 13501",
      lat: 43.1009,
      lng: -75.2327,
      time: "16 minutes",
      img: "/doctor.png",
    },
    {
      id: 2,
      name: "Dr. Lisa",
      specialty: "Dermatology",
      rating: 4.6,
      reviews: 320,
      address: "50 Main St · Utica, NY 13501",
      lat: 43.1059,
      lng: -75.2301,
      time: "20 minutes",
      img: "/doctor.png",
    },
    {
      id: 3,
      name: "Dr. Kevin",
      specialty: "Pediatrics",
      rating: 4.8,
      reviews: 285,
      address: "80 Broad St · Utica, NY 13501",
      lat: 43.1021,
      lng: -75.2408,
      time: "10 minutes",
      img: "/doctor.png",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <i className="ri-hearts-fill text-3xl text-purple-600"></i>
          <h1 className="text-2xl font-bold text-gray-800">Hackathon</h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search"
            className="rounded-full border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Location"
            className="rounded-full border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Insurance"
            className="rounded-full border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full">
            <i className="ri-search-line text-lg"></i>
          </button>
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {["Ranking", "Distance", "Time", "Insurance"].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100 text-sm font-medium"
          >
            {filter} <i className="ri-arrow-down-s-line"></i>
          </button>
        ))}
      </div>

      {/* Recommended Section */}
      <section className="bg-purple-50 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-purple-600 mb-3">
          Your 3 specially AI-recommended doctors.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <Image
                  src={doc.img}
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
                      {doc.rating} ({doc.reviews})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{doc.address}</p>
                  <p className="text-sm text-gray-400">{doc.time}</p>
                </div>
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="mr-2" /> Agent book
                </label>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
            <DoctorMap doctors={doctors} />
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Explore more doctors
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <Image
                src={doc.img}
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
                    {doc.rating} ({doc.reviews})
                  </span>
                </div>
                <p className="text-sm text-gray-600">{doc.address}</p>
                <p className="text-sm text-gray-400">{doc.time}</p>
              </div>
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" /> Agent book
              </label>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
