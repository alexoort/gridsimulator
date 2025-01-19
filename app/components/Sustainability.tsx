"use client";

import { SimulationState } from "../types/grid";

interface SustainabilityProps {
  simulationState: SimulationState;
}

// Define emissions factors (kg CO2 per MWh) based on lifecycle analysis
const EMISSIONS_FACTORS: Record<string, number> = {
  solar: 41, // Solar PV - roof
  wind: 11, // Wind offshore (using lowest wind value)
  nuclear: 12, // Nuclear
  hydro: 24, // Hydropower
  coal: 820, // Coal
};

export default function Sustainability({
  simulationState,
}: SustainabilityProps) {
  // Calculate total emissions and generation mix
  const totalGeneration = simulationState.generators.reduce(
    (sum, gen) => sum + gen.currentOutput,
    0
  );

  const generatorStats = simulationState.generators.reduce((acc, generator) => {
    const type = generator.type;
    if (!acc[type]) {
      acc[type] = {
        output: 0,
        emissions: 0,
        percentage: 0,
      };
    }
    acc[type].output += generator.currentOutput;
    acc[type].emissions += generator.currentOutput * EMISSIONS_FACTORS[type];
    acc[type].percentage =
      (acc[type].output / Math.max(totalGeneration, 1)) * 100;
    return acc;
  }, {} as Record<string, { output: number; emissions: number; percentage: number }>);

  // Calculate total emissions
  const totalEmissions = Object.values(generatorStats).reduce(
    (sum, stats) => sum + stats.emissions,
    0
  );

  // Calculate emissions intensity (kg CO2 per MWh)
  const emissionsIntensity =
    totalGeneration > 0 ? totalEmissions / totalGeneration : 0;

  // Calculate renewable generation percentage
  const renewableGeneration = simulationState.generators
    .filter((g) => ["solar", "wind", "hydro"].includes(g.type))
    .reduce((sum, g) => sum + g.currentOutput, 0);
  const renewablePercentage =
    totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0;

  // Helper function to get color based on intensity
  const getIntensityColor = (intensity: number) => {
    if (intensity <= 100) return "text-green-600";
    if (intensity <= 300) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to get color based on renewable percentage
  const getRenewableColor = (percentage: number) => {
    if (percentage >= 60) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        Sustainability Metrics
      </h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Emissions</p>
          <p className="text-xl font-semibold">
            {totalEmissions.toFixed(1)} kg CO₂/h
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Grid Intensity</p>
          <p className={getIntensityColor(emissionsIntensity)}>
            {emissionsIntensity.toFixed(1)} kg CO₂/MWh
          </p>
        </div>
      </div>

      {/* Renewable Mix */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Renewable Mix</p>
          <p className={getRenewableColor(renewablePercentage)}>
            {renewablePercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Generation Mix */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Generation Mix
        </h3>
        <div className="space-y-3">
          {Object.entries(generatorStats).map(([type, stats]) => (
            <div
              key={type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium capitalize">{type}</div>
                <div className="text-sm text-gray-600">
                  {stats.output.toFixed(1)} MW ({stats.percentage.toFixed(1)}%)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {stats.emissions.toFixed(1)} kg CO₂/h
                </div>
                <div className="text-xs text-gray-500">
                  {EMISSIONS_FACTORS[type]} kg CO₂/MWh
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
