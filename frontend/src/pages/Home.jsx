import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const bgImages = [
  "https://images.squarespace-cdn.com/content/v1/5a0b07802278e7cd4b80a375/1511894955482-MEGDE0HHRWVI1JLCI58R/coporateairticket.jpg",
  "https://www.dealswithai.com/assets/images/2024-10-11-04-10-21-Flight-with-AI.jpg",
  "https://curlytales.com/wp-content/uploads/2023/09/AI-Travel-Hack-THIS-Plugin-On-ChatGPT-Will-Save-You-Money-While-Booking-Flights-Hotels-More-1.jpg",
  "https://villacdn.villagroupresorts.com/uploads/special/image_en/113/optimizada_UFHP_List_VPF_760X430.jpg",
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % bgImages.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center text-white">
      {/* Animated slideshow background */}
      <AnimatePresence>
        <motion.div
          key={bgImages[index]}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImages[index]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-4xl px-4"
      >
        <h1 className="text-5xl font-bold text-gold mb-4 drop-shadow-lg">
          Welcome to Attar Travel
        </h1>
        <p className="text-lg text-white mb-8">
          Your AI Travel Companion to Saudi Arabia. Experience the magic of
          Saudi Arabia with AI-powered planning — from flights and hotels to
          personalized itineraries and 24/7 voice assistance.
        </p>

        <div className="space-x-4 mb-12">
          <Link
            to="/login"
            className="px-6 py-3 bg-gold text-white rounded-lg hover:scale-105 transition inline-block"
          >
            Get Started - Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-gold rounded-lg hover:scale-105 transition inline-block"
          >
            Sign Up
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 text-black mb-10">
          <div className="bg-white/90 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gold mb-2">
              ✈️ Smart Flight Booking
            </h3>
            <p>
              Find the best flights to Riyadh, Jeddah, and Al-Ula with our
              AI-powered flight search.
            </p>
          </div>

          <div className="bg-white/90 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gold mb-2">
              🏨 Luxury Hotels
            </h3>
            <p>
              Discover handpicked hotels from the Ritz-Carlton to boutique
              desert resorts.
            </p>
          </div>

          <div className="bg-white/90 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gold mb-2">
              🎤 AI Voice Assistant
            </h3>
            <p>
              Talk to our AI agent anytime for instant booking help and travel
              advice.
            </p>
          </div>
        </div>

        {/* Explore our services - visible but not clickable */}
        <div className="space-x-4 opacity-80 pointer-events-none">
          <button className="px-6 py-2 bg-gold text-white rounded-lg shadow-md">
            View Flights
          </button>
          <button className="px-6 py-2 bg-gold text-white rounded-lg shadow-md">
            Browse Hotels
          </button>
          <button className="px-6 py-2 bg-gold text-white rounded-lg shadow-md">
            Talk to AI
          </button>
        </div>
      </motion.div>
    </div>
  );
}
