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
  hourlyFixedCost: number;
}

const GENERATOR_OPTIONS: Record<GeneratorType, GeneratorOption> = {
  solar: {
    capacity: 100,
    cost: 13000000,
    inertia: 0.01,
    variableCost: 0,
    hourlyFixedCost: 0.85616438,
  },
  wind: {
    capacity: 100,
    cost: 17000000,
    inertia: 1,
    variableCost: 7.5,
    hourlyFixedCost: 3.62442922,
  },
  nuclear: {
    capacity: 1000,
    cost: 70000000,
    inertia: 5,
    variableCost: 7,
    hourlyFixedCost: 1.14155251,
  },
  coal: {
    capacity: 500,
    cost: 40000000,
    inertia: 4,
    variableCost: 35,
    hourlyFixedCost: 10,
  },
  hydro: {
    capacity: 300,
    cost: 45000000,
    inertia: 3,
    variableCost: 0,
    hourlyFixedCost: 10.2739726,
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
      hourlyFixedCost: GENERATOR_OPTIONS[type].hourlyFixedCost,
      inertia: GENERATOR_OPTIONS[type].inertia,
    };

    setSimulationState({
      ...simulationState,
      generators: [...simulationState.generators, generator],
      balance: simulationState.balance - cost,
    });
  };

  const getGeneratorIcon = (type: GeneratorType) => {
    switch (type) {
      case "solar":
        return "☀️";
      case "wind":
        return "🌪️";
      case "nuclear":
        return "⚛️";
      case "coal":
        return "🏭";
      case "hydro":
        return "💧";
      default:
        return "🏢";
    }
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
    const upgradeCost = 1300000; // From Excel: Battery cost
    const batteryCapacity = 50; // From Excel: Battery capacity

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
        capacity: simulationState.battery.capacity + batteryCapacity,
        maxRate: simulationState.battery.maxRate + batteryCapacity / 8, // Scale charge/discharge rate with capacity
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
                <div className="font-medium flex items-center gap-2">
                  {getGeneratorIcon(type as GeneratorType)} {type}
                </div>
                <div className="text-sm text-gray-600">
                  {details.capacity} MW
                </div>
                <div className="text-sm text-gray-600">
                  ${details.cost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Variable: ${details.variableCost}/MWh
                </div>
                <div className="text-sm text-gray-500">
                  Fixed: ${details.hourlyFixedCost.toLocaleString()}/hour
                </div>
              </button>
            ))}
            <button
              onClick={upgradeBattery}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium flex items-center gap-2">
                🔋 Battery Storage
              </div>
              <div className="text-sm text-gray-600">+50 MWh</div>
              <div className="text-sm text-gray-600">$1,300,000</div>
              <div className="text-sm text-gray-500">Variable: $5/MWh</div>
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
