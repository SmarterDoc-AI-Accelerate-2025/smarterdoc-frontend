"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import Header from "@/components/Header";

export default function AppointmentPage() {
  const router = useRouter();

  // Fake doctor list (could come from query or backend)
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Mark",
      rating: 4.9,
      reviews: 120,
      specialty: "Family Medicine",
      img: "/doctor.png",
    },
    {
      id: 2,
      name: "Dr. Mark",
      rating: 4.9,
      reviews: 120,
      specialty: "Family Medicine",
      img: "/doctor.png",
    },
    {
      id: 3,
      name: "Dr. Mark",
      rating: 4.9,
      reviews: 120,
      specialty: "Family Medicine",
      img: "/doctor.png",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birth: "",
    email: "",
    phone: "",
    gender: "",
    comment: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteDoctor = (id: number) => {
    setDoctors(doctors.filter((d) => d.id !== id));
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

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://smarterdoc-backend-1094971678787.us-central1.run.app/v1/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to create appointment");
      alert("Appointment successfully booked!");
      router.push("/doctor");
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push("/doctor");

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
    <main className="relative min-h-screen flex flex-col items-center px-6 py-10">
      <Header />

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 z-10">
        Your Appointment
      </h2>

      {/* Doctor List */}
      <section className="w-full max-w-6xl z-10 mb-10 space-y-4">
        <h3 className="font-semibold text-gray-700 mb-2">Doctors</h3>
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="flex justify-between items-center bg-white rounded-xl shadow-md p-4 border border-gray-100"
          >
            <div className="flex items-center">
              <Image
                src={doc.img}
                alt={doc.name}
                width={64}
                height={64}
                className="rounded-lg mr-4"
              />
              <div>
                <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                <div className="flex items-center text-yellow-500 text-sm">
                  <i className="ri-star-fill"></i>
                  <span className="ml-1 text-gray-700">
                    {doc.rating} ({doc.reviews} reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-500">{doc.specialty}</p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteDoctor(doc.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <i className="ri-delete-bin-6-line text-xl"></i>
            </button>
          </div>
        ))}
      </section>

      {/* Available Time */}
      <section className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6 mb-10 z-10">
        <h3 className="font-semibold text-gray-700 mb-4">Available Time</h3>
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
            <h4 className="font-medium text-gray-700 mb-2">Time Picker</h4>
            <div className="flex flex-col">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-md mb-2 transition-all text-sm font-medium border ${
                    selectedTime === time
                      ? "bg-[#A991FF] text-white shadow-md"
                      : "bg-[#F8F7FF] text-gray-700 border-[#DDD] hover:bg-[#EEE]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Information Form */}
      <section className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6 mb-10 z-10 text-gray-700 placeholder-gray-700">
        <h3 className="font-semibold text-gray-700 mb-4">Information</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Legal first name"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <input
            placeholder="Legal last name"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Date of birth"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, birth: e.target.value })
            }
          />
          <input
            placeholder="Email"
            className="border border-gray-300 rounded-md px-3 py-2 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <input
          placeholder="Phone Number"
          className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full mb-4"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="flex items-center mb-4 space-x-4">
          <label className="font-medium text-gray-700">Gender:</label>
          {["Male", "Female"].map((g) => (
            <label key={g} className="flex items-center space-x-1">
              <input
                type="radio"
                name="gender"
                value={g}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              />
              <span>{g}</span>
            </label>
          ))}
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="gender"
              value="Others"
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            />
            <span>Others</span>
          </label>
        </div>

        <textarea
          placeholder="Write a comment..."
          className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full h-24"
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
        ></textarea>
      </section>

      {/* Buttons */}
      <div className="flex justify-end w-full max-w-6xl gap-4 z-10">
        <button
          onClick={handleAppointment}
          disabled={isLoading}
          className="cursor-pointer px-6 py-2 bg-[#5F72BE] text-white rounded-md hover:bg-[#433C50] transition disabled:opacity-50"
        >
          Appointment
        </button>
        <button
          onClick={handleCancel}
          className="cursor-pointer px-6 py-2 bg-red-400 text-white rounded-md hover:bg-[#433C50] transition"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
