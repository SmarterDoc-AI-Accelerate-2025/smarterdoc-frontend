"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockSpeciality from "@/data/mockSpeciality.json";
import mockInsurance from "@/data/mockInsurance.json";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smarterdoc-backend-1094971678787.us-central1.run.app";

export default function Header() {
  const router = useRouter();
  const [specialty, setSpecialty] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [insurance, setInsurance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [insuranceList, setInsuranceList] = useState<string[]>([]);
  const [hasSelectedDoctors, setHasSelectedDoctors] = useState(false);

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  useEffect(() => {
    const loadDropdowns = async () => {
      if (isLocalhost) {
        setSpecialtiesList(mockSpeciality);
        setInsuranceList(mockInsurance);
        return;
      }

      try {
        const [specialtiesRes, insuranceRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/search/specialties/from-bq`),
          fetch(`${API_URL}/api/v1/search/insurance-plans`),
        ]);
        if (specialtiesRes.ok) setSpecialtiesList(await specialtiesRes.json());
        if (insuranceRes.ok) setInsuranceList(await insuranceRes.json());
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    loadDropdowns();
  }, [isLocalhost]);

  useEffect(() => {
    const updateSelectedStatus = () => {
      const stored = JSON.parse(
        localStorage.getItem("selectedDoctors") || "[]"
      );
      setHasSelectedDoctors(stored.length > 0);
    };
    updateSelectedStatus();
    window.addEventListener("storage", updateSelectedStatus);
    return () => window.removeEventListener("storage", updateSelectedStatus);
  }, []);

  const handleSearch = async () => {
    if (!specialty.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/search/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty,
          insurance,
          location: locationInput,
          min_experience: 10,
          has_certification: true,
          limit: 20,
        }),
      });
      const data = await response.json();
      localStorage.setItem("doctorResults", JSON.stringify(data.doctors));
      router.push("/doctor");
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full max-w-6xl mb-8 z-10 gap-4 sm:gap-0">
      {/* Logo */}
      <div
        className="flex items-center justify-center sm:justify-start cursor-pointer select-none"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={28}
          height={28}
          className="mr-2"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          SmarterDoc AI
        </h1>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full border border-gray-300 bg-white shadow-sm rounded-xl sm:rounded-full px-4 sm:px-6 py-3 sm:py-2">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 min-w-[140px] sm:max-w-[180px] truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 appearance-none mb-2 sm:mb-0"
            title={specialty}
          >
            <option value="">Specialty</option>
            {specialtiesList.map((item, i) => (
              <option key={i} value={item} title={item}>
                {item.length > 30 ? `${item.slice(0, 30)}…` : item}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-t-0 sm:border-l border-gray-300 sm:ml-4 sm:pl-4 pt-2 sm:pt-0 mb-2 sm:mb-0"
          />

          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="flex-1 min-w-[140px] sm:max-w-[160px] truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-t-0 sm:border-l border-gray-300 sm:ml-4 sm:pl-4 appearance-none mb-2 sm:mb-0"
            title={insurance}
          >
            <option value="">Insurance</option>
            {insuranceList.map((plan, i) => (
              <option key={i} value={plan} title={plan}>
                {plan.length > 25 ? `${plan.slice(0, 25)}…` : plan}
              </option>
            ))}
          </select>

          <div className="flex justify-end sm:items-center sm:ml-4">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="cursor-pointer flex items-center justify-center h-9 w-9 bg-[#433C50] text-white rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-search-line"></i>
              )}
            </button>
          </div>
        </div>

        {/* Appointment Button */}
        <button
          onClick={() => hasSelectedDoctors && router.push("/appointment")}
          disabled={!hasSelectedDoctors}
          className={`w-full sm:w-auto flex items-center justify-center px-4 h-12 rounded-lg text-white font-medium shadow-md transition ${
            hasSelectedDoctors
              ? "bg-[#9D73F7] hover:bg-[#8A38F5] cursor-pointer"
              : "bg-[#8C57FF]/20 cursor-not-allowed"
          }`}
        >
          <i className="ri-health-book-line mr-2 text-lg"></i>
          Appointment
        </button>
      </div>
    </header>
  );
}
