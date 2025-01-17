"use client";

import { useState } from "react";
import { SimulationState } from "../types/grid";
import FrequencyDial from "./FrequencyDial";
import GameOverModal from "./GameOverModal";

interface NetworkStatusProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function NetworkStatus({
  simulationState,
  setSimulationState,
}: NetworkStatusProps) {
  const [showGameOver, setShowGameOver] = useState(false);

  const handleGameOver = () => {
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        isRunning: false,
      },
    }));
    setShowGameOver(true);
  };

  const handleRestart = () => {
    setShowGameOver(false);
    // Reset simulation state
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        frequency: 50.0,
        loadMW: 0,
        supplyMW: 0,
        isRunning: false,
        pid: {
          ...prev.network.pid,
          integral: 0,
          lastError: 0,
        },
      },
      currentHour: 12, // Start at noon
      currentDate: "2024-01-01",
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        Network Status
      </h2>

      <div className="mb-8 px-10 py-10">
        <FrequencyDial
          frequency={simulationState.network.frequency}
          onGameOver={handleGameOver}
        />
      </div>

      {showGameOver && (
        <GameOverModal
          frequency={simulationState.network.frequency}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
