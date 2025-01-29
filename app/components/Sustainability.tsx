"use client";

import { SimulationState } from "../types/grid";
import { EMISSIONS_FACTORS } from "../types/grid";

interface SustainabilityProps {
  simulationState: SimulationState;
}

export default function Sustainability({
  simulationState,
}: SustainabilityProps) {
  const {
    currentEmissions,
    cumulativeEmissions,
    maxRenewablePercentage,
    totalGeneration,
    renewableGeneration,
    generationMix,
  } = simulationState.sustainability;

  // Calculate current renewable percentage
  const currentRenewablePercentage =
    totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0;

  // Calculate grid intensity (kg CO2/MWh)
  const gridIntensity =
    totalGeneration > 0 ? currentEmissions / totalGeneration : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Sustainability Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Emissions Rate */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg text-gray-600 mb-2">Current Emissions Rate</h3>
          <div className="text-3xl font-bold text-purple-900">
            {currentEmissions?.toFixed(1) || "0.0"}
            <span className="text-lg font-normal">
              {" "}
              kg CO<sub>2</sub>/h
            </span>
          </div>
        </div>

        {/* Grid Intensity */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg text-gray-600 mb-2">Grid Intensity</h3>
          <div className="text-3xl font-bold text-green-600">
            {gridIntensity?.toFixed(1) || "0.0"}
            <span className="text-lg font-normal">
              {" "}
              kg CO<sub>2</sub>/MWh
            </span>
          </div>
        </div>

        {/* Total Cumulative Emissions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg text-gray-600 mb-2">
            Total Cumulative Emissions
          </h3>
          <div className="text-3xl font-bold text-purple-900">
            {((cumulativeEmissions || 0) / 1000).toFixed(2)}
            <span className="text-lg font-normal">
              {" "}
              tonnes CO<sub>2</sub>
            </span>
          </div>
          <div className="text-sm text-gray-500">Since simulation start</div>
        </div>

        {/* Current Renewable Mix */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg text-gray-600 mb-2">Current Renewable Mix</h3>
          <div className="text-3xl font-bold text-red-500">
            {currentRenewablePercentage?.toFixed(1) || "0.0"}%
          </div>
        </div>

        {/* Maximum Renewable Mix */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg text-gray-600 mb-2">Maximum Renewable Mix</h3>
          <div className="text-3xl font-bold text-red-500">
            {maxRenewablePercentage?.toFixed(1) || "0.0"}%
          </div>
        </div>
      </div>

      {/* Generation Mix */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Generation Mix</h3>
        {Object.entries(generationMix).map(([type, output]) => {
          const emissions = output * (EMISSIONS_FACTORS[type] || 0);
          return (
            <div
              key={type}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2"
            >
              <div>
                <div className="font-medium capitalize">{type}</div>
                <div className="text-sm text-gray-600">
                  {output?.toFixed(1) || "0.0"} MW (
                  {((output / (totalGeneration || 1)) * 100)?.toFixed(1) ||
                    "0.0"}
                  %)
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">
                  {emissions?.toFixed(1) || "0.0"} kg CO<sub>2</sub>/h
                </div>
                <div className="text-sm text-gray-600">
                  {EMISSIONS_FACTORS[type] || "0"} kg CO<sub>2</sub>/MWh
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
