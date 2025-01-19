"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface RunStatistics {
  id: string;
  startDate: string;
  endDate: string;
  duration: string;
  averageFrequency: number;
  maxFrequencyDeviation: number;
  averagePrice: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  renewablePercentage: number;
  totalEmissions: number;
  averageGridIntensity: number;
}

export default function RunStatistics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("id");
  const [stats, setStats] = useState<RunStatistics | null>(null);

  useEffect(() => {
    const fetchRunStatistics = async () => {
      if (!runId) return;
      const response = await fetch(`/api/runs/${runId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    };
    fetchRunStatistics();
  }, [runId]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Loading Run Statistics...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">
            Simulation Run Statistics
          </h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            New Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time and Duration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Simulation Period
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Start Date</div>
                <div className="text-lg font-semibold">{stats.startDate}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">End Date</div>
                <div className="text-lg font-semibold">{stats.endDate}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-lg font-semibold">{stats.duration}</div>
              </div>
            </div>
          </div>

          {/* Grid Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Grid Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Average Frequency</div>
                <div className="text-lg font-semibold">
                  {stats.averageFrequency.toFixed(3)} Hz
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Max Deviation</div>
                <div className="text-lg font-semibold">
                  {stats.maxFrequencyDeviation.toFixed(3)} Hz
                </div>
              </div>
            </div>
          </div>

          {/* Financial Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Financial Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Average Price</div>
                <div className="text-lg font-semibold">
                  ${stats.averagePrice.toFixed(2)}/MWh
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-lg font-semibold">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Costs</div>
                <div className="text-lg font-semibold">
                  ${stats.totalCosts.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Net Profit</div>
                <div
                  className={`text-lg font-semibold ${
                    stats.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stats.profit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Sustainability Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Renewable Mix</div>
                <div className="text-lg font-semibold">
                  {stats.renewablePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Emissions</div>
                <div className="text-lg font-semibold">
                  {(stats.totalEmissions / 1000).toFixed(1)} tonnes CO₂
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="text-sm text-gray-600">
                  Average Grid Intensity
                </div>
                <div className="text-lg font-semibold">
                  {stats.averageGridIntensity.toFixed(1)} kg CO₂/MWh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
