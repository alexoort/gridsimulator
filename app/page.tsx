"use client";

import { useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";

export default function LandingPage() {
  // First word animation
  const gridCount = useMotionValue(0);

  // Second word animation
  const textIndex = useMotionValue(0);
  const texts = ["Game", "Simulator"];
  const count = useMotionValue(0);

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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
                Power Grid Simulator
              </h1>
              <p className="text-xl text-purple-700 font-medium">
                Master the art of grid management and sustainable energy
              </p>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Take control of a modern power grid, balance supply and demand,
              maintain grid frequency, and lead the transition to renewable
              energy. Can you keep the lights on while maximizing profits and
              minimizing emissions?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/welcome"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 text-center"
              >
                <span className="flex items-center justify-center gap-2 text-white">
                  Start Playing
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </a>
              <a
                href="/about"
                className="px-8 py-4 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-colors font-medium text-center"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-900/10 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-900">
                  Key Features
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: "Real-time Grid Management",
                      description:
                        "Balance supply and demand while maintaining grid frequency at 50 Hz",
                      icon: "⚡",
                    },
                    {
                      title: "Economic Simulation",
                      description:
                        "Manage costs, revenue, and invest in new power generation",
                      icon: "💰",
                    },
                    {
                      title: "Renewable Integration",
                      description:
                        "Navigate the challenges of integrating solar and wind power",
                      icon: "🌱",
                    },
                    {
                      title: "Advanced Controls",
                      description:
                        "Use PID controllers and battery storage for grid stability",
                      icon: "🎮",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <h4 className="font-medium text-purple-900">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-12">
            Global Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Players", value: "..." },
              { label: "Total Simulations", value: "..." },
              { label: "Grid Hours Managed", value: "..." },
              { label: "CO₂ Saved", value: "..." },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 border border-purple-50"
              >
                <div className="text-sm font-medium text-purple-600 mb-1">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-900 text-transparent bg-clip-text">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
