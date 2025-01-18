"use client";

import { SimulationState } from "../types/grid";

interface AssetsProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function Assets({
  simulationState,
  setSimulationState,
}: AssetsProps) {
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

  // Group generators by type
  const generatorsByType = simulationState.generators.reduce(
    (acc, generator) => {
      if (!acc[generator.type]) acc[generator.type] = [];
      acc[generator.type].push(generator);
      return acc;
    },
    {} as Record<string, typeof simulationState.generators>
  );

  // Handle decommissioning a generator
  const handleDecommission = (generatorId: string) => {
    setSimulationState((prev) => ({
      ...prev,
      generators: prev.generators.filter((g) => g.id !== generatorId),
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Assets and Revenue</h2>

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
          {Object.entries(generatorsByType).map(([type, generators]) => (
            <div
              key={type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
            >
              <div>
                <div className="font-medium capitalize">{type}</div>
                <div className="text-sm text-gray-600">
                  {generationByType[type].toFixed(1)} MW
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {generators.length} units
                </div>
                <button
                  onClick={() =>
                    handleDecommission(generators[generators.length - 1].id)
                  }
                  className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 12H6"
                    />
                  </svg>
                </button>
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
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Customers Served</div>
          <div className="text-xl font-semibold">
            {simulationState.network.customers.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Market Price</div>
          <div className="text-xl font-semibold">
            ${simulationState.market.pricePerMWh.toFixed(2)}/MWh
          </div>
        </div>
      </div>
    </div>
  );
}
