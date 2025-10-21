import { motion } from "framer-motion";

export default function FlightCard({ flight }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gold">{flight.airline}</h3>
        <span className="text-2xl font-bold text-night">${flight.price}</span>
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold">From:</span>
          <span>{flight.origin}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">To:</span>
          <span>{flight.destination}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Departure:</span>
          <span>{flight.departureTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Arrival:</span>
          <span>{flight.arrivalTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Duration:</span>
          <span>{flight.duration}</span>
        </div>
      </div>
     
    </motion.div>
  );
}

