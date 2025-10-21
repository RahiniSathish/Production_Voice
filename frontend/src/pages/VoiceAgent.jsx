import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useBookingRefresh } from "../context/BookingContext";
import axios from "axios";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useRemoteParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";

const BASE_URL = "http://localhost:8000";

const bgImages = [
  "https://thriftynomads.com/wp-content/uploads/2018/02/round-the-world-tickets-guide.jpeg",
  "https://upgradedpoints.com/wp-content/uploads/2023/03/plane-flying-around-a-globe.jpeg?auto=webp&disable=upscale&width=1200",
  "https://discusholdings.com/storage/uploads/79/conversions/shutterstock_530963476-4-thumb.jpg",
];

// LiveKit Room Component with Conversation Display
function VoiceAssistantUI({ roomName }) {
  const voiceAssistant = useVoiceAssistant();
  const { triggerBookingRefresh } = useBookingRefresh();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const lastBookingCheckRef = useRef(0);

  // Scroll to bottom when new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll backend for conversation transcript
  useEffect(() => {
    if (!roomName) return;

    const fetchTranscript = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/livekit/transcript/${roomName}`);
        if (response.data && response.data.transcripts) {
          const formattedMessages = response.data.transcripts.map(t => ({
            text: t.text || '',
            speaker: t.speaker || 'unknown',
            timestamp: t.created_at ? new Date(t.created_at).toLocaleTimeString() : new Date().toLocaleTimeString()
          }));
          setMessages(formattedMessages);

          // Check for booking confirmation keywords
          const now = Date.now();
          if (now - lastBookingCheckRef.current > 3000) { // Check every 3 seconds max
            const allText = formattedMessages
              .filter(m => m.speaker === 'assistant')
              .map(m => m.text.toLowerCase())
              .join(' ');

            const bookingKeywords = [
              'booking',
              'reserved',
              'confirmed',
              'ticket',
              'successfully',
              '✅',
              'booked',
              'reservation',
              'confirmation',
              'confirmed!',
              'confirmation number',
              'booking id',
              'check my bookings'
            ];

            const hasBookingKeyword = bookingKeywords.some(keyword => allText.includes(keyword));

            if (hasBookingKeyword) {
              console.log("🎫 Booking confirmation detected! Triggering refresh...");
              triggerBookingRefresh();
              lastBookingCheckRef.current = now;
              
              // Trigger additional refresh after 2 seconds to ensure backend has saved
              setTimeout(() => {
                console.log("🔄 Secondary booking refresh (delayed)");
                triggerBookingRefresh();
              }, 2000);
            }
          }
        }
      } catch (error) {
        // Silently handle 404 for new rooms
        if (error.response?.status !== 404) {
          console.error("Error fetching transcript:", error);
        }
      }
    };

    // Initial fetch
    fetchTranscript();

    // Poll every 2 seconds
    const interval = setInterval(fetchTranscript, 2000);

    return () => clearInterval(interval);
  }, [roomName, triggerBookingRefresh]);

  const videoRef = useRef(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Handle video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tryAutoplay = async () => {
      if (prefersReduced) {
        setShowPlayButton(true);
        return;
      }
      try {
        await video.play();
      } catch (err) {
        setShowPlayButton(true);
      }
    };

    if (video.readyState >= 1) {
      tryAutoplay();
    } else {
      video.addEventListener('loadedmetadata', tryAutoplay, { once: true });
    }
  }, []);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        await video.play();
        setShowPlayButton(false);
      } catch (err) {
        console.error('Playback failed:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-4xl mx-auto">
      {/* Animation Video */}
      <div className="w-full max-w-2xl relative rounded-lg overflow-hidden bg-white shadow-2xl">
        <video
          ref={videoRef}
          src="https://cdn.dribbble.com/userupload/4157958/file/original-b4ec39eeac91ab408d32b943a33c316f.mp4"
          playsInline
          muted
          loop
          preload="auto"
          className="w-full h-auto bg-white"
          aria-label="Voice Assistant Animation"
        />
        
        {showPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90">
            <button
              onClick={handlePlayClick}
              className="appearance-none border border-gray-300 bg-white px-6 py-3 rounded-full cursor-pointer font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="button"
            >
              ▶ Play Animation
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="text-lg font-semibold text-black capitalize drop-shadow-lg">
          {voiceAssistant.state === "listening" && "Listening to you..."}
          {voiceAssistant.state === "thinking" && "Thinking..."}
          {voiceAssistant.state === "speaking" && "Alex is speaking..."}
          {voiceAssistant.state === "idle" && "✨ Ready to chat"}
          {voiceAssistant.state === "connecting" && "Connecting..."}
        </p>
      </div>

      {/* Live Conversation Transcript */}
      {messages.length > 0 && (
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-base font-bold text-gray-800 mb-3 sticky top-0 bg-white/95 pb-2 border-b border-gray-200">
            💬 Live Conversation
          </h3>
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    msg.speaker === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.speaker === 'user' ? '👤 You' : '🤖 Alex'}
                  </p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Control Bar */}
      <VoiceAssistantControlBar controls={{ leave: true }} />
    </div>
  );
}

export default function VoiceAgent() {
  const { user } = useAuth();
  const [bgIndex, setBgIndex] = useState(0);
  const [roomToken, setRoomToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [roomName, setRoomName] = useState("");

  // Auto-rotate background images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const startVoiceChat = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Generate unique room name
      const room = `travel-${user?.email || 'guest'}-${Date.now()}`;
      setRoomName(room);

      // Get LiveKit token from backend
      const response = await axios.post(`${BASE_URL}/livekit/get-token`, {
        roomName: room,
        participantName: user?.name || "Guest",
        customerEmail: user?.email || null,
      });

      if (response.data && response.data.token && response.data.url) {
        setRoomToken(response.data.token);
        setServerUrl(response.data.url);
        console.log("✅ LiveKit token received, connecting to room...");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error getting LiveKit token:", err);
      setError(err.response?.data?.detail || "Failed to connect to voice chat. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const endVoiceChat = () => {
    setRoomToken(null);
    setServerUrl(null);
    setRoomName("");
  };

  const WaveformAnimation = () => (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-blue-500 rounded-full"
          animate={{
            height: ["20px", "60px", "20px"],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImages[bgIndex]}
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImages[bgIndex]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-5xl">
         

          {/* Voice Chat Card */}
          <motion.div
            className="bg-white/95 backdrop-blur-md text-black rounded-2xl p-8 shadow-2xl max-h-[calc(100vh-200px)] overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Not Connected State */}
              {!roomToken && (
                <>
                  <div className="text-6xl text-gold mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gold mb-2">
                   Attar AI Specialist
                  </h1>
                 
                  

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 max-w-2xl">
                      <p className="font-semibold">⚠️ Error:</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={startVoiceChat}
                    disabled={isConnecting}
                    className={`text-lg px-8 py-3 rounded-xl font-semibold shadow-lg transition transform ${
                      isConnecting
                        ? "bg-gray-400 cursor-wait"
                        : "bg-gold hover:bg-gold/90 hover:scale-105"
                    } text-white`}
                  >
                    {isConnecting ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Connecting...
                      </>
                    ) : (
                      "Start Voice Chat"
                    )}
                  </button>
                </>
              )}

              {/* Connected - LiveKit Room */}
              {roomToken && serverUrl && (
                <div className="w-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gold mb-1">Connected to Alex</h2>
                    <p className="text-gray-600 text-sm">Room: {roomName}</p>
                  </div>

                  <LiveKitRoom
                    token={roomToken}
                    serverUrl={serverUrl}
                    connect={true}
                    audio={true}
                    video={false}
                    onDisconnected={endVoiceChat}
                    className="livekit-room"
                  >
                    <VoiceAssistantUI roomName={roomName} />
                    <RoomAudioRenderer />
                  </LiveKitRoom>

                  {/* <button
                    onClick={endVoiceChat}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    End Call
                  </button> */}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
