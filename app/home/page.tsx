"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";

interface RunSummary {
  id: string;
  timestamp: string;
  duration: string;
  profit: number;
  averageFrequency: number;
  renewablePercentage: number;
  totalEmissions: number;
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch user's runs and leaderboard data
    fetch("/api/runs")
      .then((res) => res.json())
      .then((data) => {
        setMyRuns(
          data.sort(
            (a: RunSummary, b: RunSummary) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      });
    // TODO: Add leaderboard API endpoint and fetch
  }, []);

  const handleLogout = () => {
    // Add actual logout logic here later
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <PageTitle title="Home Dashboard" />
      <div className="container mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-800">Grid Simulator</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Start New Simulation
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Recent Runs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              My Recent Runs
            </h2>
            <div className="space-y-3">
              {myRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No simulation runs yet. Start your first simulation!
                </p>
              ) : (
                myRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => router.push(`/runs/${run.id}`)}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">
                        {new Date(run.timestamp).toLocaleDateString()} -{" "}
                        {run.duration}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          run.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${run.profit.toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>Frequency: {run.averageFrequency.toFixed(3)} Hz</div>
                      <div>
                        Renewable: {run.renewablePercentage.toFixed(1)}%
                      </div>
                      <div>
                        CO₂: {(run.totalEmissions / 1000).toFixed(1)} tonnes
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Global Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Global Leaderboard
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                <div>User</div>
                <div>Best Profit</div>
                <div>Best Frequency</div>
                <div>Best Renewable %</div>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No leaderboard data available yet.
                </p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className="grid grid-cols-4 gap-4 text-sm"
                  >
                    <div className="font-medium">
                      {index + 1}. {entry.username}
                      <div className="text-xs text-gray-500">
                        {entry.totalRuns} runs
                      </div>
                    </div>
                    <div className="text-green-600 font-medium">
                      ${entry.bestProfit.toLocaleString()}
                    </div>
                    <div>{entry.bestFrequency.toFixed(3)} Hz</div>
                    <div>{entry.bestRenewable.toFixed(1)}%</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm text-gray-600">Total Runs</div>
                <div className="text-2xl font-bold text-purple-800">
                  {myRuns.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm text-gray-600">Best Profit</div>
                <div className="text-2xl font-bold text-green-600">
                  $
                  {myRuns.length > 0
                    ? Math.max(...myRuns.map((r) => r.profit)).toLocaleString()
                    : "0"}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm text-gray-600">Best Frequency</div>
                <div className="text-2xl font-bold text-purple-800">
                  {myRuns.length > 0
                    ? Math.min(
                        ...myRuns.map((r) => Math.abs(r.averageFrequency - 50))
                      ).toFixed(3)
                    : "0.000"}{" "}
                  Hz
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm text-gray-600">Best Renewable %</div>
                <div className="text-2xl font-bold text-green-600">
                  {myRuns.length > 0
                    ? Math.max(
                        ...myRuns.map((r) => r.renewablePercentage)
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
