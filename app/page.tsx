"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const gameFeatures = [
  {
    title: "Frequency Control",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    description: "Maintain grid stability",
  },
  {
    title: "CO2 Reduction",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
        />
      </svg>
    ),
    description: "Decarbonize the grid",
  },
  {
    title: "Supply & Demand",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    description: "Balance power flow",
  },
];

export default function LandingPage() {
  const router = useRouter();

  // First word animation
  const gridCount = useMotionValue(0);
  const gridRounded = useTransform(gridCount, (latest) => Math.round(latest));
  const gridText = "Grid";
  const gridDisplay = useTransform(gridRounded, (latest) =>
    gridText.slice(0, latest)
  );

  // Second word animation
  const textIndex = useMotionValue(0);
  const texts = ["Game", "Simulator"];
  const baseText = useTransform(textIndex, (latest) => texts[latest] || "");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => {
    const text = baseText.get().slice(0, latest);
    console.log("Current text:", text); // Debug log
    return text;
  });

  // Animation for Grid
  useEffect(() => {
    console.log("Starting Grid animation");
    animate(gridCount, 4, {
      type: "tween",
      duration: 0.5,
      ease: "easeOut",
      onComplete: () => console.log("Grid animation complete"),
    });
  }, []);

  // Animation for the changing word
  useEffect(() => {
    console.log("Setting up word change animation");
    const delay = setTimeout(() => {
      console.log("Starting Game animation");
      animate(count, texts[0].length, {
        type: "tween",
        duration: 0.5,
        ease: "easeOut",
        onComplete() {
          console.log("Game animation complete");
          setTimeout(() => {
            console.log("Starting Game deletion");
            animate(count, 0, {
              duration: 0.5,
              ease: "easeIn",
              onComplete: () => {
                setTimeout(() => {
                  console.log("Game deletion complete, starting Simulator");
                  textIndex.set(1);
                  animate(count, texts[1].length, {
                    duration: 1,
                    ease: "easeOut",
                    onComplete: () =>
                      console.log("Simulator animation complete"),
                  });
                }, 1000);
              },
            });
          }, 1500);
        },
      });
    }, 1000);

    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-6xl font-bold flex items-center mb-8">
        <motion.div className="text-purple-800">
          <motion.span>{gridDisplay}</motion.span>
        </motion.div>
        <motion.div className="text-purple-600 ml-2">
          <motion.span>{displayText}</motion.span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 6, duration: 0.5 }} // Increased delay
      >
        <button
          onClick={() => router.push("/welcome")}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-all"
        >
          Start Now
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6.5, duration: 0.5 }}
        className="mt-8 text-gray-600 text-center max-w-md"
      >
        Experience the challenge of managing a modern power grid. Balance supply
        and demand, maintain grid frequency, and decarbonize energy production.
      </motion.p>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {gameFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 7 + index * 0.2, duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-purple-700 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
