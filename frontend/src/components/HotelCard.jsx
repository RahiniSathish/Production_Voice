import { motion } from "framer-motion";

export default function HotelCard({ hotel }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gold">{hotel.name}</h3>
        <div className="flex items-center">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="ml-1 text-sm font-semibold">{hotel.rating}</span>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold">Location:</span>
          <span>{hotel.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Room Type:</span>
          <span>{hotel.roomType}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Price per night:</span>
          <span className="text-lg font-bold text-night">${hotel.pricePerNight}</span>
        </div>
        {hotel.amenities && (
          <div className="mt-2">
            <span className="font-semibold">Amenities:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {hotel.amenities.map((amenity, idx) => (
                <span key={idx} className="px-2 py-1 bg-sand text-xs rounded">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

