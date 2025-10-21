import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBookingRefresh } from "../context/BookingContext";
import { getCustomerBookings } from "../api/itinerary";

const bgImages = [
  "https://images.squarespace-cdn.com/content/v1/5a0b07802278e7cd4b80a375/1511894955482-MEGDE0HHRWVI1JLCI58R/coporateairticket.jpg",
  "https://www.dealswithai.com/assets/images/2024-10-11-04-10-21-Flight-with-AI.jpg",
  "https://curlytales.com/wp-content/uploads/2023/09/AI-Travel-Hack-THIS-Plugin-On-ChatGPT-Will-Save-You-Money-While-Booking-Flights-Hotels-More-1.jpg",
  "https://villacdn.villagroupresorts.com/uploads/special/image_en/113/optimizada_UFHP_List_VPF_760X430.jpg",
];

export default function Dashboard() {
  const { user } = useAuth();
  const { bookingRefreshTrigger } = useBookingRefresh();
  const [index, setIndex] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Background rotation
  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % bgImages.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const response = await getCustomerBookings(user.email);
      console.log("Dashboard bookings fetched:", response.bookings);
      setBookings(response.bookings || []);
    } catch (err) {
      console.error("Error fetching dashboard bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Listen for booking refresh trigger
  useEffect(() => {
    if (bookingRefreshTrigger > 0 && user?.email) {
      console.log("Dashboard: Refreshing bookings from trigger");
      fetchBookings();
    }
  }, [bookingRefreshTrigger, user?.email]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Animated Background */}
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dashboard Content */}
      <div className="relative z-10 px-10 py-12 max-w-7xl mx-auto mt-24">
        <h1 className="text-5xl font-bold text-gold mb-4 text-center">
          Welcome back, rahini15ece!
        </h1>
        <p className="text-2xl text-gray-200 mb-12 text-center">
          Here’s your personalized travel dashboard
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 w-full">
          <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg border-l-8 border-blue-600 hover:shadow-blue-300 transition-all duration-300">
            <p className="text-2xl font-semibold">Total Bookings</p>
            <p className="text-5xl font-extrabold mt-4">{bookings.length}</p>
          </div>

          <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg border-l-8 border-green-500 hover:shadow-green-300 transition-all duration-300">
            <p className="text-2xl font-semibold">Upcoming Trips</p>
            <p className="text-5xl font-extrabold mt-4">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>

          <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg border-l-8 border-purple-500 hover:shadow-purple-300 transition-all duration-300">
            <p className="text-2xl font-semibold">Completed</p>
            <p className="text-5xl font-extrabold mt-4">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>

          <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg border-l-8 border-yellow-500 hover:shadow-yellow-300 transition-all duration-300">
            <p className="text-2xl font-semibold">Total Spent</p>
            <p className="text-5xl font-extrabold mt-4">₹{bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)}</p>
          </div>
        </div>

       {/* Quick Actions */}
        <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg mb-12 w-full">
          <h2 className="text-3xl font-bold mb-6 text-gold">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Book Flight */}
            <button
              onClick={() => (window.location.href = "/flights")}
              className="bg-gold/10 hover:bg-gold/30 p-8 rounded-xl text-center font-semibold text-xl transition transform hover:scale-105"
            >
              View Flights
            </button>

            {/* Book Hotel */}
            <button
              onClick={() => (window.location.href = "/hotels")}
              className="bg-gold/10 hover:bg-gold/30 p-8 rounded-xl text-center font-semibold text-xl transition transform hover:scale-105"
            >
              View Hotels
            </button>

           {/* My Bookings */}
            <button
              onClick={() => (window.location.href = "/bookings")}
              className="bg-gold/10 hover:bg-gold/30 p-8 rounded-xl text-center font-semibold text-xl transition transform hover:scale-105"
            >
              My Bookings
            </button>

            {/* AI Assistant */}
            <button
              onClick={() => (window.location.href = "/voice")}
              className="bg-gold/10 hover:bg-gold/30 p-8 rounded-xl text-center font-semibold text-xl transition transform hover:scale-105"
            >
              AI Assistant
            </button>
          </div>
        </div>
        {/* Recent Bookings */}
        <div className="bg-white/90 text-black rounded-2xl p-8 shadow-lg w-full mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gold">Recent Bookings</h2>
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <div>
              <p className="text-2xl font-semibold text-gold">Flight</p>
              <p className="text-lg text-gray-600">Bangalore to AlUla</p>
              <p className="text-md text-gray-500">15/12/2025</p>
            </div>
            <div className="text-right">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg font-medium">
                confirmed
              </span>
              <p className="font-bold text-2xl mt-3">$20000</p>
            </div>
          </div>
        </div>

        {/* Explore Our Services Buttons (Visible but Non-Clickable) */}
        <div className="space-x-6 opacity-90 pointer-events-none">
          <button className="px-8 py-4 bg-gold text-white rounded-xl text-xl font-semibold shadow-lg">
            View Flights
          </button>
          <button className="px-8 py-4 bg-gold text-white rounded-xl text-xl font-semibold shadow-lg">
            Browse Hotels
          </button>
          <button className="px-8 py-4 bg-gold text-white rounded-xl text-xl font-semibold shadow-lg">
            Talk to AI
          </button>
        </div>
      </div>
    </div>
  );
}
