"use client";

import { SimulationState } from "../types/grid";

interface BatteryStatusProps {
  simulationState: SimulationState;
}

export default function BatteryStatus({ simulationState }: BatteryStatusProps) {
  const { battery } = simulationState;
  const chargePercentage = (battery.currentCharge / battery.capacity) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Battery Status</h2>

      <div className="space-y-4">
        {/* Battery Visualization */}
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-80">
            {/* Battery Body */}
            <div className="absolute inset-0 border-4 border-gray-300 rounded-lg">
              {/* Battery Terminal */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-300 rounded-t-lg" />

              {/* Energy Level */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-b-lg"
                style={{ height: `${chargePercentage}%` }}
              />

              {/* Energy Scale */}
              <div className="absolute -left-12 inset-y-0 flex flex-col justify-between text-sm text-gray-600 py-2">
                <span>{battery.capacity}</span>
                <span>{(battery.capacity / 2).toFixed(0)}</span>
                <span>0</span>
              </div>

              {/* Current Value */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 px-2 py-1 rounded text-lg font-semibold">
                  {battery.currentCharge.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
