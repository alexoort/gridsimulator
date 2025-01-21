"use client";

import { useState } from "react";
import { SimulationState } from "../types/grid";
import FrequencyDial from "./FrequencyDial";
import GameOverModal from "./GameOverModal";

interface NetworkStatusProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onNetworkError: () => void;
}

export default function NetworkStatus({
  simulationState,
  setSimulationState,
  onNetworkError,
}: NetworkStatusProps) {
  const [showGameOver, setShowGameOver] = useState(false);

  // Get current frequency and calculate deviation
  const currentFrequency = simulationState.network.frequency;
  const deviation = Math.abs(currentFrequency - 50);

  // Calculate total grid inertia from all generators
  const totalInertia = simulationState.generators.reduce((sum, generator) => {
    // Only count inertia from generators that are actually producing power
    return sum + (generator.currentOutput > 0 ? generator.inertia : 0);
  }, 0);

  const handleGameOver = () => {
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        isRunning: false,
      },
    }));
    setShowGameOver(true);
    // Store the run in the background
    onNetworkError();
  };

  const handleReturnHome = () => {
    setShowGameOver(false);
    window.location.href = "/";
  };

  // Check for critical frequency deviation
  if (deviation >= 2.0 && simulationState.network.isRunning && !showGameOver) {
    handleGameOver();
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        Network Status
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Deviation</p>
          <p className={`text-xl font-semibold`}>{deviation.toFixed(3)} Hz</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Grid Inertia</p>
          <p className={`text-xl font-semibold`}>{totalInertia.toFixed(1)} s</p>
        </div>
      </div>

      <div className="mt-8 px-10 py-10">
        <FrequencyDial
          frequency={simulationState.network.frequency}
          onGameOver={handleGameOver}
        />
      </div>

      {showGameOver && (
        <GameOverModal
          frequency={simulationState.network.frequency}
          onRestart={handleReturnHome}
          buttonText="Return to Home"
        />
      )}
    </div>
  );
}
