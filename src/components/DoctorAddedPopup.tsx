/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";
import Image from "next/image";

interface DoctorAddedPopupProps {
  doctor: any;
  onClose: () => void;
}

export default function DoctorAddedPopup({
  doctor,
  onClose,
}: DoctorAddedPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!doctor) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 shadow-lg text-center relative w-[520px] h-[240px] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={onClose}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-8">
          Added for your Appointment!
        </h3>

        <div className="flex items-center space-x-4">
          <Image
            src={doctor.img || "/doctor.png"}
            alt={doctor.name}
            width={80}
            height={80}
            className="rounded-lg"
          />
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
            <p className="text-gray-600 text-sm">{doctor.specialty}</p>
            <div className="flex items-center text-yellow-500 text-sm mt-1">
              <i className="ri-star-fill"></i>
              <span className="ml-1 text-gray-700">
                {doctor.rating} ({doctor.reviews})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
