"use client";
import { useState, useEffect } from "react";

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
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex flex-col items-center px-4 py-16">
      {/* Header */}
      <header className="flex items-center justify-start w-full max-w-5xl mb-12">
        <i className="ri-hearts-fill text-3xl text-purple-600 mr-2"></i>
        <h1 className="text-2xl font-bold text-gray-800">Hackathon</h1>
      </header>

      {/* Title */}
      <section className="text-center mb-10">
        <h2 className="text-4xl font-bold text-purple-700 mb-2">
          Smart guidance to the right doctor
        </h2>
        <p className="text-gray-700">
          We connect you with the best care — clearly, fairly, and personally.
        </p>
      </section>

      {/* Search Row 1 */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-6">
        <input
          type="text"
          placeholder="Search"
          className="flex-1 min-w-[150px] rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <input
          type="text"
          placeholder="Location"
          className="flex-1 min-w-[150px] rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <input
          type="text"
          placeholder="Insurance"
          className="flex-1 min-w-[150px] rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <button className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-md">
          <i className="ri-search-line text-xl"></i>
        </button>
      </div>

      {/* Search Row 2 */}
      <div className="flex items-center w-full max-w-4xl rounded-full border border-gray-300 bg-white shadow-sm px-4 py-3">
        <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
        <input
          type="text"
          placeholder="Ask a question..."
          className="flex-1 outline-none text-gray-700"
        />
        <button className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-md">
          <i className="ri-mic-line text-xl"></i>
        </button>
      </div>

      {/* Backend connectivity test */}
      <p className="text-sm text-gray-500 mt-8">
        {message ? `Backend says: ${message}` : "Loading backend connection..."}
      </p>
    </main>
  );
}
