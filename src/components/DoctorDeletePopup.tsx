/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

interface DoctorDeletePopupProps {
  doctor: any;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DoctorDeletePopup({
  doctor,
  onClose,
  onConfirm,
}: DoctorDeletePopupProps) {
  if (!doctor) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 shadow-lg text-center relative w-[520px] min-h-[280px] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 hover:opacity-70 transition"
          onClick={onClose}
          style={{ color: "var(--text-secondary)" }}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Title */}
        <h3
          className="text-lg sm:text-xl mb-6"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          Delete this Doctor Appointment?
        </h3>

        {/* Doctor Info */}
        <div className="flex items-center space-x-4 mb-8">
          <Image
            src={doctor.img || "/doctor.png"}
            alt={doctor.name}
            width={80}
            height={80}
            className="rounded-lg"
          />
          <div className="text-left">
            <h4
              className="text-base sm:text-lg"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              {doctor.name}
            </h4>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)", fontWeight: 400 }}
            >
              {doctor.specialty}
            </p>
            <div className="flex items-center text-yellow-500 text-sm mt-1">
              <i className="ri-star-fill"></i>
              <span
                className="ml-1"
                style={{ color: "var(--text-secondary)", fontWeight: 400 }}
              >
                {doctor.rating} ({doctor.reviews})
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md transition"
            style={{
              color: "var(--text-secondary)",
              fontWeight: 500,
              backgroundColor: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-md bg-red-500 hover:bg-red-600 transition text-white"
            style={{ fontWeight: 600 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
