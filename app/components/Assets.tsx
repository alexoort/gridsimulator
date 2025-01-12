"use client";

import { SimulationState } from "../types/grid";

interface AssetsProps {
  simulationState: SimulationState;
}

export default function Assets({ simulationState }: AssetsProps) {
  // Calculate total generation capacity by type
  const generationByType = simulationState.generators.reduce(
    (acc, generator) => {
      acc[generator.type] = (acc[generator.type] || 0) + generator.capacity;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate total revenue per hour based on current generation and price
  const hourlyRevenue =
    simulationState.network.supplyMW * simulationState.market.pricePerMWh;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Assets</h2>

      {/* Balance */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Balance</h3>
        <div className="text-2xl font-bold text-green-600">
          ${simulationState.balance.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          Revenue: ${hourlyRevenue.toFixed(2)}/hour
        </div>
      </div>

      {/* Generation Assets */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Generation Assets
        </h3>
        <div className="space-y-3">
          {Object.entries(generationByType).map(([type, capacity]) => (
            <div
              key={type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium capitalize">{type}</div>
                <div className="text-sm text-gray-600">
                  {capacity.toFixed(1)} MW
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {
                  simulationState.generators.filter((g) => g.type === type)
                    .length
                }{" "}
                units
              </div>
            </div>
          ))}

          {simulationState.generators.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No generation assets owned
            </div>
          )}
        </div>
      </div>

      {/* Asset Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Capacity</div>
          <div className="text-xl font-semibold">
            {Object.values(generationByType)
              .reduce((a, b) => a + b, 0)
              .toFixed(1)}{" "}
            MW
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Units</div>
          <div className="text-xl font-semibold">
            {simulationState.generators.length}
          </div>
        </div>
      </div>
    </div>
  );
}
