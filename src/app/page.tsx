"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockSpeciality from "@/data/mockSpeciality.json";
import mockInsurance from "@/data/mockInsurance.json";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smarterdoc-backend-1094971678787.us-central1.run.app";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default function Home() {
  const [specialty, setSpecialty] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [insurance, setInsurance] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const router = useRouter();

  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const float32ToInt16 = (buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  };

  useEffect(() => {
    localStorage.removeItem("selectedDoctors");
    window.dispatchEvent(new Event("storage"));
  }, []);

  const handleTextSearch = async () => {
    if (!specialty.trim() && !questionInput.trim()) return;
    setIsLoading(true);

    try {
      const query =
        questionInput.trim() ||
        `Find a top-rated ${specialty || "doctor"} nearby`;

      const response = await fetch(`${API_URL}/api/v1/search/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, query }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

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
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const proto = API_URL.startsWith("https") ? "wss:" : "ws:";
      const wsUrl = `${proto}//${
        new URL(API_URL).host
      }/api/v1/speech/stream/websocket?language_code=en-US&sample_rate=16000`;

      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      websocket.onopen = async () => {
        setIsRecording(true);
        const AudioCtx = window.AudioContext || window.webkitAudioContext;

        const audioContext = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (websocket.readyState === WebSocket.OPEN) {
            const float32 = event.inputBuffer.getChannelData(0);
            const int16 = float32ToInt16(float32);
            websocket.send(int16.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      websocket.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          if (result.transcript && result.is_final) {
            const text = result.transcript.trim();
            setQuestionInput(text);
          }
        } catch (err) {
          console.error("Speech parse error:", err);
        }
      };

      websocket.onerror = (err) => {
        console.error("WebSocket error:", err);
        stopVoiceRecording();
      };

      websocket.onclose = stopVoiceRecording;
    } catch (error) {
      console.error("Error starting voice recognition:", error);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    try {
      websocketRef.current?.close();
      processorRef.current?.disconnect();
      audioContextRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.error("Error stopping voice recording:", e);
    } finally {
      websocketRef.current = null;
      audioContextRef.current = null;
      processorRef.current = null;
      streamRef.current = null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16 relative">
      <Image
        src="/homebg.png"
        alt="Background gradient"
        fill
        priority
        className="object-cover z-0"
      />

      <header
        className="flex items-center justify-center sm:justify-start w-full max-w-5xl mb-10 sm:mb-12 z-10 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="relative w-8 h-8 mr-2">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          SmarterDoc AI
        </h1>
      </header>

      <section className="text-center mb-8 sm:mb-10 z-10 px-2">
        <h2
          className="text-2xl sm:text-4xl font-bold mb-2"
          style={{ color: "#433C50" }}
        >
          Smart guidance to the right doctor
        </h2>
        <p className="text-base sm:text-lg" style={{ color: "#5F72BE" }}>
          We connect you with the best care — clearly, fairly, and personally.
        </p>
      </section>

      <div className="backdrop-blur-md bg-white/40 rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-4xl z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:h-14 border border-gray-300 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 rounded-[1vw]">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 appearance-none w-full"
          >
            <option value="">Specialty</option>
            {mockSpeciality.map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-l sm:border-t-0 border-gray-300 sm:ml-4 sm:pl-4 pt-3 sm:pt-0 w-full"
          />

          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-l sm:border-t-0 border-gray-300 sm:ml-4 sm:pl-4 w-full"
          >
            <option value="">Insurance</option>
            {mockInsurance.map((plan, i) => (
              <option key={i} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:h-14 border border-gray-300 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 rounded-[1vw]">
          <div className="flex items-center flex-1 w-full">
            <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
            <input
              type="text"
              placeholder="Ask a question..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>

          <div className="flex items-center sm:ml-4 gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleVoiceSearch}
              disabled={isLoading}
              className={`p-2 sm:p-3 rounded-full transition ${
                isRecording
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              <i
                className={
                  isRecording ? "ri-mic-fill text-xl" : "ri-mic-line text-xl"
                }
              ></i>
            </button>

            <button
              onClick={handleTextSearch}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 bg-[#433C50] text-white rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
              title="Search"
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-search-line"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-14 w-[220px] sm:w-[320px] z-10">
        <Image
          src="/robot.png"
          alt="Doctor robot"
          width={400}
          height={400}
          className="mx-auto object-contain"
        />
      </div>
    </main>
  );
}
