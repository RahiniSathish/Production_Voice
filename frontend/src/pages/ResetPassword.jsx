import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

const bgImages = [
  "https://images.squarespace-cdn.com/content/v1/5a0b07802278e7cd4b80a375/1511894955482-MEGDE0HHRWVI1JLCI58R/coporateairticket.jpg",
  "https://www.dealswithai.com/assets/images/2024-10-11-04-10-21-Flight-with-AI.jpg",
  "https://curlytales.com/wp-content/uploads/2023/09/AI-Travel-Hack-THIS-Plugin-On-ChatGPT-Will-Save-You-Money-While-Booking-Flights-Hotels-More-1.jpg",
  "https://villacdn.villagroupresorts.com/uploads/special/image_en/113/optimizada_UFHP_List_VPF_760X430.jpg",
];

export default function ResetPassword() {
  const [index, setIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % bgImages.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  // Get token and email from URL parameters
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);

    if (!tokenParam || !emailParam) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, email, newPassword);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Please try again.");
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
          {/* Success State */}
          {success ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              <h1 className="text-3xl font-bold text-green-600 mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  🔄 Redirecting to login page in 2 seconds...
                </p>
              </div>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-gold to-yellow-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300"
                >
                  Go to Login Now →
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gold mb-2">🔐 Reset Password</h1>
                <p className="text-gray-600">
                  Enter your new password below.
                </p>
              </div>

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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition"
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Match Indicator */}
                {newPassword && confirmPassword && (
                  <div className="text-sm">
                    {newPassword === confirmPassword ? (
                      <p className="text-green-600 flex items-center gap-2">
                        <span>✅</span> Passwords match
                      </p>
                    ) : (
                      <p className="text-red-600 flex items-center gap-2">
                        <span>❌</span> Passwords do not match
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token || !email}
                  className="w-full bg-gradient-to-r from-gold to-yellow-500 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link to="/login" className="text-gold hover:underline text-sm font-semibold">
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

