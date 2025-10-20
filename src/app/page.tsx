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

// Auto-detect API URL based on environment
const getApiUrl = () => {
  // If explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In browser, check if we're on localhost
  if (typeof window !== "undefined") {
    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalDev) {
      return "http://localhost:8080"; // Local backend
    }
  }

  // Default to production
  return "https://smarterdoc-backend-1094971678787.us-central1.run.app";
};

const API_URL = getApiUrl();

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
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [insuranceList, setInsuranceList] = useState<string[]>([]);
  const router = useRouter();

  // WebSocket and audio processing refs
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // Convert Float32Array to Int16Array (LINEAR16 PCM)
  const float32ToInt16 = (buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  };

  // Fetch dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      if (isLocalhost) {
        setSpecialtiesList(mockSpeciality);
        setInsuranceList(mockInsurance);
        return;
      }

      try {
        const [specialtiesRes, insuranceRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/search/specialties`),
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
    localStorage.removeItem("selectedDoctors");
    window.dispatchEvent(new Event("storage")); // notify Header
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopVoiceRecording();
      }
    };
  }, [isRecording]);

  // Text Search - Using AI-powered recommendations
  const handleTextSearch = async () => {
    if (!specialty.trim()) return;
    setIsLoading(true);

    try {
      // Always use real API for search, even in localhost
      // Build the query from user inputs
      const queryParts: string[] = [];

      if (questionInput.trim()) {
        queryParts.push(questionInput.trim());
      }

      if (locationInput.trim()) {
        queryParts.push(`in ${locationInput}`);
      }

      if (insurance.trim()) {
        queryParts.push(`who accepts ${insurance}`);
      }

      // Default query if nothing provided
      const query =
        queryParts.length > 0
          ? queryParts.join(", ")
          : "Find a highly qualified doctor with excellent patient reviews";

      // Call the AI-powered recommendations API
      const response = await fetch(`${API_URL}/api/v1/search/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: specialty,
          query: query,
        }),
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

  // Voice Search with WebSocket
  const handleVoiceSearch = async () => {
    if (isRecording) {
      // Stop recording
      stopVoiceRecording();
      return;
    }

    try {
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Connect WebSocket (cloud-safe)
      const wsBase =
        (process.env.NEXT_PUBLIC_WS_URL as string | undefined) ||
        (() => {
          try {
            const api = new URL(API_URL);
            const proto = api.protocol === "https:" ? "wss:" : "ws:";
            return `${proto}//${api.host}`;
          } catch {
            const proto =
              window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = isLocalhost ? "localhost:8080" : window.location.host;
            return `${proto}//${host}`;
          }
        })();
      const wsUrl = `${wsBase}/api/v1/speech/stream/websocket?language_code=en-US&sample_rate=16000`;
      console.log("Connecting to WebSocket:", wsUrl);

      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      websocket.onopen = async () => {
        console.log("WebSocket connected");
        setIsRecording(true);
        setTranscript("");
        setFinalTranscript("");
        setInterimTranscript("");
        finalRef.current = "";

        // Setup audio processing (avoid any by typing webkitAudioContext)
        const AudioCtx: typeof AudioContext =
          window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioCtx({
          sampleRate: 16000,
        });
        audioContextRef.current = audioContext;

        const streamSource = audioContext.createMediaStreamSource(stream);
        streamSourceRef.current = streamSource;

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        let audioChunkCount = 0;
        processor.onaudioprocess = (e) => {
          if (websocket && websocket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Data = float32ToInt16(inputData);

            try {
              websocket.send(int16Data.buffer);
              audioChunkCount++;

              if (audioChunkCount === 1) {
                console.log(
                  `✓ Sent first audio chunk (${int16Data.length * 2} bytes)`
                );
              }
            } catch (error) {
              console.error("Error sending audio data:", error);
            }
          }
        };

        streamSource.connect(processor);
        processor.connect(audioContext.destination);

        // Resume audio context if suspended
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        mediaRecorderRef.current = stream;
        console.log("Audio setup complete");
      };

      websocket.onmessage = (event) => {
        type SttResult = {
          transcript?: string;
          is_final?: boolean;
          confidence?: number;
          error?: string;
        };
        const result = JSON.parse(event.data) as SttResult;
        console.log("Received result:", result);

        if (result.error) {
          console.error("Error in result:", result.error);
          setTranscript(`Error: ${result.error}`);
          return;
        }

        if (result.transcript && result.transcript.trim()) {
          const chunk = result.transcript.trim();
          if (result.is_final) {
            // Append final chunk to accumulated transcript
            setFinalTranscript((prev) => {
              const updated = prev ? `${prev} ${chunk}` : chunk;
              finalRef.current = updated;
              setTranscript(updated);
              setQuestionInput(updated);
              return updated;
            });
            setInterimTranscript("");
          } else {
            // Show interim combined with accumulated final transcript
            setInterimTranscript(chunk);
            const combined = finalRef.current
              ? `${finalRef.current} ${chunk}`
              : chunk;
            setTranscript(combined);
          }
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        console.error("WebSocket URL was:", wsUrl);
        console.error("WebSocket readyState:", websocket.readyState);
        setTranscript(`Connection error: ${wsUrl}`);
        stopVoiceRecording();
      };

      websocket.onclose = () => {
        console.log("WebSocket closed");
        if (isRecording) {
          stopVoiceRecording();
        }
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      setTranscript(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    setIsRecording(false);

    // Close WebSocket
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send("close");
      websocketRef.current.close();
    }
    websocketRef.current = null;

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamSourceRef.current) {
      streamSourceRef.current.disconnect();
      streamSourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop microphone
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }

    console.log("Recording stopped");
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
        <Image
          src="/logo.png"
          alt="SmarterDoc Logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          SmarterDoc AI
        </h1>
      </header>

      {/* Hero */}
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
        {/* Top Input Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:h-14 w-full rounded-[1vw] border border-gray-300 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 appearance-none w-full"
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
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-t-0 sm:border-l border-gray-300 sm:ml-4 sm:pl-4 pt-3 sm:pt-0 w-full"
          />

          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="flex-1 truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 border-t sm:border-t-0 sm:border-l border-gray-300 sm:ml-4 sm:pl-4 w-full"
            title={insurance}
          >
            <option value="">Insurance</option>
            {insuranceList.map((plan, i) => (
              <option key={i} value={plan} title={plan}>
                {plan.length > 25 ? `${plan.slice(0, 25)}…` : plan}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:h-14 w-full rounded-[1vw] border border-gray-300 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4">
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
              title={
                isRecording
                  ? "Click to stop recording"
                  : "Click to start recording"
              }
            >
              {isRecording ? (
                <i className="ri-mic-fill text-xl"></i>
              ) : isLoading ? (
                <i className="ri-loader-4-line animate-spin text-xl"></i>
              ) : (
                <i className="ri-mic-line text-xl"></i>
              )}
            </button>

            <button
              onClick={handleTextSearch}
              disabled={isLoading}
              className="flex items-center align-center justify-center h-10 w-10  sm:h-9 sm:w-9 bg-[#433C50] text-white rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
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

      {/* Robot Image */}
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
