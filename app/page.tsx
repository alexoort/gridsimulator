"use client";

import { useState } from "react";
import NetworkStatus from "./components/NetworkStatus";
import Growth from "./components/Growth";
import { SimulationState } from "./types/grid";

export default function Dashboard() {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    generators: [],
    network: {
      frequency: 50.0,
      loadMW: 0,
      supplyMW: 0,
      customers: 0,
      isRunning: false,
      speed: 1,
      timeOfDay: 12,
    },
    market: {
      pricePerMWh: 50,
      loadCurve: Array(24)
        .fill(0)
        .map(
          (_, i) => 800 + Math.sin((i * Math.PI) / 12) * 400 // Simulated daily load curve
        ),
      solarGenerationCurve: Array(24)
        .fill(0)
        .map(
          (_, i) => (i >= 6 && i <= 18 ? Math.sin(((i - 6) * Math.PI) / 12) : 0) // Solar generation curve (daylight hours)
        ),
      windGenerationCurve: Array(24)
        .fill(0.7)
        .map((v) => v + Math.random() * 0.3), // Random wind generation
    },
    balance: 10000,
    iteration: 0,
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Power Grid Simulator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <NetworkStatus
              simulationState={simulationState}
              setSimulationState={setSimulationState}
            />
          </div>

          <div className="lg:col-span-4">
            <Growth
              simulationState={simulationState}
              setSimulationState={setSimulationState}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
