"use client";

import { useEffect, useCallback, useState } from "react";
import { SimulationState } from "../types/grid";

interface GridSimulationProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

interface MarketFactors {
  loadFactor: number | null;
  solarFactor: number | null;
  windFactor: number | null;
}

export default function GridSimulation({
  simulationState,
  setSimulationState,
}: GridSimulationProps) {
  const [marketFactors, setMarketFactors] = useState<MarketFactors>({
    loadFactor: null,
    solarFactor: null,
    windFactor: null,
  });

  // Fetch market data from API
  const fetchMarketData = useCallback(async (hour: number) => {
    try {
      const response = await fetch(`/api/market-data?hour=${hour}`);
      if (!response.ok) throw new Error("Failed to fetch market data");
      const data = await response.json();
      setMarketFactors(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      // Keep using the fallback curves from state
    }
  }, []);

  // Calculate total supply based on generators and time of day
  const calculateSupply = useCallback(() => {
    let totalSupply = 0;

    simulationState.generators.forEach((generator) => {
      let output = generator.capacity;

      // Adjust output based on generator type and time
      switch (generator.type) {
        case "solar":
          // Use real data if available, fallback to curve if not
          output *=
            marketFactors.solarFactor ??
            simulationState.market.solarGenerationCurve[
              simulationState.network.timeOfDay
            ];
          break;
        case "wind":
          // Use real data if available, fallback to curve if not
          output *=
            marketFactors.windFactor ??
            simulationState.market.windGenerationCurve[
              simulationState.network.timeOfDay
            ];
          break;
        // Other types maintain constant output
        default:
          break;
      }

      totalSupply += output;
    });

    return totalSupply;
  }, [
    simulationState.generators,
    simulationState.network.timeOfDay,
    simulationState.market,
    marketFactors,
  ]);

  // Calculate load based on customers and time of day
  const calculateLoad = useCallback(() => {
    const baseLoadPerCustomer = 0.001; // 1 kW per customer
    const totalCustomers = simulationState.network.customers;
    // Use real data if available, fallback to curve if not
    const loadMultiplier =
      marketFactors.loadFactor ??
      simulationState.market.loadCurve[simulationState.network.timeOfDay];
    return totalCustomers * baseLoadPerCustomer * loadMultiplier;
  }, [
    simulationState.network.customers,
    simulationState.network.timeOfDay,
    simulationState.market.loadCurve,
    marketFactors,
  ]);

  // Calculate grid frequency based on supply/demand balance
  const calculateFrequency = useCallback((supply: number, load: number) => {
    const nominalFrequency = 50.0;
    const imbalance = supply - load;
    const frequencyChange = (imbalance / Math.max(load, 1)) * 0.5; // Max 0.5 Hz change per step
    return nominalFrequency + frequencyChange;
  }, []);

  // Update simulation state
  useEffect(() => {
    if (!simulationState.network.isRunning) return;

    const intervalId = setInterval(() => {
      // Fetch new market data when hour changes
      const nextHour = (simulationState.network.timeOfDay + 1) % 24;
      fetchMarketData(nextHour);

      setSimulationState((prev: SimulationState): SimulationState => {
        const supply = calculateSupply();
        const load = calculateLoad();
        const frequency = calculateFrequency(supply, load);

        // Calculate price based on frequency deviation
        const frequencyDeviation = Math.abs(50 - frequency);
        const priceMultiplier = 1 + frequencyDeviation / 0.5;
        const basePrice = 50;

        return {
          ...prev,
          network: {
            ...prev.network,
            supplyMW: supply,
            loadMW: load,
            frequency,
            timeOfDay: nextHour,
          },
          market: {
            ...prev.market,
            pricePerMWh: basePrice * priceMultiplier,
          },
          iteration: prev.iteration + 1,
        };
      });
    }, 1000 / simulationState.network.speed);

    return () => clearInterval(intervalId);
  }, [
    simulationState.network.isRunning,
    simulationState.network.speed,
    calculateSupply,
    calculateLoad,
    calculateFrequency,
    fetchMarketData,
  ]);

  return null; // This component only handles simulation logic
}
