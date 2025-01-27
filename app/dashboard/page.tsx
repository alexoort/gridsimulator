"use client";

import { useState } from "react";
import NetworkStatusComponent from "../components/NetworkStatus";
import Growth from "../components/Growth";
import { SimulationState } from "../types/grid";
import GridSimulation from "../components/GridSimulation";
import Assets from "../components/Assets";
import BatteryStatus from "../components/BatteryStatus";
import Tabs from "../components/Tabs";
import PowerGraph from "../components/PowerGraph";
import PIDController from "../components/PIDController";
import Sustainability from "../components/Sustainability";
import { useRouter } from "next/navigation";
import { INITIAL_BALANCE } from "../types/grid";

const getInitialState = (): SimulationState => ({
  network: {
    frequency: 50.0,
    loadMW: 0,
    supplyMW: 0,
    customers: 300000,
    isRunning: false,
    speed: 1,
    timeOfDay: 0,
    frequencyHistory: [],
    pid: {
      kp: 12,
      ki: 4,
      kd: 8,
      integral: 0,
      lastError: undefined,
      useBattery: false,
    },
  },
  battery: {
    capacity: 40,
    currentCharge: 10,
    maxRate: 5,
    efficiency: 0.95,
    currentOutput: 0,
  },
  generators: [
    {
      id: "initial-coal",
      type: "coal",
      capacity: 500,
      currentOutput: 0,
      cost: 3000,
      variableCost: 20,
      inertia: 4,
    },
  ],
  market: {
    pricePerMWh: 50,
    lastPriceUpdate: Date.now(),
    dailyFrequencyDeviations: [],
    solarData: Array(24).fill(0.5),
    windData: Array(24).fill(0.7),
    demandData: Array(24).fill(1000),
  },
  balance: INITIAL_BALANCE,
  iteration: 0,
  currentDate: "2024-01-01",
  currentHour: 0,
});

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [simulationState, setSimulationState] = useState<SimulationState>(
    getInitialState()
  );

  // Format date for display - using UTC to ensure consistency
  const formatDateTime = (date: string, hour: number) => {
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedDate = `${days[dateObj.getUTCDay()]}, ${
      months[dateObj.getUTCMonth()]
    } ${dateObj.getUTCDate()}, ${dateObj.getUTCFullYear()}`;
    const formattedTime = `${hour.toString().padStart(2, "0")}:00`;

    return { formattedDate, formattedTime };
  };

  const { formattedDate, formattedTime } = formatDateTime(
    simulationState.currentDate,
    simulationState.currentHour
  );

  // Export the handleEndSimulation function
  const handleEndSimulation = async (reason?: string) => {
    // Stop the simulation first
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        isRunning: false,
      },
    }));

    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.error("No user found in localStorage");
      return;
    }
    const user = JSON.parse(userStr);

    // Get cumulative values from localStorage
    const cumulativeGeneration = parseFloat(
      localStorage.getItem("cumulativeGeneration") || "0"
    );
    const cumulativeEmissions = parseFloat(
      localStorage.getItem("cumulativeEmissions") || "0"
    );

    // Calculate metrics
    const frequencyDeviations =
      simulationState.network.frequencyHistory?.map((entry) =>
        Math.abs(entry.frequency - 50)
      ) || [];

    const averageFrequencyDeviation =
      frequencyDeviations.reduce((sum, deviation) => sum + deviation, 0) /
      frequencyDeviations.length;

    const maxCustomers = simulationState.network.customers || 0;

    const maxRenewablePercentage = parseFloat(
      localStorage.getItem("maxRenewablePercentage") || "0"
    );

    // delete cumulativeGeneration and cumulativeEmissions from localStorage
    localStorage.removeItem("cumulativeGeneration");
    localStorage.removeItem("cumulativeEmissions");
    localStorage.removeItem("maxRenewablePercentage");

    const gridIntensity =
      cumulativeGeneration > 0 ? cumulativeEmissions / cumulativeGeneration : 0;

    // Prepare stats object
    const stats = {
      userId: Number(user.id),
      startTime: "2024-01-01T00:00:00.000Z",
      endTime: simulationState.currentDate,
      moneyMade: simulationState.balance - INITIAL_BALANCE,
      averageFrequencyDeviation,
      maxRenewablePercentage,
      totalEmissions: cumulativeEmissions, // Use cumulative emissions instead
      totalGeneration: cumulativeGeneration, // Add cumulative generation
      realDate: new Date().toISOString(),
      endReason: reason || "manual",
      maxCustomers,
      gridIntensity,
    };

    try {
      // Save run to database
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error("Failed to save run");
      }

      const { id } = await response.json();

      // Reset simulation state
      setSimulationState((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          isRunning: false,
        },
      }));

      // Clear cumulative values from localStorage
      localStorage.removeItem("cumulativeGeneration");
      localStorage.removeItem("cumulativeEmissions");

      // Redirect to run statistics page
      router.push(`/runs/${id}`);
    } catch (error) {
      console.error("Error saving run:", error);
    }
  };

  // Keep GridSimulation mounted but hidden
  const [cumulativeEmissions, setCumulativeEmissions] = useState(0);
  const [maxRenewablePercentage, setMaxRenewablePercentage] = useState(0);
  const [totalGeneration, setTotalGeneration] = useState(0);
  const [renewableGeneration, setRenewableGeneration] = useState(0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
              Power Grid Simulator
            </h1>
          </div>

          {/* Simulation Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            {/* Speed Control */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 md:flex-initial">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-purple-900">
                  Simulation Speed
                </h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={simulationState.network.speed}
                  onChange={(e) =>
                    setSimulationState((prev) => ({
                      ...prev,
                      network: {
                        ...prev.network,
                        speed: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-purple-600"
                  disabled={
                    !simulationState.network.isRunning ||
                    simulationState.iteration === 0
                  }
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>1x</span>
                  <span>10x</span>
                </div>
                <div className="flex gap-2">
                  {simulationState.network.isRunning ? (
                    <button
                      onClick={() =>
                        setSimulationState((prev) => ({
                          ...prev,
                          network: {
                            ...prev.network,
                            isRunning: false,
                          },
                        }))
                      }
                      className="w-full py-2 px-4 rounded-xl font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white transition-all duration-200 shadow-lg hover:shadow-yellow-200 hover:-translate-y-0.5"
                    >
                      Pause
                    </button>
                  ) : simulationState.iteration > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          setSimulationState((prev) => ({
                            ...prev,
                            network: {
                              ...prev.network,
                              isRunning: true,
                            },
                          }))
                        }
                        className="flex-1 py-2 px-4 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 shadow-lg hover:shadow-green-200 hover:-translate-y-0.5"
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => handleEndSimulation()}
                        className="flex-1 py-2 px-4 rounded-xl font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-lg hover:shadow-red-200 hover:-translate-y-0.5"
                      >
                        End
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        setSimulationState((prev) => ({
                          ...prev,
                          network: {
                            ...prev.network,
                            isRunning: true,
                          },
                        }))
                      }
                      className="w-full py-2 px-4 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 shadow-lg hover:shadow-green-200 hover:-translate-y-0.5"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Time Display */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 md:flex-initial">
              <div className="text-base font-medium text-purple-900">
                {formattedDate}
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 text-transparent bg-clip-text">
                {formattedTime}
              </div>
              <div className="text-sm mt-1">
                {simulationState.network.isRunning ? (
                  <span className="text-green-600 font-medium">● Running</span>
                ) : (
                  <span className="text-yellow-500 font-medium">● Paused</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Keep GridSimulation mounted but hidden */}
        <div className="hidden">
          <GridSimulation
            simulationState={simulationState}
            setSimulationState={setSimulationState}
            onMetricsUpdate={(metrics) => {
              setCumulativeEmissions(metrics.cumulativeEmissions);
              setMaxRenewablePercentage(metrics.maxRenewablePercentage);
              setTotalGeneration(metrics.totalGeneration);
              setRenewableGeneration(metrics.renewableGeneration);
            }}
          />
        </div>

        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PowerGraph simulationState={simulationState} />
              <BatteryStatus simulationState={simulationState} />
            </div>
            <div className="space-y-6">
              <NetworkStatusComponent
                simulationState={simulationState}
                setSimulationState={setSimulationState}
                onNetworkError={() => handleEndSimulation("network_failure")}
              />
              <PIDController
                simulationState={simulationState}
                setSimulationState={setSimulationState}
              />
            </div>
          </div>
        ) : activeTab === "growth" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Growth
              simulationState={simulationState}
              setSimulationState={setSimulationState}
            />
            <div className="space-y-6">
              <Assets
                simulationState={simulationState}
                setSimulationState={setSimulationState}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Sustainability
              simulationState={simulationState}
              cumulativeEmissions={cumulativeEmissions}
              maxRenewablePercentage={maxRenewablePercentage}
              totalGeneration={totalGeneration}
              renewableGeneration={renewableGeneration}
            />
            <div className="space-y-6">
              <PowerGraph simulationState={simulationState} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
