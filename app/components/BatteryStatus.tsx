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
      <h2 className="text-xl font-semibold mb-4">Battery Storage</h2>

      <div className="space-y-4">
        {/* Battery Visualization */}
        <div className="flex items-center justify-center">
          <div className="relative h-32 w-[600px]">
            {/* Battery Body */}
            <div className="absolute inset-0 border-4 border-gray-300 rounded-lg bg-gray-50">
              {/* Battery Terminal */}
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-gray-300 rounded-r-lg" />

              {/* Energy Level */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-l-lg flex items-center justify-start pl-4"
                style={{ width: `${chargePercentage}%` }}
              >
                <span className="text-white font-bold text-lg">
                  {battery.currentCharge.toFixed(1)} MWh
                </span>
              </div>

              {/* Power Flow Indicators */}
            </div>
          </div>
        </div>

        {/* Battery Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Capacity</div>
            <div className="text-lg font-semibold">{battery.capacity} MWh</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Max Rate</div>
            <div className="text-lg font-semibold">{battery.maxRate} MW</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Efficiency</div>
            <div className="text-lg font-semibold">
              {(battery.efficiency * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
