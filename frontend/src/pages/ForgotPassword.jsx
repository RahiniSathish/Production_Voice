import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

const bgImages = [
  "https://images.squarespace-cdn.com/content/v1/5a0b07802278e7cd4b80a375/1511894955482-MEGDE0HHRWVI1JLCI58R/coporateairticket.jpg",
  "https://www.dealswithai.com/assets/images/2024-10-11-04-10-21-Flight-with-AI.jpg",
  "https://curlytales.com/wp-content/uploads/2023/09/AI-Travel-Hack-THIS-Plugin-On-ChatGPT-Will-Save-You-Money-While-Booking-Flights-Hotels-More-1.jpg",
  "https://villacdn.villagroupresorts.com/uploads/special/image_en/113/optimizada_UFHP_List_VPF_760X430.jpg",
];

export default function ForgotPassword() {
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resetLink, setResetLink] = useState(null);

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % bgImages.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetLink(null);
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || "Password reset email sent! Please check your inbox.");
      
      // If email wasn't sent (SMTP issue), show the reset link
      if (response.reset_link) {
        setResetLink(response.reset_link);
        setMessage("Email delivery is currently unavailable. Please use the link below to reset your password:");
      }
      
      // Don't clear email if we're showing the link
      if (!response.reset_link) {
        setEmail("");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImages[index]}
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImages[index]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">🔐 Forgot Password</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <p className="text-sm font-medium">{message}</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Reset Link (when email fails) */}
          {resetLink && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 mb-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🔗</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-800 mb-2">Password Reset Link</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Click the button below or copy the link to reset your password:
                  </p>
                  <a
                    href={resetLink}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition mb-3 transform hover:scale-105 active:scale-95"
                  >
                    🔐 Reset Password Now
                  </a>
                  <div className="bg-white border border-blue-200 rounded p-3 mt-3">
                    <p className="text-xs text-gray-600 mb-1 font-semibold">Or copy this link:</p>
                    <input
                      type="text"
                      value={resetLink}
                      readOnly
                      className="w-full text-xs text-blue-600 bg-gray-50 p-2 rounded border border-gray-300"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mt-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Note:</strong> Email delivery is temporarily unavailable due to network restrictions. 
                  This link works exactly the same as an email link.
                </p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition"
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-yellow-500 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-gold hover:underline font-semibold">
                Back to Login
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ What happens next?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• You'll receive an email with a reset link</li>
              <li>• Click the link to create a new password</li>
              <li>• The link expires in 24 hours</li>
              <li>• Check your spam folder if you don't see it</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

