"use client";

import { SimulationState } from "../types/grid";

interface PIDControllerProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function PIDController({
  simulationState,
  setSimulationState,
}: PIDControllerProps) {
  // Handle parameter changes
  const handleParamChange = (param: string, value: number) => {
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        pid: {
          ...prev.network.pid,
          [param]: value,
          // Reset integral and lastError when parameters change
          integral: 0,
          lastError: 0,
        },
      },
    }));
  };

  // Calculate current correction for display
  const error = simulationState.network.frequency - 50; // Error is positive when frequency is too high
  const { pid } = simulationState.network;
  const proportional = pid.kp * error;
  const integral = pid.integral || 0;
  const derivative = pid.kd * (error - (pid.lastError || 0));
  const currentCorrection = -(proportional + integral + derivative); // Negative correction when frequency is too high

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        PID Controller
      </h2>

      <div className="space-y-4">
        {/* Proportional Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Proportional (Kp)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={simulationState.network.pid.kp}
              onChange={(e) =>
                handleParamChange("kp", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <span className="text-sm text-gray-600 w-12">
              {simulationState.network.pid.kp.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Integral Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Integral (Ki)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={simulationState.network.pid.ki}
              onChange={(e) =>
                handleParamChange("ki", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <span className="text-sm text-gray-600 w-12">
              {simulationState.network.pid.ki.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Derivative Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Derivative (Kd)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={simulationState.network.pid.kd}
              onChange={(e) =>
                handleParamChange("kd", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <span className="text-sm text-gray-600 w-12">
              {simulationState.network.pid.kd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status Information */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Frequency Error:</span>
            <span
              className={`font-medium ${
                Math.abs(error) > 0.5 ? "text-red-600" : "text-green-600"
              }`}
            >
              {error.toFixed(3)} Hz
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">PID Terms:</span>
            <span className="font-medium space-x-2">
              <span>P: {(-proportional).toFixed(1)}</span>
              <span>I: {(-integral).toFixed(1)}</span>
              <span>D: {(-derivative).toFixed(1)}</span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Correction:</span>
            <span className="font-medium">{currentCorrection.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
