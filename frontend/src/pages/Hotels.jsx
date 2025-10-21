import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HotelCard from "../components/HotelCard";
import AnimatedLoader from "../components/AnimatedLoader";
import { getHotels } from "../api/hotels";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true);
        const data = await getHotels();
        setHotels(data);
      } catch (err) {
        setError("Failed to load hotels. Please try again later.");
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  return (
    <motion.div
      className="container mx-auto py-12 px-4 mt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-gold mb-8 text-center">
        Available Hotels
      </h1>
      
      {loading && <AnimatedLoader />}
      
      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && hotels.length === 0 && (
        <div className="text-center text-gray-600 p-4">
          No hotels available at the moment.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </motion.div>
  );
}

