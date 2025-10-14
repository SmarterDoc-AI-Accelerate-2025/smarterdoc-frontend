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
      const response = await fetch(`${API_URL}/api/v1/search/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: searchInput,
          min_experience: 10,
          has_certification: true,
          limit: 20,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // ✅ Store in localStorage instead of query param
      localStorage.setItem("doctorResults", JSON.stringify(data.doctors));
      router.push("/doctor");
    } catch (error) {
      console.error("Error searching doctors:", error);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_query: "user_voice_query" }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // ✅ Save response to localStorage
      localStorage.setItem("doctorResults", JSON.stringify(data.doctors));
      router.push("/doctor");
    } catch (error) {
      console.error("Error with voice search:", error);
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

      <header className="flex items-center justify-start w-full max-w-5xl mb-12 z-10 cursor-pointer" onClick={() => router.push("/")}>
        <Image src="/logo.png" alt="SmartDoc Logo" width={32} height={32} className="mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">SmarterDoc AI</h1>
      </header>

      <section className="text-center mb-10 z-10">
        <h2 className="text-4xl font-bold mb-2" style={{ color: "#433C50" }}>
          Smart guidance to the right doctor
        </h2>
        <p className="text-gray-700" style={{ color: "#5F72BE" }}>
          We connect you with the best care — clearly, fairly, and personally.
        </p>
      </section>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl shadow-lg p-6 w-full max-w-4xl z-10 space-y-4">
        <div className="flex items-center h-14 w-full max-w-4xl rounded-[1vw] border border-gray-300 bg-white shadow-sm px-6 py-4 z-10">
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent ml-4 border-l pl-4 border-gray-300"
          />
          <input
            type="text"
            placeholder="Insurance"
            value={insuranceInput}
            onChange={(e) => setInsuranceInput(e.target.value)}
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent ml-4 border-l pl-4 border-gray-300"
          />
          <button
            onClick={handleTextSearch}
            disabled={isLoading}
            className="flex items-center justify-center h-9 w-9 ml-4 bg-[#433C50] text-white p-2 rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
          >
            {isLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-search-line"></i>}
          </button>
        </div>

        <div className="flex items-center h-14 w-full max-w-4xl rounded-[1vw] border border-gray-300 bg-white shadow-sm px-6 py-4 z-10">
          <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
          <input
            type="text"
            placeholder="Ask a question..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleQuestionSearch()}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          <button
            onClick={handleVoiceSearch}
            disabled={isLoading}
            className="cursor-pointer hover:bg-gray-100 text-gray-700 p-2 rounded-full transition-colors disabled:opacity-50"
          >
            {isLoading ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-mic-line text-xl"></i>}
          </button>
        </div>
      </div>

      <div className="absolute bottom-30 left-1/2 -translate-x-1/2 w-[260px] md:w-[320px] lg:w-[380px] z-10">
        <Image src="/robot.png" alt="Doctor robot" width={400} height={400} className="w-full h-auto" />
      </div>
    </main>
  );
}
