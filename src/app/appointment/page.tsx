/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import Header from "@/components/Header";

export default function AppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birth: "",
    email: "",
    phone: "",
    gender: "",
    comment: "",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("selectedDoctors") || "[]");
    setDoctors(stored);
  }, []);

  const handleDeleteDoctor = (npi: string) => {
    const updated = doctors.filter((d) => d.npi !== npi);
    setDoctors(updated);
    localStorage.setItem("selectedDoctors", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select an available date and time.");
      return;
    }

    const payload = {
      doctors,
      appointmentTime: `${selectedDate.toDateString()} ${selectedTime}`,
      ...formData,
    };

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    try {
      setIsLoading(true);
      console.log(payload);

      if (isLocalhost) {
        setShowPopup(true);
      } else {
        const response = await fetch(
          "https://smarterdoc-backend-1094971678787.us-central1.run.app/api/v1/book/appointments",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) throw new Error("Failed to create appointment");
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Appointment booking failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push("/doctor");
  const closePopup = () => setShowPopup(false);

  const timeSlots = [
    "17:30",
    "17:45",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
    "19:00",
  ];

  return (
    <main className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <Header />

      <h2
        className="text-xl sm:text-2xl mb-6 text-center sm:text-left w-full max-w-6xl"
        style={{ color: "var(--text-primary)", fontWeight: 600 }}
      >
        Your Appointment
      </h2>

      {/* Doctor List */}
      <section className="w-full max-w-6xl z-10 mb-8 sm:mb-10 space-y-4">
        <h3
          className="mb-2 text-lg"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          Doctors
        </h3>
        {doctors.map((doc) => (
          <div
            key={doc.npi}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white rounded-xl shadow-md p-4 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Image
                src={doc.img}
                alt={doc.name}
                width={64}
                height={64}
                className="rounded-lg mb-3 sm:mb-0 sm:mr-4"
              />
              <div>
                <h4
                  className="text-base sm:text-lg"
                  style={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  {doc.name}
                </h4>
                <div className="flex items-center text-yellow-500 text-sm sm:text-base">
                  <i className="ri-star-fill"></i>
                  <span
                    className="ml-1"
                    style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                  >
                    {doc.rating} ({doc.reviews} reviews)
                  </span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                >
                  {doc.specialty}
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex justify-end">
              <button
                onClick={() => handleDeleteDoctor(doc.npi)}
                className="text-gray-400 hover:text-red-500"
              >
                <i className="ri-delete-bin-6-line text-xl"></i>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Available Time */}
      <section className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6 mb-10 z-10">
        <h3
          className="mb-4"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          Available Time
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inline
              className="rounded-md border border-gray-300"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <h4
              className="mb-2"
              style={{ color: "var(--text-primary)", fontWeight: 500 }}
            >
              Time Picker
            </h4>
            <div className="flex flex-col">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-md mb-2 transition-all text-sm font-medium border ${
                    selectedTime === time
                      ? "bg-[#A991FF] text-white shadow-md"
                      : "bg-[#F8F7FF] border-[#DDD] hover:bg-[#EEE]"
                  }`}
                  style={{
                    color:
                      selectedTime === time ? "white" : "var(--text-primary)",
                    fontWeight: selectedTime === time ? 600 : 500,
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Information Form */}
      <section className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8 sm:mb-10">
        <h3
          className="mb-4 text-lg"
          style={{ color: "var(--text-primary)", fontWeight: 600 }}
        >
          Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Legal first name"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Legal last name"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Date of birth"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full text-sm appearance-none"
            style={{
              color: "var(--text-primary)",
              fontWeight: 400,
              backgroundColor: "white",
            }}
            onChange={(e) =>
              setFormData({ ...formData, birth: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 400 }}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <input
          type="tel"
          placeholder="Phone Number"
          pattern="[0-9]{10,15}"
          className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full mb-4 text-sm"
          style={{ color: "var(--text-primary)", fontWeight: 400 }}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <div className="flex flex-wrap items-center mb-4 space-x-4">
          <label
            className="text-sm"
            style={{ color: "var(--text-primary)", fontWeight: 500 }}
          >
            Gender:
          </label>
          {["Male", "Female", "Others"].map((g) => (
            <label
              key={g}
              className="flex items-center space-x-1 text-sm"
              style={{ color: "var(--text-secondary)", fontWeight: 400 }}
            >
              <input
                type="radio"
                name="gender"
                value={g}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                required
              />
              <span>{g}</span>
            </label>
          ))}
        </div>

        <textarea
          placeholder="Write a comment..."
          className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full h-24 text-sm"
          style={{ color: "var(--text-primary)", fontWeight: 400 }}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
        ></textarea>
      </section>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end w-full max-w-6xl gap-3 sm:gap-4 z-10">
        <button
          onClick={handleAppointment}
          disabled={isLoading}
          className="w-full sm:w-auto cursor-pointer px-6 py-2 bg-[#5F72BE] text-white rounded-md hover:bg-[#433C50] transition disabled:opacity-50 font-medium"
        >
          {isLoading ? "Submitting..." : "Appointment"}
        </button>
        <button
          onClick={handleCancel}
          className="w-full sm:w-auto cursor-pointer px-6 py-2 bg-red-400 text-white rounded-md hover:bg-[#9b1c1c] transition font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center relative w-[90%] sm:w-[360px] h-auto sm:h-[260px] flex flex-col justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 hover:opacity-70 transition"
              onClick={closePopup}
              style={{ color: "var(--text-secondary)" }}
            >
              <i className="ri-close-line text-lg sm:text-xl"></i>
            </button>

            {/* Title */}
            <h3
              className="text-lg sm:text-xl mb-2"
              style={{ color: "var(--text-primary)", fontWeight: 600 }}
            >
              Appointment submitted!
            </h3>

            {/* Subtext */}
            <p
              className="mb-1 text-sm sm:text-base"
              style={{ color: "var(--text-secondary)", fontWeight: 400 }}
            >
              Our system is matching your details with top specialists.
            </p>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--text-secondary)", fontWeight: 400 }}
            >
              You&apos;ll get an update via email soon!
            </p>

            {/* Icon */}
            <div className="mt-4 sm:mt-6 flex justify-center">
              <i
                className="ri-check-double-line text-3xl sm:text-4xl"
                style={{ color: "#8C57FF" }}
              ></i>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
