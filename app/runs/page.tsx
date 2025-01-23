"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface RunStatistics {
  id: string;
  userId: number;
  startTime: string;
  endTime: string;
  moneyMade: number;
  frequencyAverage: number;
  maxRenewablePercentage: number;
  totalEmissions: number;
  totalGeneration: number;
  realDate: string;
  endReason: string;
  maxCustomers: number;
  gridIntensity: number;
  username: string;
}

// Loading component
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-xl">Loading run details...</div>
    </div>
  );
}

// Error component
function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-red-500 text-xl mb-4">Error loading run</div>
      <div className="text-gray-600">{error}</div>
    </div>
  );
}

// Separate component for the run statistics content
function RunStatisticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("id");
  const [stats, setStats] = useState<RunStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunStatistics = async () => {
      if (!runId) return;
      try {
        const response = await fetch(`/api/runs/${runId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch run details");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchRunStatistics();
  }, [runId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

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
                <div className="text-lg font-semibold">{stats.startTime}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">End Date</div>
                <div className="text-lg font-semibold">{stats.endTime}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-lg font-semibold">
                  {stats.endTime.split("T")[1]}
                </div>
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
                  {stats.frequencyAverage
                    ? stats.frequencyAverage.toFixed(3)
                    : "N/A"}{" "}
                  Hz
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Generation</div>
                <div className="text-lg font-semibold">
                  {stats.totalGeneration
                    ? (stats.totalGeneration / 1000).toFixed(1)
                    : "N/A"}{" "}
                  GWh
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Peak Customers</div>
                <div className="text-lg font-semibold">
                  {stats.maxCustomers
                    ? stats.maxCustomers.toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">End Reason</div>
                <div className="text-lg font-semibold">
                  {stats.endReason || "N/A"}
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
                <div className="text-sm text-gray-600">Money Made</div>
                <div className="text-lg font-semibold">
                  ${stats.moneyMade ? stats.moneyMade.toLocaleString() : "N/A"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Max Renewable Percentage
                </div>
                <div className="text-lg font-semibold">
                  {stats.maxRenewablePercentage
                    ? stats.maxRenewablePercentage.toFixed(1)
                    : "N/A"}
                  %
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
                <div className="text-sm text-gray-600">Total Emissions</div>
                <div className="text-lg font-semibold">
                  {stats.totalEmissions
                    ? (stats.totalEmissions / 1000).toFixed(1)
                    : "N/A"}{" "}
                  tonnes CO₂
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Grid Intensity</div>
                <div className="text-lg font-semibold">
                  {stats.gridIntensity ? stats.gridIntensity.toFixed(1) : "N/A"}{" "}
                  kg CO₂/MWh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function RunStatistics() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RunStatisticsContent />
    </Suspense>
  );
}
