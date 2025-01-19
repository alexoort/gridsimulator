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

  // Toggle battery control
  const toggleBatteryControl = () => {
    setSimulationState((prev) => ({
      ...prev,
      network: {
        ...prev.network,
        pid: {
          ...prev.network.pid,
          useBattery: !prev.network.pid.useBattery,
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

  // Calculate battery contribution
  const batteryPower = simulationState.battery.currentOutput;
  const maxBatteryRate = simulationState.battery.maxRate;
  const batteryPercentage = (Math.abs(batteryPower) / maxBatteryRate) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        PID Controller
      </h2>

      <div className="space-y-4">
        {/* Battery Control Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Battery Control</div>
            <div className="text-sm text-gray-600">
              Use battery for frequency regulation
            </div>
          </div>
          <button
            onClick={toggleBatteryControl}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pid.useBattery
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {pid.useBattery ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Proportional Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Proportional (Kp)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="50"
              step="2"
              value={simulationState.network.pid.kp}
              onChange={(e) =>
                handleParamChange("kp", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <input
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={simulationState.network.pid.kp}
              onChange={(e) =>
                handleParamChange("kp", parseFloat(e.target.value))
              }
              className="w-20 px-2 py-1 text-sm border rounded text-gray-900"
            />
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
              max="20"
              step="1"
              value={simulationState.network.pid.ki}
              onChange={(e) =>
                handleParamChange("ki", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={simulationState.network.pid.ki}
              onChange={(e) =>
                handleParamChange("ki", parseFloat(e.target.value))
              }
              className="w-20 px-2 py-1 text-sm border rounded text-gray-900"
            />
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
              max="30"
              step="2"
              value={simulationState.network.pid.kd}
              onChange={(e) =>
                handleParamChange("kd", parseFloat(e.target.value))
              }
              className="flex-grow"
            />
            <input
              type="number"
              min="0"
              max="30"
              step="0.1"
              value={simulationState.network.pid.kd}
              onChange={(e) =>
                handleParamChange("kd", parseFloat(e.target.value))
              }
              className="w-20 px-2 py-1 text-sm border rounded text-gray-900"
            />
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Battery Power:</span>
            <span
              className={`font-medium ${
                batteryPower > 0
                  ? "text-green-600"
                  : batteryPower < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {batteryPower.toFixed(1)} MW ({batteryPercentage.toFixed(0)}% of
              max)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
