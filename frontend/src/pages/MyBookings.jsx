import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useBookingRefresh } from "../context/BookingContext";
import { getCustomerBookings, cancelBooking, rescheduleBooking } from "../api/itinerary";
import AnimatedLoader from "../components/AnimatedLoader";

export default function MyBookings() {
  const { user } = useAuth();
  const { bookingRefreshTrigger } = useBookingRefresh();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    }
  }, [user]);

  // Listen for booking refresh trigger
  useEffect(() => {
    if (bookingRefreshTrigger > 0 && user?.email) {
      console.log("📊 Refreshing bookings from trigger");
      fetchBookings();
    }
  }, [bookingRefreshTrigger, user?.email]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching bookings for:", user.email);
      const response = await getCustomerBookings(user.email);
      console.log("✅ API Response:", response);
      console.log("✅ Bookings array:", response.bookings);
      console.log("✅ Number of bookings:", response.bookings?.length || 0);
      setBookings(response.bookings || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Failed to load bookings");
      console.error("❌ Error fetching bookings:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking(bookingId, user.email);
      fetchBookings(); // Refresh list
      alert("✅ Booking cancelled successfully");
    } catch (err) {
      alert("❌ Failed to cancel booking");
      console.error(err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("⚠️  Are you sure you want to DELETE this booking? This action cannot be undone.")) return;

    try {
      await cancelBooking(bookingId, user.email);
      fetchBookings(); // Refresh list
      alert("✅ Booking deleted successfully");
    } catch (err) {
      alert("❌ Failed to delete booking");
      console.error(err);
    }
  };

  const BookingCard = ({ booking }) => (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gold">{booking.service_type}</h3>
          <p className="text-gray-600">Booking #{booking.booking_id}</p>
          {booking.confirmation_number && (
            <p className="text-sm text-blue-600 font-semibold">Confirmation: {booking.confirmation_number}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Destination:</span>
          <span className="font-semibold">{booking.destination}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Departure:</span>
          <span className="font-semibold">
            {new Date(booking.departure_date).toLocaleDateString()}
          </span>
        </div>
        {booking.return_date && (
          <div className="flex justify-between">
            <span className="text-gray-600">Return:</span>
            <span className="font-semibold">
              {new Date(booking.return_date).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Travelers:</span>
          <span className="font-semibold">{booking.num_travelers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gold">₹{booking.total_amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Details:</span>
          <span className="font-semibold text-sm">{booking.service_details}</span>
        </div>
      </div>

      {booking.status !== 'cancelled' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleCancelBooking(booking.booking_id)}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
          >
            ❌ Cancel Booking
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            onClick={() => alert("📅 Reschedule feature coming soon!")}
          >
            📅 Reschedule
          </button>
          <button
            onClick={() => handleDeleteBooking(booking.booking_id)}
            className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-semibold"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {booking.status === 'cancelled' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteBooking(booking.booking_id)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            🗑️ Delete Cancelled Booking
          </button>
        </div>
      )}
    </motion.div>
  );

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 mt-24 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Please login to view your bookings</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 mt-24">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-12 px-4 mt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-gold mb-8 text-center">
        My Bookings
      </h1>

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg mb-8">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">No bookings found</p>
          <a
            href="/flights"
            className="inline-block px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition"
          >
            Book Your First Trip
          </a>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 mb-6">
            Total bookings: {bookings.length}
          </p>
          {bookings.map((booking) => (
            <BookingCard key={booking.booking_id} booking={booking} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

