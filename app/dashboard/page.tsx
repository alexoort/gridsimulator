"use client";

import { useState } from "react";
import NetworkStatus from "../components/NetworkStatus";
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

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [simulationState, setSimulationState] = useState<SimulationState>({
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
    battery: {
      capacity: 40,
      currentCharge: 10,
      maxRate: 5,
      efficiency: 0.95,
      currentOutput: 0,
    },
    network: {
      frequency: 50.0,
      loadMW: 0,
      supplyMW: 0,
      customers: 30000,
      isRunning: false,
      speed: 1,
      timeOfDay: 0,
      frequencyHistory: [],
      pid: {
        kp: 12,
        ki: 4,
        kd: 8,
        integral: 0,
        lastError: 0,
        useBattery: false,
      },
    },
    market: {
      pricePerMWh: 50,
      lastPriceUpdate: Date.now(),
      dailyFrequencyDeviations: [],
      solarData: Array(24).fill(0.5),
      windData: Array(24).fill(0.7),
      demandData: Array(24).fill(1000),
    },
    balance: 10000,
    iteration: 0,
    currentDate: "2024-01-01",
    currentHour: 0,
  });

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

  const handleEndSimulation = async () => {
    // Calculate run statistics
    const stats = {
      startDate: "2024-01-01", // Initial date
      endDate: simulationState.currentDate,
      duration: `${simulationState.iteration} ticks`,
      averageFrequency:
        simulationState.network.frequencyHistory.reduce(
          (sum, entry) => sum + entry.frequency,
          0
        ) / Math.max(simulationState.network.frequencyHistory.length, 1),
      maxFrequencyDeviation: Math.max(
        ...simulationState.network.frequencyHistory.map((entry) =>
          Math.abs(entry.frequency - 50)
        )
      ),
      averagePrice: simulationState.market.pricePerMWh,
      totalRevenue: simulationState.balance - 10000, // Subtract initial balance
      totalCosts: 0, // You'll need to track this separately
      profit: simulationState.balance - 10000,
      renewablePercentage:
        (simulationState.generators
          .filter((g) => ["solar", "wind", "hydro"].includes(g.type))
          .reduce((sum, g) => sum + g.currentOutput, 0) /
          simulationState.generators.reduce(
            (sum, g) => sum + g.currentOutput,
            0
          )) *
        100,
      totalEmissions: 0, // You'll need to track this
      averageGridIntensity: 0, // You'll need to track this
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

      if (!response.ok) throw new Error("Failed to save run");

      const { id } = await response.json();

      // Reset simulation state
      setSimulationState((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          isRunning: false,
          frequency: 50.0,
          frequencyHistory: [],
          pid: {
            ...prev.network.pid,
            integral: 0,
            lastError: 0,
          },
        },
        market: {
          ...prev.market,
          dailyFrequencyDeviations: [],
        },
        currentDate: "2024-01-01",
        currentHour: 0,
        iteration: 0,
      }));

      // Redirect to statistics page
      router.push(`/runs?id=${id}`);
    } catch (error) {
      console.error("Failed to save run:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-purple-800">
            Power Grid Simulator
          </h1>

          {/* Simulation Controls */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-purple-800">
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
                  className="w-full"
                  disabled={!simulationState.network.isRunning}
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
                      className="w-full py-1.5 px-4 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                    >
                      Pause
                    </button>
                  ) : (
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
                        className="flex-1 py-1.5 px-4 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                      >
                        Continue
                      </button>
                      <button
                        onClick={handleEndSimulation}
                        className="flex-1 py-1.5 px-4 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        End
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="text-base font-medium text-gray-800">
                {formattedDate}
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formattedTime}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {simulationState.network.isRunning ? (
                  <span className="text-green-600">Simulation Running</span>
                ) : (
                  <span className="text-yellow-500">Simulation Paused</span>
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
          />
        </div>

        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PowerGraph simulationState={simulationState} />
              <BatteryStatus simulationState={simulationState} />
            </div>
            <div className="space-y-6">
              <NetworkStatus
                simulationState={simulationState}
                setSimulationState={setSimulationState}
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
