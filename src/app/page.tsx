"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smarterdoc-backend-1094971678787.us-central1.run.app";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <Image
        src="/homebg.png"
        alt="Background gradient"
        fill
        priority
        className="object-cover z-0"
      />

      {/* Header */}
      <header className="flex items-center justify-start w-full max-w-5xl mb-12 z-10">
        <i className="ri-hearts-fill text-3xl text-purple-600 mr-2"></i>
        <h1 className="text-2xl font-bold text-gray-800">SmartDoc</h1>
      </header>

      {/* Title */}
      <section className="text-center mb-10 z-10">
        <h2 className="text-4xl font-bold text-purple-700 mb-2">
          Smart guidance to the right doctor
        </h2>
        <p className="text-gray-700">
          We connect you with the best care — clearly, fairly, and personally.
        </p>
      </section>

      {/* Search Row 1 - Horizontal layout with labels */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-4xl mb-6 z-10 bg-white rounded-full border border-gray-300 shadow-sm px-6 py-4">
        <div className="flex items-center flex-1 min-w-[60px]">
          <i className="ri-search-line text-gray-400 mr-2"></i>
          <input
            type="text"
            placeholder="Search"
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <div className="flex items-center flex-1 min-w-[60px]">
          <i className="ri-map-pin-line text-gray-400 mr-2"></i>
          <input
            type="text"
            placeholder="Location"
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <div className="flex items-center flex-1 min-w-[60px]">
          <i className="ri-shield-check-line text-gray-400 mr-2"></i>
          <input
            type="text"
            placeholder="Insurance"
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-colors">
          <i className="ri-arrow-right-line text-xl"></i>
        </button>
      </div>

      {/* Search Row 2 - Single question input */}
      <div className="flex items-center w-full max-w-4xl rounded-full border border-gray-300 bg-white shadow-sm px-6 py-4 z-10">
        <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
        <input
          type="text"
          placeholder="Ask a question..."
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
        <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-colors ml-2">
          <i className="ri-mic-line text-xl"></i>
        </button>
      </div>

      {/* Robot image */}
      <div className="absolute bottom-30 left-1/2 -translate-x-1/2 w-[260px] md:w-[320px] lg:w-[380px] z-10">
        <Image
          src="/robot.png"
          alt="Doctor robot"
          width={400}
          height={400}
          className="w-full h-auto"
        />
      </div>

    </main>
  );
}