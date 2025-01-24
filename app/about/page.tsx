"use client";

import Image from "next/image";
import PageTitle from "../components/PageTitle";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        <PageTitle title="About Grid Simulator" />
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
            About This Project
          </h1>

          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/Alex_OortAlonso.jpg"
                  alt="Alex Oort-Alonso"
                  fill
                  style={{ objectFit: "cover" }}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-lg text-gray-700">
                <p className="mb-4">
                  Hi! I&apos;m Alex, a junior at Harvard passionate about energy
                  systems. I was inspired to build this project after taking
                  MIT&apos;s course 6.2200 (Electric Energy Systems). It made me
                  fall in love with the topic, but during the course, we used a
                  software called GridGame to simulate power grid operations.
                </p>
                <p>While GridGame was educational, it had some limitations:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Didn&apos;t work on MacOS</li>
                  <li>Wasn&apos;t based on real data</li>
                  <li>
                    Did not allow users to store their runs or compare them
                    against others
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-8 text-gray-700">
            <p className="text-lg">
              So, I decided to build my own simulator. I wanted to make it
              accessible to everyone, so I built it as a web app using modern
              technologies like Next.js and Tailwind CSS (which I&apos;d never
              used before). Hope you enjoy playing the simulator :)
            </p>

            {/* Features Section with Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-sm border border-purple-100">
                <h2 className="text-2xl font-semibold text-purple-800 mb-4">
                  Key Features
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">⚡</span>
                    Real-time frequency simulation with PID control
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">💰</span>
                    Dynamic market pricing based on grid stability
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">🌱</span>
                    Renewable energy integration challenges
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">📊</span>
                    Comprehensive statistics and tracking
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-sm border border-green-100">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">
                  Educational Value
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">📈</span>
                    Grid frequency management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">⚖️</span>
                    Power supply and demand balancing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">🌞</span>
                    Renewable energy integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">🔄</span>
                    Grid inertia and stability
                  </li>
                </ul>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                Technical Stack
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="font-medium">Next.js</div>
                  <div className="text-sm text-gray-600">
                    Frontend Framework
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-medium">Tailwind CSS</div>
                  <div className="text-sm text-gray-600">Styling</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                  <div className="text-2xl mb-2">🗄️</div>
                  <div className="font-medium">PostgreSQL</div>
                  <div className="text-sm text-gray-600">Database</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-medium">Vercel</div>
                  <div className="text-sm text-gray-600">Deployment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
