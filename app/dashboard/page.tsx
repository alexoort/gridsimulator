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
      variableCost: 35,
      hourlyFixedCost: 10,
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
  sustainability: {
    currentEmissions: 0,
    cumulativeEmissions: 0,
    maxRenewablePercentage: 0,
    cumulativeTotalGeneration: 0,
    totalGeneration: 0,
    renewableGeneration: 0,
    generationMix: {},
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

    // Calculate metrics
    const frequencyDeviations =
      simulationState.network.frequencyHistory?.map((entry) =>
        Math.abs(entry.frequency - 50)
      ) || [];

    const averageFrequencyDeviation =
      frequencyDeviations.reduce((sum, deviation) => sum + deviation, 0) /
      (frequencyDeviations.length || 1);

    const maxCustomers = simulationState.network.customers || 0;

    // Calculate grid intensity (kg CO2/MWh)
    const gridIntensity =
      simulationState.sustainability.totalGeneration > 0
        ? simulationState.sustainability.cumulativeEmissions /
          simulationState.sustainability.cumulativeTotalGeneration
        : 0;

    // Prepare stats object with all required fields
    const stats = {
      userId: Number(user.id),
      startTime: "2024-01-01T00:00:00.000Z",
      endTime: simulationState.currentDate,
      moneyMade: simulationState.balance - INITIAL_BALANCE,
      averageFrequencyDeviation,
      maxRenewablePercentage:
        simulationState.sustainability.maxRenewablePercentage,
      totalEmissions: simulationState.sustainability.cumulativeEmissions,
      totalGeneration: simulationState.sustainability.cumulativeTotalGeneration,
      realDate: new Date().toISOString(),
      endReason: reason || "manual",
      maxCustomers,
      gridIntensity,
    };

    console.log("Saving run with stats:", stats);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stats),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Server error details:", responseData);
        throw new Error(`Failed to save run: ${response.status}`);
      }

      console.log("Successfully saved run with ID:", responseData.id);
      router.push(`/runs/${responseData.id}`);
    } catch (error) {
      console.error("Error saving run:", error);
    }
  };

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
                  max="50"
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
                  <span>50x</span>
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
              <div className="flex items-center gap-2 text-sm mt-1">
                <span
                  className={
                    simulationState.network.isRunning
                      ? "text-green-600"
                      : "text-yellow-500"
                  }
                >
                  ● {simulationState.network.isRunning ? "Running" : "Paused"}
                </span>
                <span className="text-gray-300">|</span>
                <span
                  className={`font-medium ${
                    Math.abs(simulationState.network.frequency - 50) > 0.5
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {simulationState.network.frequency.toFixed(2)} Hz
                </span>
              </div>
            </div>

            {/* Balance Display */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 md:flex-initial">
              <div className="text-base font-medium text-purple-900">
                Balance
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 text-transparent bg-clip-text">
                $
                {simulationState.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        </div>

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Hidden div for GridSimulation to maintain state */}
        <div className="hidden">
          <GridSimulation
            simulationState={simulationState}
            setSimulationState={setSimulationState}
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
            <Sustainability simulationState={simulationState} />
            <div className="space-y-6">
              <PowerGraph simulationState={simulationState} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
