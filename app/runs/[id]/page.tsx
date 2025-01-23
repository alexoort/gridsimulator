"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle";

interface RunDetails {
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
  username?: string;
}

function calculateDurationInMonths(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const days = end.getDate() - start.getDate();
  const totalMonths = months + (days > 0 ? 0.5 : 0);
  return totalMonths === 1 ? "1 month" : `${totalMonths} months`;
}

export default function RunPage() {
  const params = useParams();
  const router = useRouter();
  const [run, setRun] = useState<RunDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/runs/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRun(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-purple-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-purple-100 rounded-xl"></div>
              <div className="h-64 bg-purple-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !run) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h2 className="text-red-800 font-semibold mb-2">
              Error loading run details
            </h2>
            <p className="text-red-600">{error || "Run not found"}</p>
          </div>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <PageTitle title={`Run Details - ${run.id}`} />
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
              Simulation {run.id}
            </h1>
            <p className="text-purple-600 text-sm font-medium">
              Completed on {new Date(run.realDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => router.push("/home")}
            className="group px-6 py-3 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-colors font-medium flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Overview Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
              Overview
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900 font-medium">Duration</div>
                <div className="text-purple-700">
                  {calculateDurationInMonths(run.startTime, run.endTime)}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900 font-medium">Profit/Loss</div>
                <div
                  className={`font-bold ${
                    run.moneyMade >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${run.moneyMade.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900 font-medium">Start Date</div>
                <div className="text-purple-700">
                  {new Date(run.startTime).toLocaleDateString()}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900 font-medium">End Date</div>
                <div className="text-purple-700">
                  {new Date(run.endTime).toLocaleDateString()}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900 font-medium">End Reason</div>
                <div className="text-purple-700">{run.endReason || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text mb-6">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Average Frequency Deviation
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {run.frequencyAverage
                    ? run.frequencyAverage.toFixed(3)
                    : "N/A"}{" "}
                  Hz
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <div className="text-sm font-medium text-green-600 mb-1">
                  Peak Renewable Share
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {run.maxRenewablePercentage
                    ? run.maxRenewablePercentage.toFixed(1)
                    : "0"}
                  %
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Total Generation
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {run.totalGeneration
                    ? (run.totalGeneration / 1000).toFixed(1)
                    : "N/A"}{" "}
                  GWh
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Average Grid Intensity
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {run.gridIntensity ? run.gridIntensity.toFixed(1) : "N/A"}
                </div>
                <div className="text-sm text-purple-600 mt-1">kg CO₂/MWh</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Total Emissions
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {run.totalEmissions
                    ? (run.totalEmissions / 1000).toFixed(1)
                    : "N/A"}{" "}
                  tons CO₂
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Peak Customers Served
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {run.maxCustomers ? run.maxCustomers.toLocaleString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
