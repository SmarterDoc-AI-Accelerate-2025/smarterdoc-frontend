"use client";
import { useEffect, useState } from "react";

// For client-side, we'll use the same environment variable approach
// but with a fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smarterdoc-backend-1094971678787.us-central1.run.app';

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">{message || "Loading..."}</h1>
    </main>
  );
}