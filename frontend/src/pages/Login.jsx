import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const bgImages = [
  "https://images.squarespace-cdn.com/content/v1/5a0b07802278e7cd4b80a375/1511894955482-MEGDE0HHRWVI1JLCI58R/coporateairticket.jpg",
  "https://www.dealswithai.com/assets/images/2024-10-11-04-10-21-Flight-with-AI.jpg",
  "https://curlytales.com/wp-content/uploads/2023/09/AI-Travel-Hack-THIS-Plugin-On-ChatGPT-Will-Save-You-Money-While-Booking-Flights-Hotels-More-1.jpg",
  "https://villacdn.villagroupresorts.com/uploads/special/image_en/113/optimizada_UFHP_List_VPF_760X430.jpg",
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [bgIndex, setBgIndex] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-rotate background images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const response = await fetch("http://localhost:8000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          login({
            email: formData.email,
            name: data.name || formData.email.split("@")[0]
          });
          navigate("/dashboard");
        } else {
          setError(data.detail || "Login failed. Please check your credentials.");
        }
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long!");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        });

        const data = await response.json();

        if (response.ok) {
          login({
            email: formData.email,
            name: formData.name
          });
          navigate("/dashboard");
        } else {
          setError(data.detail || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated slideshow backgrounds with cross-fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImages[bgIndex]}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImages[bgIndex]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Login/Register panel */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-8"
        >
          {/* <h1 className="text-5xl md:text-6xl font-bold text-gold mb-4 drop-shadow-2xl">
            Attar Travel
          </h1> */}
          <p className="text-white text-lg md:text-xl max-w-2xl drop-shadow-lg">
            Discover Saudi Arabia with exclusive flights, luxury hotels, and AI-powered itineraries.
            {isLogin ? " Sign in to continue your journey." : " Create an account to start your adventure."}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setFormData({ email: "", password: "", confirmPassword: "", name: "" });
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isLogin ? "bg-gold text-white shadow-md" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setFormData({ email: "", password: "", confirmPassword: "", name: "" });
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin ? "bg-gold text-white shadow-md" : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gold mb-6 text-center">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition"
                  placeholder="Enter your full name"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition"
                  placeholder="Confirm your password"
                />
              </motion.div>
            )}

            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-gold hover:underline text-sm font-medium">
                  Forgot Password?
                </Link>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gold text-white py-3 rounded-lg font-bold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? "Login" : "Register"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gold hover:underline font-medium text-sm">
              ← Back to Home
            </Link>
          </div>
        </motion.div>

        {/* Bottom Features with slide indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 text-center text-white"
        >

          {/* Slideshow indicator dots */}
          <div className="flex justify-center gap-2 mt-4">
            {bgImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBgIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === bgIndex ? "bg-gold w-8" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
