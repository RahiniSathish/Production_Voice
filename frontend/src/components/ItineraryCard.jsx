import { motion } from "framer-motion";

export default function ItineraryCard({ item }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-white font-bold">
            {item.day}
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{item.time}</p>
          <p className="text-gray-700">{item.description}</p>
          {item.activities && item.activities.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-sm mb-2">Activities:</p>
              <ul className="list-disc list-inside space-y-1">
                {item.activities.map((activity, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.location && (
            <div className="mt-3 text-sm">
              <span className="font-semibold">Location:</span> {item.location}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

