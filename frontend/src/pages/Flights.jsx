import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FlightCard from "../components/FlightCard";
import AnimatedLoader from "../components/AnimatedLoader";
import { getFlights } from "../api/flights";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        const data = await getFlights();
        setFlights(data);
      } catch (err) {
        setError("Failed to load flights. Please try again later.");
        console.error("Error fetching flights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  return (
    <motion.div
      className="container mx-auto py-12 px-4 mt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-gold mb-8 text-center">
        Available Flights
      </h1>
      
      {loading && <AnimatedLoader />}
      
      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && flights.length === 0 && (
        <div className="text-center text-gray-600 p-4">
          No flights available at the moment.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </motion.div>
  );
}

