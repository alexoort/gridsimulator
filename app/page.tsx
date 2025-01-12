"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-6xl font-bold flex items-center space-x-2 mb-8">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-purple-800"
        >
          Grid
        </motion.span>
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ delay: 1, duration: 1 }}
          className="text-purple-600 overflow-hidden whitespace-nowrap"
        >
          Game
        </motion.span>
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ delay: 2, duration: 1 }}
          className="text-purple-400 overflow-hidden whitespace-nowrap"
        >
          Simulator
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.5 }}
      >
        <button
          onClick={() => router.push("/welcome")}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-all"
        >
          Start Your Journey
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
        className="mt-8 text-gray-600 text-center max-w-md"
      >
        Experience the challenge of managing a modern power grid. Balance supply
        and demand, maintain grid frequency, and decarbonize energy production.
      </motion.p>
    </div>
  );
}
