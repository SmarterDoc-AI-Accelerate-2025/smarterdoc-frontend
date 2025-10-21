"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockSpeciality from "@/data/mockSpeciality.json";
import mockInsurance from "@/data/mockInsurance.json";

// SpeechRecognition setup
type SpeechRecognitionConstructor =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    webkitAudioContext: typeof AudioContext;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smarterdoc-backend-1094971678787.us-central1.run.app";

export default function Home() {
  const [specialty, setSpecialty] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [insurance, setInsurance] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [, setFinalTranscript] = useState("");
  const [, setInterimTranscript] = useState("");
  const finalRef = useRef<string>("");
  const router = useRouter();

  // WebSocket and audio refs
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Convert Float32Array to Int16Array (LINEAR16 PCM)
  const float32ToInt16 = (buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  };

  // Clear local selection state on load
  useEffect(() => {
    localStorage.removeItem("selectedDoctors");
    window.dispatchEvent(new Event("storage"));
  }, []);

  // Cleanup audio if recording
  useEffect(() => {
    return () => {
      if (isRecording) stopVoiceRecording();
    };
  }, [isRecording]);

  /** -----------------------------
   * 🔍 Handle Text Search (AI-powered)
   * ----------------------------- */
  const handleTextSearch = async () => {
    if (!specialty.trim()) return;
    setIsLoading(true);

    try {
      const queryParts: string[] = [];

      if (questionInput.trim()) queryParts.push(questionInput.trim());
      if (locationInput.trim()) queryParts.push(`in ${locationInput}`);
      if (insurance.trim()) queryParts.push(`who accepts ${insurance}`);

      const query =
        queryParts.length > 0
          ? queryParts.join(", ")
          : `Find a top-rated ${specialty} doctor`;

      const response = await fetch(`${API_URL}/api/v1/search/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, query }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

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

  /** -----------------------------
   * 🎤 Voice Search (WebSocket streaming)
   * ----------------------------- */
  const handleVoiceSearch = async () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 },
      });

      const proto = API_URL.startsWith("https") ? "wss:" : "ws:";
      const wsUrl = `${proto}//${
        new URL(API_URL).host
      }/api/v1/speech/stream/websocket?language_code=en-US&sample_rate=16000`;

      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      websocket.onopen = async () => {
        setIsRecording(true);
        setTranscript("");
        finalRef.current = "";

        const AudioCtx: typeof AudioContext =
          window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const streamSource = audioContext.createMediaStreamSource(stream);
        streamSourceRef.current = streamSource;
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (websocket.readyState === WebSocket.OPEN) {
            const int16Data = float32ToInt16(e.inputBuffer.getChannelData(0));
            websocket.send(int16Data.buffer);
          }
        };

        streamSource.connect(processor);
        processor.connect(audioContext.destination);
      };

      websocket.onmessage = (event) => {
        const result = JSON.parse(event.data);
        if (result.transcript) {
          const chunk = result.transcript.trim();
          if (result.is_final) {
            finalRef.current += ` ${chunk}`;
            setTranscript(finalRef.current.trim());
            setQuestionInput(finalRef.current.trim());
          } else {
            setTranscript(`${finalRef.current} ${chunk}`);
          }
        }
      };

      websocket.onerror = (err) => {
        console.error("WebSocket error:", err);
        stopVoiceRecording();
      };

      websocket.onclose = stopVoiceRecording;
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send("close");
      websocketRef.current.close();
    }
    websocketRef.current = null;

    processorRef.current?.disconnect();
    streamSourceRef.current?.disconnect();
    audioContextRef.current?.close();

    mediaRecorderRef.current?.getTracks().forEach((track) => track.stop());
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16 relative">
      {/* Background */}
      <Image
        src="/homebg.png"
        alt="Background gradient"
        fill
        priority
        className="object-cover z-0"
      />

      {/* Header */}
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

      {/* Hero Section */}
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

      {/* Search Container */}
      <div className="backdrop-blur-md bg-white/40 rounded-3xl shadow-lg p-4 sm:p-6 w-full max-w-4xl z-10 space-y-4">
        {/* Dropdown + Input Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:h-14 border border-gray-300 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 rounded-[1vw]">
          {/* Specialty */}
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

          {/* Location */}
          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-l sm:border-t-0 border-gray-300 sm:ml-4 sm:pl-4 pt-3 sm:pt-0 w-full"
          />

          {/* Insurance */}
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

        {/* Voice + Search Row */}
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
            {/* Mic */}
            <button
              onClick={handleVoiceSearch}
              disabled={isLoading}
              className={`p-2 sm:p-3 rounded-full transition ${
                isRecording
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isRecording ? (
                <i className="ri-mic-fill text-xl"></i>
              ) : isLoading ? (
                <i className="ri-loader-4-line animate-spin text-xl"></i>
              ) : (
                <i className="ri-mic-line text-xl"></i>
              )}
            </button>

            {/* Search */}
            <button
              onClick={handleTextSearch}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 bg-[#433C50] text-white rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-search-line"></i>
              )}
            </button>
          </div>
        </div>

        {transcript && (
          <p className="text-sm text-gray-600 text-center italic mt-2">
            {transcript}
          </p>
        )}
      </div>

      {/* Robot */}
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
