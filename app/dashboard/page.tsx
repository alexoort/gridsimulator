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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [simulationState, setSimulationState] = useState<SimulationState>({
    generators: [],
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
      customers: 0,
      isRunning: false,
      speed: 1,
      timeOfDay: 0,
      pid: {
        kp: 0.5,
        ki: 0.1,
        kd: 0.05,
        integral: 0,
        lastError: 0,
      },
    },
    market: {
      pricePerMWh: 50,
      loadCurve: Array(24).fill(1000),
      solarGenerationCurve: Array(24).fill(0.5),
      windGenerationCurve: Array(24).fill(0.7),
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
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>1x</span>
                  <span>10x</span>
                </div>
                <button
                  onClick={() =>
                    setSimulationState((prev) => ({
                      ...prev,
                      network: {
                        ...prev.network,
                        isRunning: !prev.network.isRunning,
                      },
                    }))
                  }
                  className={`w-full py-1.5 px-4 rounded-lg font-medium transition-colors ${
                    simulationState.network.isRunning
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {simulationState.network.isRunning ? "Stop" : "Start"}
                </button>
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
                  <span className="text-gray-500">Simulation Paused</span>
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
              <NetworkStatus
                simulationState={simulationState}
                setSimulationState={setSimulationState}
              />
            </div>
            <div className="space-y-6">
              <BatteryStatus simulationState={simulationState} />
              <PIDController
                simulationState={simulationState}
                setSimulationState={setSimulationState}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Growth
              simulationState={simulationState}
              setSimulationState={setSimulationState}
            />
            <div className="space-y-6">
              <Assets simulationState={simulationState} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
