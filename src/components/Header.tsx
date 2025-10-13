"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [insuranceInput, setInsuranceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://smarterdoc-backend-1094971678787.us-central1.run.app/v1/search/doctors",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchInput,
            location: locationInput,
            insurance: insuranceInput,
          }),
        }
      );
      const data = await response.json();
      router.push(`/doctor?doctors=${encodeURIComponent(JSON.stringify(data.doctors))}`);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between w-full max-w-6xl mb-8 z-10">
      {/* Logo */}
      <div
        className="flex items-center cursor-pointer select-none"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="SmartDoc Logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <h1 className="text-2xl font-bold text-gray-800">SmarterDoc AI</h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center h-12 rounded-full border border-gray-300 bg-white shadow-sm px-6 py-2">
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Location"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 ml-4 border-l pl-4 border-gray-300"
        />
        <input
          type="text"
          placeholder="Insurance"
          value={insuranceInput}
          onChange={(e) => setInsuranceInput(e.target.value)}
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 ml-4 border-l pl-4 border-gray-300"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="flex items-center justify-center h-9 w-9 ml-4 bg-[#433C50] text-white p-2 rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
        >
          {isLoading ? (
            <i className="ri-loader-4-line animate-spin"></i>
          ) : (
            <i className="ri-search-line"></i>
          )}
        </button>
      </div>
    </header>
  );
}
