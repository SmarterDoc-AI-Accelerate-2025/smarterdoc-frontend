"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smarterdoc-backend-1094971678787.us-central1.run.app";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [insuranceInput, setInsuranceInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTextSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/search/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchInput,
          location: locationInput,
          insurance: insuranceInput,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to doctor page with the data
      router.push(`/doctor?doctors=${encodeURIComponent(JSON.stringify(data.doctors))}`);
    } catch (error) {
      console.error("Error searching doctors:", error);
      // Fallback: navigate to doctor page with empty data
      router.push("/doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/search/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voice_query: "user_voice_query", // placeholder
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to doctor page with the data
      router.push(`/doctor?doctors=${encodeURIComponent(JSON.stringify(data.doctors))}`);
    } catch (error) {
      console.error("Error with voice search:", error);
      // Fallback: navigate to doctor page with empty data
      router.push("/doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSearch = () => {
    if (questionInput.trim()) {
      setSearchInput(questionInput);
      handleTextSearch();
    }
  };

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <div className="flex items-center flex-1 min-w-[60px]">
          <i className="ri-map-pin-line text-gray-400 mr-2"></i>
          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <div className="flex items-center flex-1 min-w-[60px]">
          <i className="ri-shield-check-line text-gray-400 mr-2"></i>
          <input
            type="text"
            placeholder="Insurance"
            value={insuranceInput}
            onChange={(e) => setInsuranceInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        
        <button 
          onClick={handleTextSearch}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <i className="ri-loader-4-line animate-spin text-xl"></i>
          ) : (
            <i className="ri-arrow-right-line text-xl"></i>
          )}
        </button>
      </div>

      {/* Search Row 2 - Single question input */}
      <div className="flex items-center w-full max-w-4xl rounded-full border border-gray-300 bg-white shadow-sm px-6 py-4 z-10">
        <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
        <input
          type="text"
          placeholder="Ask a question..."
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuestionSearch()}
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
        <button 
          onClick={handleVoiceSearch}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-colors ml-2 disabled:opacity-50"
        >
          {isLoading ? (
            <i className="ri-loader-4-line animate-spin text-xl"></i>
          ) : (
            <i className="ri-mic-line text-xl"></i>
          )}
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