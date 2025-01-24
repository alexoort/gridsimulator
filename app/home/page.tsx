"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";

interface RunSummary {
  id: string;
  userId: number;
  startTime: string;
  endTime: string;
  moneyMade: number;
  frequencyAverage: number;
  maxRenewablePercentage: number;
  totalEmissions: number;
  realDate: string;
  gridIntensity: number;
  username?: string;
}

interface LeaderboardEntry {
  username: string;
  totalRuns: number;
  bestProfit: number;
  bestFrequency: number;
  bestRenewable: number;
}

export default function HomePage() {
  const router = useRouter();
  const [myRuns, setMyRuns] = useState<RunSummary[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const response = await fetch(`/api/runs?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch runs");
        }
        const data = await response.json();
        setMyRuns(data); // Only show 3 most recent runs
        setTotalRuns(data.length);
      } catch (error) {
        console.error("Error fetching runs:", error);
      }
    };

    fetchRuns();

    // Fetch leaderboard data
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((error) => {
        console.error("Error fetching leaderboard:", error);
        setError(error.message);
      });
  }, []);

  // Add error display to the UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-red-800 font-semibold">Error loading runs</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    localStorage.removeItem("cumulativeGeneration"); // Clear simulation data
    localStorage.removeItem("cumulativeEmissions");
    localStorage.removeItem("maxRenewablePercentage");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <PageTitle title="Home Dashboard" />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
              Grid Simulator
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2 text-white">
                Start New Simulation
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 border border-purple-50">
              <div className="text-sm font-medium text-purple-600 mb-1">
                Total Runs
              </div>
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-900 text-transparent bg-clip-text">
                {totalRuns}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 border border-purple-50">
              <div className="text-sm font-medium text-green-600 mb-1">
                Best Profit
              </div>
              <div className="text-3xl font-bold bg-gradient-to-br from-green-500 to-green-700 text-transparent bg-clip-text">
                $
                {myRuns.length > 0
                  ? Math.round(
                      Math.max(...myRuns.map((r) => r.moneyMade))
                    ).toLocaleString()
                  : "0"}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 border border-purple-50">
              <div className="text-sm font-medium text-purple-600 mb-1">
                Best Frequency Deviation
              </div>
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-900 text-transparent bg-clip-text">
                {myRuns.length > 0
                  ? Math.min(
                      ...myRuns.map((r) => Math.abs(r.frequencyAverage))
                    ).toFixed(3)
                  : "0.000"}{" "}
                Hz
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 border border-purple-50">
              <div className="text-sm font-medium text-green-600 mb-1">
                Best Renewable %
              </div>
              <div className="text-3xl font-bold bg-gradient-to-br from-green-500 to-green-700 text-transparent bg-clip-text">
                {myRuns.length > 0
                  ? Math.max(
                      ...myRuns.map((r) => r.maxRenewablePercentage)
                    ).toFixed(1)
                  : "0"}
                %
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Recent Runs */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
              My Recent Runs
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent hover:scrollbar-thumb-purple-300">
              {myRuns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-purple-400 mb-3">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    No simulation runs yet. Start your first simulation!
                  </p>
                </div>
              ) : (
                myRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => router.push(`/runs/${run.id}`)}
                    className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1 border border-purple-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-bold text-purple-800">
                        Simulation #{run.id} •{" "}
                        {new Date(run.realDate).toLocaleDateString()}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          (run.moneyMade || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${Math.round(run.moneyMade || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <div className="text-xs text-purple-600 font-medium">
                          Avg Frequency Deviation
                        </div>
                        <div className="text-sm font-bold text-purple-900">
                          {(run.frequencyAverage || 50).toFixed(3)} Hz
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <div className="text-xs text-green-600 font-medium">
                          Max Renewable %
                        </div>
                        <div className="text-sm font-bold text-green-700">
                          {(run.maxRenewablePercentage || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <div className="text-xs text-purple-600 font-medium">
                          Average Grid Intensity
                        </div>
                        <div className="text-sm font-bold text-purple-900">
                          {(run.gridIntensity || 0).toFixed(1)} kg/MWh
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Global Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
              Global Leaderboard
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-purple-600 pb-3 border-b border-purple-100">
                <div>User</div>
                <div>Best Profit</div>
                <div>Best Frequency</div>
                <div>Best Renewable %</div>
              </div>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-purple-400 mb-3">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    No leaderboard data available yet.
                  </p>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className="grid grid-cols-4 gap-4 text-sm p-4 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="font-medium text-purple-900">
                      {index + 1}. {entry.username}
                      <div className="text-xs text-purple-500">
                        {entry.totalRuns} runs
                      </div>
                    </div>
                    <div className="font-medium text-green-600">
                      ${Math.round(entry.bestProfit).toLocaleString()}
                    </div>
                    <div className="font-medium text-purple-900">
                      {entry.bestFrequency.toFixed(3)} Hz
                    </div>
                    <div className="font-medium text-green-600">
                      {entry.bestRenewable.toFixed(1)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
