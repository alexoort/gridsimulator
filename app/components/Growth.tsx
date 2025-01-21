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
    // upfront cost per MW: $1000
    capacity: 100,
    cost: 100000,
    inertia: 0.01,
    variableCost: 0, // No fuel cost
  },
  wind: {
    // upfront cost per MW: $1300
    capacity: 100,
    cost: 130000,
    inertia: 1,
    variableCost: 0, // No fuel cost
  },
  nuclear: {
    // upfront cost per MW: $9000
    capacity: 1000,
    cost: 9000000,
    inertia: 5,
    variableCost: 12, // $12 per MWh (fuel + maintenance)
  },
  coal: {
    // upfront cost per MW: $2800
    capacity: 500,
    cost: 1400000,
    inertia: 4,
    variableCost: 30, // $30 per MWh (fuel cost)
  },
  hydro: {
    // upfront cost per MW: $3500
    capacity: 300,
    cost: 1050000,
    inertia: 3,
    variableCost: 3, // $2 per MWh (maintenance)
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
            {[10000, 50000].map((amount) => (
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
