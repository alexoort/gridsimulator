"use client";

import PageTitle from "../components/PageTitle";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <PageTitle title="About Grid Simulator" />
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
            About This Project
          </h1>

          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              Grid Simulator was inspired by my experience with MIT&apos;s
              course 6.2200 (Power Systems and Climate Change). During the
              course, we used a software called GridGame to simulate power grid
              operations, but I found it slightly outdated and saw an
              opportunity to create something more modern and engaging.
            </p>

            <div className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-3">
                Key Features
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Real-time frequency simulation with PID control</li>
                <li>Dynamic market pricing based on grid stability</li>
                <li>Renewable energy integration challenges</li>
                <li>Modern, responsive user interface</li>
                <li>Comprehensive statistics and performance tracking</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-green-800 mb-3">
                Educational Value
              </h2>
              <p>This simulator helps users understand the complexities of:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Grid frequency management</li>
                <li>Power supply and demand balancing</li>
                <li>Renewable energy integration</li>
                <li>Grid inertia and stability</li>
                <li>Economic aspects of power generation</li>
              </ul>
            </div>

            <p className="text-lg">
              The goal is to provide an engaging, educational tool that
              demonstrates the challenges of managing a modern power grid while
              transitioning to renewable energy sources.
            </p>

            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-3">
                Technical Details
              </h2>
              <p>Built with modern web technologies:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Next.js for the frontend framework</li>
                <li>Real-time simulation using React hooks</li>
                <li>PostgreSQL for data persistence</li>
                <li>Tailwind CSS for styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
