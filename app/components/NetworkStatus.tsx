"use client";

import { SimulationState } from "../types/grid";

interface NetworkStatusProps {
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
}

export default function NetworkStatus({
  simulationState,
  setSimulationState,
}: NetworkStatusProps) {
  const getFrequencyStatus = (freq: number) => {
    if (freq > 50.5) return "text-red-500";
    if (freq < 49.5) return "text-red-500";
    if (freq > 50.2 || freq < 49.8) return "text-yellow-500";
    return "text-green-500";
  };

  const formatFrequency = (freq: number) => freq.toFixed(2);

  const handleSpeedChange = (speed: number) => {
    setSimulationState({
      ...simulationState,
      network: { ...simulationState.network, speed },
    });
  };

  const toggleSimulation = () => {
    setSimulationState({
      ...simulationState,
      network: {
        ...simulationState.network,
        isRunning: !simulationState.network.isRunning,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Network Status</h2>

      <div className="space-y-6">
        {/* Simulation Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Simulation Speed
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={simulationState.network.speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1x</span>
              <span>10x</span>
            </div>
          </div>

          <button
            onClick={toggleSimulation}
            className={`w-full py-2 px-4 rounded-md ${
              simulationState.network.isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white transition-colors`}
          >
            {simulationState.network.isRunning ? "Pause" : "Start"} Simulation
          </button>
        </div>

        {/* Grid Frequency */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Grid Frequency
          </h3>
          <div className="flex items-end gap-2">
            <span
              className={`text-3xl font-bold ${getFrequencyStatus(
                simulationState.network.frequency
              )}`}
            >
              {formatFrequency(simulationState.network.frequency)}
            </span>
            <span className="text-gray-500 mb-1">Hz</span>
          </div>
        </div>

        {/* Load and Supply */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Power Balance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Load</div>
                <div className="text-xl font-semibold text-blue-700">
                  {simulationState.network.loadMW.toFixed(1)} MW
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Supply</div>
                <div className="text-xl font-semibold text-green-700">
                  {simulationState.network.supplyMW.toFixed(1)} MW
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Statistics */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Market Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Customers</div>
              <div className="text-xl font-semibold">
                {simulationState.network.customers.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-xl font-semibold">
                ${simulationState.market.pricePerMWh.toFixed(2)}/MWh
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Time: {simulationState.network.timeOfDay}:00
        </div>
      </div>
    </div>
  );
}
