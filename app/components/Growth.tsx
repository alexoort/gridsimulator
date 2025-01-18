"use client";

import { SimulationState, GeneratorType } from "../types/grid";

interface GrowthProps {
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
}

interface GeneratorOption {
  capacity: number;
  cost: number;
  inertia: number;
  variableCost: number;
}

const GENERATOR_OPTIONS: Record<GeneratorType, GeneratorOption> = {
  solar: {
    capacity: 100,
    cost: 1000,
    inertia: 0.01,
    variableCost: 0, // No fuel cost
  },
  wind: {
    capacity: 150,
    cost: 1500,
    inertia: 1,
    variableCost: 0, // No fuel cost
  },
  nuclear: {
    capacity: 1000,
    cost: 10000,
    inertia: 5,
    variableCost: 5, // $5 per MWh (fuel + maintenance)
  },
  coal: {
    capacity: 500,
    cost: 3000,
    inertia: 4,
    variableCost: 20, // $20 per MWh (fuel cost)
  },
  hydro: {
    capacity: 300,
    cost: 4000,
    inertia: 3,
    variableCost: 2, // $2 per MWh (maintenance)
  },
};

export default function Growth({
  simulationState,
  setSimulationState,
}: GrowthProps) {
  const addGenerator = (type: GeneratorType) => {
    const cost = GENERATOR_OPTIONS[type].cost;

    // Check if player can afford it
    if (simulationState.balance < cost) {
      alert(
        `Insufficient funds! Need $${cost.toLocaleString()} to build ${type} generator`
      );
      return;
    }

    const generator = {
      id: `gen-${Date.now()}`,
      type,
      capacity: GENERATOR_OPTIONS[type].capacity,
      currentOutput: 0,
      cost: GENERATOR_OPTIONS[type].cost,
      variableCost: GENERATOR_OPTIONS[type].variableCost,
      inertia: GENERATOR_OPTIONS[type].inertia,
    };

    setSimulationState({
      ...simulationState,
      generators: [...simulationState.generators, generator],
      balance: simulationState.balance - cost,
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

  const upgradeBattery = () => {
    const upgradeCost = 2000; // Cost to upgrade battery by 40 MWh

    // Check if player can afford it
    if (simulationState.balance < upgradeCost) {
      alert(
        `Insufficient funds! Need $${upgradeCost.toLocaleString()} to upgrade battery capacity`
      );
      return;
    }

    setSimulationState({
      ...simulationState,
      battery: {
        ...simulationState.battery,
        capacity: simulationState.battery.capacity + 40,
        maxRate: simulationState.battery.maxRate + 5, // Also increase charge/discharge rate
      },
      balance: simulationState.balance - upgradeCost,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">Growth</h2>

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
                <div className="text-sm text-gray-500">
                  Inertia: {details.inertia}s
                </div>
              </button>
            ))}
            <button
              onClick={upgradeBattery}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium">Battery Storage</div>
              <div className="text-sm text-gray-600">+40 MWh</div>
              <div className="text-sm text-gray-600">$2,000</div>
              <div className="text-sm text-gray-500">+5 MW Rate</div>
            </button>
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
