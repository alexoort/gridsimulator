"use client";

import { SimulationState, GeneratorType } from "../types/grid";

interface GrowthProps {
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
}

const GENERATOR_OPTIONS: Record<
  GeneratorType,
  { capacity: number; cost: number }
> = {
  solar: { capacity: 100, cost: 1000 },
  wind: { capacity: 150, cost: 1500 },
  nuclear: { capacity: 1000, cost: 10000 },
  coal: { capacity: 500, cost: 3000 },
  hydro: { capacity: 300, cost: 4000 },
};

export default function Growth({
  simulationState,
  setSimulationState,
}: GrowthProps) {
  const addGenerator = (type: GeneratorType) => {
    const generator = {
      id: `gen-${Date.now()}`,
      type,
      capacity: GENERATOR_OPTIONS[type].capacity,
      currentOutput: 0,
      cost: GENERATOR_OPTIONS[type].cost,
    };

    setSimulationState({
      ...simulationState,
      generators: [...simulationState.generators, generator],
    });
  };

  const addCustomers = (amount: number) => {
    setSimulationState({
      ...simulationState,
      network: {
        ...simulationState.network,
        customers: simulationState.network.customers + amount,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Growth</h2>

      <div className="space-y-6">
        {/* Add Generation */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Add Generation
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(GENERATOR_OPTIONS).map(([type, details]) => (
              <button
                key={type}
                onClick={() => addGenerator(type as GeneratorType)}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="font-medium capitalize">{type}</div>
                <div className="text-sm text-gray-600">
                  {details.capacity} MW
                </div>
                <div className="text-sm text-gray-600">
                  ${details.cost.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Customers */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Add Customers
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => addCustomers(amount)}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">+{amount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
