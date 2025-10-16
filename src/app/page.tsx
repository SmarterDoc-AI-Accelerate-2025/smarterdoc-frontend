"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockDoctorsData from "@/data/mockDoctors.json";
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
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [insuranceList, setInsuranceList] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  };

  // 🔄 Fetch dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      if (isLocalhost) {
        setSpecialtiesList(mockSpeciality);
        setInsuranceList(mockInsurance);
        return;
      }

      try {
        const [specialtiesRes, insuranceRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/search/specialties/from-bq`),
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopVoiceRecording();
      }
    };
  }, []);

  // 🔍 Text Search
  const handleTextSearch = async () => {
    if (!specialty.trim()) return;
    setIsLoading(true);

    try {
      if (isLocalhost) {
        localStorage.setItem(
          "doctorResults",
          JSON.stringify(mockDoctorsData.doctors)
        );
        router.push("/doctor");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/search/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty,
          insurance,
          location: locationInput,
          min_experience: 10,
          has_certification: true,
          limit: 20,
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


  // 🎤 Voice Search with WebSocket
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
          noiseSuppression: true
        }
      });

      // Connect WebSocket (cloud-safe)
      const wsBase = (process.env.NEXT_PUBLIC_WS_URL as string | undefined) || (() => {
        try {
          const api = new URL(API_URL);
          const proto = api.protocol === 'https:' ? 'wss:' : 'ws:';
          return `${proto}//${api.host}`;
        } catch {
          const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = isLocalhost ? 'localhost:8080' : window.location.host;
          return `${proto}//${host}`;
        }
      })();
      const wsUrl = `${wsBase}/api/v1/speech/stream/websocket?language_code=en-US&sample_rate=16000`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      websocket.onopen = async () => {
        console.log('WebSocket connected');
        setIsRecording(true);
        setTranscript("");
        
        // Setup audio processing (avoid any by typing webkitAudioContext)
        const AudioCtx: typeof AudioContext = (window.AudioContext || window.webkitAudioContext);
        const audioContext = new AudioCtx({
          sampleRate: 16000
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
                console.log(`✓ Sent first audio chunk (${int16Data.length * 2} bytes)`);
              }
            } catch (error) {
              console.error('Error sending audio data:', error);
            }
          }
        };

        streamSource.connect(processor);
        processor.connect(audioContext.destination);
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        mediaRecorderRef.current = stream;
        console.log('Audio setup complete');
      };

      websocket.onmessage = (event) => {
        const result = JSON.parse(event.data);
        console.log('Received result:', result);

        if (result.error) {
          console.error('Error in result:', result.error);
          setTranscript(`Error: ${result.error}`);
          return;
        }

        if (result.transcript && result.transcript.trim()) {
          if (result.is_final) {
            console.log('Final transcript:', result.transcript);
            setTranscript(result.transcript);
            setQuestionInput(result.transcript);
          }
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket URL was:', wsUrl);
        console.error('WebSocket readyState:', websocket.readyState);
        setTranscript(`Connection error: ${wsUrl}`);
        stopVoiceRecording();
      };

      websocket.onclose = () => {
        console.log('WebSocket closed');
        if (isRecording) {
          stopVoiceRecording();
        }
      };

    } catch (error) {
      console.error('Error starting recording:', error);
      setTranscript(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    setIsRecording(false);

    // Close WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send('close');
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
      mediaRecorderRef.current.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    console.log('Recording stopped');
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 relative">
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
        className="flex items-center justify-start w-full max-w-5xl mb-12 z-10 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="SmarterDoc Logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <h1 className="text-2xl font-bold text-gray-800">SmarterDoc AI</h1>
      </header>

      {/* Hero */}
      <section className="text-center mb-10 z-10">
        <h2 className="text-4xl font-bold mb-2" style={{ color: "#433C50" }}>
          Smart guidance to the right doctor
        </h2>
        <p className="text-gray-700" style={{ color: "#5F72BE" }}>
          We connect you with the best care — clearly, fairly, and personally.
        </p>
      </section>

      {/* Search */}
      <div className="backdrop-blur-md bg-white/40 rounded-3xl shadow-lg p-6 w-full max-w-4xl z-10 space-y-4">
        <div className="flex items-center h-14 w-full rounded-[1vw] border border-gray-300 bg-white shadow-sm px-6 py-4">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 appearance-none"
            title={specialty} 
          >
            <option value="">Specialty</option>
            {specialtiesList.map((item, i) => (
              <option
                key={i}
                value={item}
                title={item}
                className="truncate max-w-[180px]"
              >
                {item.length > 30 ? `${item.slice(0, 30)}…` : item}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 ml-4 border-l pl-4 border-gray-300"
          />

          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="flex-1 truncate outline-none bg-transparent text-gray-700 placeholder-gray-400 ml-4 border-l pl-4 border-gray-300 appearance-none"
            title={insurance}
          >
            <option value="">Insurance</option>
            {insuranceList.map((plan, i) => (
              <option
                key={i}
                value={plan}
                title={plan}
                className="truncate max-w-[160px]"
              >
                {plan.length > 25 ? `${plan.slice(0, 25)}…` : plan}
              </option>
            ))}
          </select>

          <button
            onClick={handleTextSearch}
            disabled={isLoading}
            className="flex items-center justify-center h-9 w-9 ml-4 bg-[#433C50] text-white p-2 rounded-full hover:bg-[#5F72BE] transition disabled:opacity-50"
          >
            {isLoading ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-search-line"></i>
            )}
          </button>
        </div>

        {/* Voice Row */}
        <div className="flex items-center h-14 w-full rounded-[1vw] border border-gray-300 bg-white shadow-sm px-6 py-4">
          <i className="ri-question-line text-gray-400 text-xl mr-3"></i>
          <input
            type="text"
            placeholder="Ask a question..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          <button
            onClick={handleVoiceSearch}
            disabled={isLoading}
            className={`cursor-pointer p-2 rounded-full transition ${
              isRecording
                ? "bg-red-100 text-red-600 animate-pulse"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title={isRecording ? "Click to stop recording" : "Click to start recording"}
          >
            {isRecording ? (
              <i className="ri-mic-fill text-xl"></i>
            ) : isLoading ? (
              <i className="ri-loader-4-line animate-spin text-xl"></i>
            ) : (
              <i className="ri-mic-line text-xl"></i>
            )}
          </button>
        </div>

        {transcript && (
          <p className="text-sm text-gray-600 text-center italic mt-2">
            🎙️ “{transcript}”
          </p>
        )}
      </div>

      <div className="absolute bottom-30 left-1/2 -translate-x-1/2 w-[320px] z-10">
        <Image src="/robot.png" alt="Doctor robot" width={400} height={400} />
      </div>
    </main>
  );
}
