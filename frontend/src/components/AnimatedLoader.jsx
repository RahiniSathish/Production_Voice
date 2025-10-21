import { motion } from "framer-motion";

export default function AnimatedLoader() {
  return (
    <div className="flex justify-center items-center p-8">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-gold rounded-full"
            animate={{
              y: ["0%", "-50%", "0%"],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

