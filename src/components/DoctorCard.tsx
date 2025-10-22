"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface Rating {
  source: string;
  score: number;
  count: number;
  link: string;
}

export interface Doctor {
  npi: string;
  first_name: string;
  last_name: string;
  primary_specialty: string;
  ratings: Rating[];
  address: string;
  latitude: number;
  longitude: number;
  profile_picture_url: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  selectedDoctors: string[];
  onCheckboxChange: (doctor: Doctor) => void;
  type?: "top3" | "normal";
  onHover?: () => void;
}

export default function DoctorCard({
  doctor,
  selectedDoctors,
  onCheckboxChange,
  onHover,
  type = "normal",
}: DoctorCardProps) {
  const getRatingInfo = (ratings: Rating[]) => {
    if (!ratings || ratings.length === 0) return { score: "N/A", count: 0 };
    const topSource = ratings[0];
    return { score: topSource.score, count: topSource.count };
  };

  const { score, count } = getRatingInfo(doctor.ratings);
  const formattedCount =
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  // --- Top 3 Doctor Card ---
  if (type === "top3") {
    return (
      <Link
        href={`/doctor-detail?id=${doctor.npi}`}
        key={doctor.npi}
        id={`doctor-${doctor.npi}`}
        onMouseEnter={onHover}
        onMouseLeave={() => onHover && onHover()}
        className="cursor-pointer relative flex flex-col sm:flex-row bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* AI Appointment Checkbox */}
        <label
          className="absolute top-4 right-4 flex items-center text-sm"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="mr-2 w-4 h-4 accent-[#9D73F7]"
            checked={selectedDoctors.includes(doctor.npi)}
            onChange={() => onCheckboxChange(doctor)}
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
        <div className="flex-1 flex flex-col justify-center space-y-1.5 sm:space-y-2">
          <h3
            className="text-base sm:text-lg"
            style={{ color: "var(--text-primary)", fontWeight: 500 }}
          >
            {doctor.first_name} {doctor.last_name}
          </h3>

          <p
            className="text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
          >
            {doctor.primary_specialty}
          </p>

          <div className="flex items-center text-xs my-1 space-x-1">
            <i className="ri-star-fill text-yellow-500 text-sm relative top-[1px]"></i>
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {score}
            </span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              ({count} reviews)
            </span>
          </div>

          <p
            className="flex items-center text-xs"
            style={{ color: "var(--text-secondary)", fontWeight: 400 }}
          >
            <i className="ri-map-pin-2-line text-[#5F72BE] text-sm relative top-[1px] mr-1"></i>
            <span>{doctor.address}</span>
          </p>
        </div>
      </Link>
    );
  }

  // --- Normal Doctor Card ---
  return (
    <Link
      href={`/doctor-detail?id=${doctor.npi}`}
      key={doctor.npi}
      id={`doctor-${doctor.npi}`}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover && onHover()}
      className="relative flex flex-col sm:flex-row items-center bg-[#F9F9FB] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-200"
    >
      {/* AI Appointment Checkbox */}
      <label
        className="absolute top-4 right-4 flex items-center text-sm"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="mr-2 w-4 h-4 accent-[#9D73F7]"
          checked={selectedDoctors.includes(doctor.npi)}
          onChange={() => onCheckboxChange(doctor)}
        />
        <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
          AI Appointment
        </span>
      </label>

      {/* Doctor Image */}
      <div className="flex-shrink-0 rounded-xl overflow-hidden mr-4 w-[70px] h-[70px] bg-gray-100">
        <Image
          src={doctor.profile_picture_url || "/doctor.png"}
          alt={`${doctor.first_name} ${doctor.last_name}`}
          width={70}
          height={70}
          className="object-cover w-full h-full"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          priority={false}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 w-full gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-1">
          {/* Name and Rating */}
          <div className="flex flex-col sm:w-[180px]">
            <h3
              className="text-sm sm:text-sm"
              style={{ color: "var(--text-primary)", fontWeight: 500 }}
            >
              Dr. {doctor.first_name} {doctor.last_name}
            </h3>
            <div className="flex items-center mt-1">
              <i className="ri-star-fill text-yellow-500 mr-1 text-base"></i>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)", fontWeight: 500 }}
              >
                {score}
              </span>
              <span
                className="text-xs ml-2"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {formattedCount} Reviews
              </span>
            </div>
          </div>

          {/* Specialty */}
          <div
            className="text-xs sm:w-[160px]"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
          >
            {doctor.primary_specialty}
          </div>

          {/* Address */}
          <div
            className="flex items-center text-sm sm:w-[400px]"
            style={{ color: "var(--text-secondary)", fontWeight: 400 }}
          >
            <span>{doctor.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
