"use client";

import { SimulationState } from "../types/grid";
import { useEffect, useRef } from "react";

interface AssetsProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function Assets({
  simulationState,
  setSimulationState,
}: AssetsProps) {
  // Refs for tracking values between renders
  const generationByTypeRef = useRef<Record<string, number>>({});
  const hourlyRevenueRef = useRef<number>(0);
  const operatingCostsRef = useRef<number>(0);
  const fixedCostsRef = useRef<number>(0);
  const netIncomePerHourRef = useRef<number>(0);
  const generatorsByTypeRef = useRef<
    Record<string, typeof simulationState.generators>
  >({});

  useEffect(() => {
    // Calculate total generation capacity by type
    const newGenerationByType = simulationState.generators.reduce(
      (acc, generator) => {
        acc[generator.type] = (acc[generator.type] || 0) + generator.capacity;
        return acc;
      },
      {} as Record<string, number>
    );
    generationByTypeRef.current = newGenerationByType;

    // Calculate total revenue per hour based on current generation and price
    const newHourlyRevenue =
      simulationState.network.supplyMW * simulationState.market.pricePerMWh;
    hourlyRevenueRef.current = newHourlyRevenue;

    // Calculate operating costs (variable costs based on actual output)
    const newOperatingCosts = simulationState.generators.reduce(
      (total, generator) => {
        return total + generator.currentOutput * generator.variableCost;
      },
      0
    );
    operatingCostsRef.current = newOperatingCosts;

    // Calculate fixed costs (1% of initial cost per day, converted to hourly)
    const newFixedCosts = simulationState.generators.reduce(
      (total, generator) => {
        const dailyFixedCost = generator.cost * 0.01; // 1% of initial cost per day
        return total + dailyFixedCost / 24; // Convert to hourly
      },
      0
    );
    fixedCostsRef.current = newFixedCosts;

    // Calculate net income per hour
    const newNetIncomePerHour =
      newHourlyRevenue - newOperatingCosts - newFixedCosts;
    netIncomePerHourRef.current = newNetIncomePerHour;

    // Group generators by type
    const newGeneratorsByType = simulationState.generators.reduce(
      (acc, generator) => {
        if (!acc[generator.type]) acc[generator.type] = [];
        acc[generator.type].push(generator);
        return acc;
      },
      {} as Record<string, typeof simulationState.generators>
    );
    generatorsByTypeRef.current = newGeneratorsByType;
  }, [
    simulationState.generators,
    simulationState.network.supplyMW,
    simulationState.market.pricePerMWh,
    simulationState.iteration,
    simulationState.currentDate,
  ]);

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

      {/* Balance and Revenue Details */}
      <div className="mb-6 space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Balance</h3>
        <div className="text-2xl font-bold text-green-600">
          ${simulationState.balance.toLocaleString()}
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 flex justify-between">
            <span>Gross Revenue:</span>
            <span className="text-green-600">
              ${hourlyRevenueRef.current.toFixed(2)}/hour
            </span>
          </div>
          <div className="text-sm text-gray-600 flex justify-between">
            <span>Operating Costs:</span>
            <span className="text-red-600">
              -${operatingCostsRef.current.toFixed(2)}/hour
            </span>
          </div>
          <div className="text-sm text-gray-600 flex justify-between">
            <span>Fixed Costs:</span>
            <span className="text-red-600">
              -${fixedCostsRef.current.toFixed(2)}/hour
            </span>
          </div>
          <div className="text-sm font-medium flex justify-between border-t pt-1">
            <span>Net Income:</span>
            <span
              className={
                netIncomePerHourRef.current >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              ${netIncomePerHourRef.current.toFixed(2)}/hour
            </span>
          </div>
        </div>
      </div>

      {/* Generation Assets */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Generation Assets
        </h3>
        <div className="space-y-3">
          {Object.entries(generatorsByTypeRef.current).map(
            ([type, generators]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
              >
                <div>
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-sm text-gray-600">
                    {generationByTypeRef.current[type].toFixed(1)} MW
                  </div>
                  <div className="text-xs text-gray-500">
                    Fixed Cost: ${((generators[0].cost * 0.01) / 24).toFixed(2)}
                    /hour per unit
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
            )
          )}

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
            {Object.values(generationByTypeRef.current)
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
