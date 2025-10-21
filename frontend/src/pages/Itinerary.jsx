import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ItineraryCard from "../components/ItineraryCard";
import AnimatedLoader from "../components/AnimatedLoader";
import { getItinerary } from "../api/itinerary";

export default function Itinerary() {
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        setLoading(true);
        const data = await getItinerary();
        setItinerary(data);
      } catch (err) {
        setError("Failed to load itinerary. Please try again later.");
        console.error("Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItinerary();
  }, []);

  return (
    <motion.div
      className="container mx-auto py-12 px-4 mt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-gold mb-8 text-center">
        Your Travel Itinerary
      </h1>
      
      {loading && <AnimatedLoader />}
      
      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && itinerary.length === 0 && (
        <div className="text-center text-gray-600 p-4">
          No itinerary items available. Start planning your trip!
        </div>
      )}
      
      <div className="max-w-3xl mx-auto space-y-6">
        {itinerary.map((item) => (
          <ItineraryCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

