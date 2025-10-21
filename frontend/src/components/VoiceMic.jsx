import { useState } from "react";

export default function VoiceMic({ onResult }) {
  const [recording, setRecording] = useState(false);

  const startListening = () => {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setRecording(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      onResult(transcript);
    };
    
    recognition.onerror = (error) => {
      console.error("Speech recognition error:", error);
      setRecording(false);
    };
    
    recognition.onend = () => {
      setRecording(false);
    };
  };

  return (
    <button
      onClick={startListening}
      className={`p-6 rounded-full bg-gold text-white text-2xl shadow-lg transition ${
        recording ? "animate-pulse" : ""
      }`}
      disabled={recording}
    >
      🎤
    </button>
  );
}

