"use client";

import { SimulationState } from "../types/grid";
import { useEffect, useState } from "react";
import { EMISSIONS_FACTORS } from "../types/grid";

interface SustainabilityProps {
  simulationState: SimulationState;
  cumulativeEmissions: number;
  maxRenewablePercentage: number;
  totalGeneration: number;
  renewableGeneration: number;
}

export default function Sustainability({
  simulationState,
  cumulativeEmissions,
  maxRenewablePercentage,
  totalGeneration,
  renewableGeneration,
}: SustainabilityProps) {
  // State for display values only
  const [generationMix, setGenerationMix] = useState<
    Record<string, { output: number; emissions: number; percentage: number }>
  >({});
  const [currentEmissions, setCurrentEmissions] = useState(0);
  const [currentIntensity, setCurrentIntensity] = useState(0);
  const [currentRenewable, setCurrentRenewable] = useState(0);

  useEffect(() => {
    if (!simulationState.network.isRunning) return;

    // Calculate generation mix
    const genStats = simulationState.generators.reduce((acc, generator) => {
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
    const totalEmis = Object.values(genStats).reduce(
      (sum, stats) => sum + stats.emissions,
      0
    );

    // Calculate emissions intensity
    const emissionsInt = totalGeneration > 0 ? totalEmis / totalGeneration : 0;

    // Calculate renewable percentage using props
    const renewablePct =
      totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0;

    // Update display values
    setGenerationMix(genStats);
    setCurrentEmissions(totalEmis);
    setCurrentIntensity(emissionsInt);
    setCurrentRenewable(renewablePct);
  }, [
    simulationState.iteration,
    simulationState.generators,
    simulationState.network.isRunning,
    totalGeneration,
    renewableGeneration,
  ]);

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
          <p className="text-sm text-gray-600">Current Emissions Rate</p>
          <p className="text-xl font-semibold">
            {currentEmissions.toFixed(1)} kg CO₂/h
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Grid Intensity</p>
          <p className={getIntensityColor(currentIntensity)}>
            {currentIntensity.toFixed(1)} kg CO₂/MWh
          </p>
        </div>
      </div>

      {/* Cumulative Emissions */}
      <div className="mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Cumulative Emissions</p>
          <p className="text-xl font-semibold">
            {(cumulativeEmissions / 1000).toFixed(2)} tonnes CO₂
          </p>
          <p className="text-xs text-gray-500">Since simulation start</p>
        </div>
      </div>

      {/* Renewable Mix */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Renewable Mix</p>
          <p className={getRenewableColor(currentRenewable)}>
            {currentRenewable.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Maximum Renewable Mix</p>
          <p className={getRenewableColor(maxRenewablePercentage)}>
            {maxRenewablePercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Generation Mix */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Generation Mix
        </h3>
        <div className="space-y-3">
          {Object.entries(generationMix).map(([type, stats]) => (
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
