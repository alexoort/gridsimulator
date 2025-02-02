"use client";

import { SimulationState, GeneratorType } from "../types/grid";
import type { Generator as PowerGenerator } from "../types/grid";
import {
  SunIcon,
  BoltIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  ArrowDownCircleIcon,
  Battery100Icon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface AssetsProps {
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
}

const getGeneratorIcon = (type: GeneratorType) => {
  const className = "w-4 h-4";
  switch (type) {
    case "solar":
      return <SunIcon className={className} />;
    case "wind":
      return <BoltIcon className={className} />;
    case "nuclear":
      return <BeakerIcon className={className} />;
    case "coal":
      return <BuildingOffice2Icon className={className} />;
    case "hydro":
      return <ArrowDownCircleIcon className={className} />;
    default:
      return <BuildingOffice2Icon className={className} />;
  }
};

export default function Assets({
  simulationState,
  setSimulationState,
}: AssetsProps) {
  const removeGenerator = (id: string) => {
    setSimulationState({
      ...simulationState,
      generators: simulationState.generators.filter((g) => g.id !== id),
    });
  };

  // Group generators by type
  const generatorsByType = simulationState.generators.reduce<
    Record<string, Array<PowerGenerator>>
  >((acc, generator) => {
    if (!acc[generator.type]) {
      acc[generator.type] = [];
    }
    acc[generator.type].push(generator);
    return acc;
  }, {});

  // Calculate total hourly fixed costs
  const totalFixedCosts = simulationState.generators.reduce(
    (sum, gen) => sum + (gen.hourlyFixedCost || 0),
    0
  );

  // Calculate operating costs (variable costs based on actual output)
  const operatingCosts = simulationState.generators.reduce(
    (total, generator) => {
      return total + generator.currentOutput * generator.variableCost;
    },
    0
  );

  // Calculate revenue
  const hourlyRevenue =
    Math.min(simulationState.network.supplyMW, simulationState.network.loadMW) *
    simulationState.market.pricePerMWh;

  // Calculate net income per hour
  const netIncomePerHour = hourlyRevenue - operatingCosts - totalFixedCosts;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-purple-800">
            Assets & Revenue
          </h2>
          <div className="text-2xl font-bold text-green-600 mt-1">
            ${simulationState.balance.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Market Price</div>
          <div className="text-2xl font-bold text-purple-600">
            ${simulationState.market.pricePerMWh.toFixed(2)}/MWh
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Financial Overview */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-600">Gross Revenue</div>
            <div className="text-green-600 font-medium">
              ${hourlyRevenue.toFixed(2)}/h
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-600">Operating Costs</div>
            <div className="text-red-600 font-medium">
              -${operatingCosts.toFixed(2)}/h
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-600">Fixed Costs</div>
            <div className="text-red-600 font-medium">
              -${totalFixedCosts.toFixed(2)}/h
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-600">Net Income</div>
            <div
              className={
                netIncomePerHour >= 0
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              ${netIncomePerHour.toFixed(2)}/h
            </div>
          </div>
        </div>

        {/* Generation Assets */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Generation Assets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(generatorsByType).map(([type, generators]) => (
              <div key={type} className="bg-gray-50 rounded p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {getGeneratorIcon(type as GeneratorType)}
                    </div>
                    <span className="font-medium capitalize">{type}</span>
                    <span className="text-gray-500 text-sm">
                      ({generators.length})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {generators[0].capacity * generators.length} MW
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generators.map((generator) => (
                    <button
                      key={generator.id}
                      onClick={() => removeGenerator(generator.id)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-red-50 transition-colors group relative"
                      title="Click to remove"
                    >
                      <TrashIcon className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Assets */}
        <div className="bg-gray-50 rounded p-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Battery100Icon className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Battery Storage</span>
            </div>
            <div className="text-sm text-gray-600">
              {simulationState.battery.capacity} MWh
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max Rate: {simulationState.battery.maxRate} MW
          </div>
        </div>

        {/* Customers */}
        <div className="bg-gray-50 rounded p-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Customers</span>
            </div>
            <div className="text-sm text-gray-600">
              {simulationState.network.customers.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
