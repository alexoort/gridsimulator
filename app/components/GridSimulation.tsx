"use client";

import { useEffect, useCallback, useState } from "react";
import {
  BASE_CUSTOMERS,
  SimulationState,
  Generator,
  SustainabilityStatus,
  NetworkStatus,
} from "../types/grid";
import { EMISSIONS_FACTORS } from "../types/grid";
import Sustainability from "./Sustainability";

interface GridSimulationProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

interface MarketData {
  date: string;
  hour: number;
  load_mw: number;
  solar_factor: number;
  wind_factor: number;
}

interface MarketResponse {
  success: boolean;
  data: MarketData[];
  summary: {
    total_load: number;
    avg_load: number;
    avg_solar: number;
    avg_wind: number;
  };
  metadata: {
    start_date: string;
    start_hour: number;
    range: number;
    total_records: number;
  };
}

export default function GridSimulation({
  simulationState,
  setSimulationState,
}: GridSimulationProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState("2024-01-01");

  // Helper function to get next date
  const getNextDate = useCallback((currentDate: string) => {
    const [year, month, day] = currentDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + 1);

    // If we've gone past 2024, reset to January 1st, 2024
    if (date.getUTCFullYear() > 2024) {
      return "2024-01-01";
    }

    return date.toISOString().split("T")[0];
  }, []);

  // Helper function to check if it's time to fetch new data
  const shouldFetchNewData = useCallback(
    (currentDate: string, lastFetch: string) => {
      const [cyear, cmonth, cday] = currentDate.split("-").map(Number);
      const [lyear, lmonth, lday] = lastFetch.split("-").map(Number);
      const current = new Date(Date.UTC(cyear, cmonth - 1, cday));
      const lastFetchDay = new Date(Date.UTC(lyear, lmonth - 1, lday));
      const diffTime = current.getTime() - lastFetchDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 7;
    },
    []
  );

  // Fetch market data function
  const fetchMarketData = useCallback(
    async (startHour: number) => {
      try {
        const response = await fetch(
          `/api/market-data?date=${simulationState.currentDate}&hour=${startHour}&range=168`
        );
        const data: MarketResponse = await response.json();

        if (data.success) {
          setMarketData(data.data);
          setCurrentDataIndex(0);
          setLastFetchDate(simulationState.currentDate);
          console.log("Fetched new market data:", {
            date: simulationState.currentDate,
            dataPoints: data.data.length,
          });
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    },
    [simulationState.currentDate]
  );

  // Initialize market data
  useEffect(() => {
    if (!isInitialized) {
      // Clear cumulative values when starting new simulation

      const startHour = 0; // Start at midnight
      fetchMarketData(startHour);
      // Update initial simulation state to start at midnight
      setSimulationState((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          timeOfDay: startHour,
        },
        currentHour: startHour,
        currentDate: "2024-01-01", // Start on January 1st at midnight
      }));
      setIsInitialized(true);
    }
  }, [fetchMarketData, isInitialized, setSimulationState]);

  // Calculate total supply based on generators and market data
  const calculateSupply = useCallback(
    (
      generators: Generator[],
      frequency: number,
      pid: NetworkStatus["pid"],
      currentMarketData: MarketData | undefined
    ) => {
      // Calculate PID correction
      const error = frequency - 50;
      const lastError = pid.lastError ?? error;

      // Calculate PID terms
      const proportionalTerm = pid.kp * error;
      const derivativeTerm = pid.kd * (error - lastError);
      const newIntegral = (pid.integral || 0) + error;
      const maxIntegral = 100 / pid.ki;
      const clampedIntegral = Math.max(
        -maxIntegral,
        Math.min(maxIntegral, newIntegral)
      );
      const integralTerm = pid.ki * clampedIntegral;

      const pidCorrection = -(proportionalTerm + integralTerm + derivativeTerm);

      // Calculate outputs
      const updatedGenerators = generators.map((generator) => {
        let output = generator.capacity;

        if (currentMarketData) {
          switch (generator.type) {
            case "solar":
              output *= currentMarketData.solar_factor;
              break;
            case "wind":
              output *= currentMarketData.wind_factor;
              break;
            default:
              const correctionFactor = Math.max(
                -0.5,
                Math.min(0.5, pidCorrection / 100)
              );
              output *= 1 + correctionFactor;
              break;
          }
        }

        return {
          ...generator,
          currentOutput: output,
        };
      });

      const totalSupply = updatedGenerators.reduce(
        (sum, gen) => sum + (gen.currentOutput || 0),
        0
      );

      return {
        updatedGenerators,
        totalSupply,
        newPidState: {
          ...pid,
          integral: clampedIntegral,
          lastError: error,
        },
      };
    },
    []
  );

  // Calculate load based on market data and customer base

  const calculateLoad = useCallback(() => {
    const currentMarketData = marketData[currentDataIndex];
    if (!currentMarketData) return 0;

    // Scale the historical load based on our current customer base
    const customerRatio = simulationState.network.customers / BASE_CUSTOMERS;
    return currentMarketData.load_mw * customerRatio;
  }, [marketData, currentDataIndex, simulationState.network.customers]);

  // Calculate total system inertia from all generators using weighted average
  const calculateSystemInertia = useCallback(() => {
    // Calculate sum of (inertia * rated power) for each generator
    const weightedInertiaSum = simulationState.generators.reduce(
      (sum, generator) => {
        const product = generator.inertia * generator.capacity;
        return sum + product;
      },
      0
    );

    // Calculate total system base power (sum of all generator capacities)
    const totalBasePower = simulationState.generators.reduce(
      (sum, generator) => {
        return sum + generator.capacity;
      },
      0
    );

    // If no generators, return 0 to avoid division by zero
    if (totalBasePower === 0) {
      console.log("No generators or zero total base power");
      return 0;
    }

    // Calculate weighted average: Htotal = Σ(Hi * Si) / Sbase
    const totalInertia = weightedInertiaSum / totalBasePower;

    return totalInertia;
  }, [simulationState.generators]);

  // Calculate grid frequency based on supply/demand balance and system inertia
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateFrequency = useCallback(
    (supply: number, load: number, currentFrequency: number) => {
      const nominalFrequency = 50.0; // f0
      const powerImbalance = supply - load; // ΔP = Pgen - Pload
      const systemInertia = calculateSystemInertia(); // H

      // If there's no inertia (no generators), return current frequency
      if (systemInertia === 0) return currentFrequency;

      // Implement the formula: Δf = ΔP / (2H * f0)
      const frequencyDeviation =
        powerImbalance / (2 * systemInertia * nominalFrequency);

      return currentFrequency + frequencyDeviation;
    },
    [calculateSystemInertia]
  );

  // Calculate battery contribution to balance supply and demand
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateBatteryPower = useCallback(
    (supply: number, load: number) => {
      const imbalance = load - supply; // Positive means we need more power
      const battery = simulationState.battery;

      // If perfectly balanced or battery is unusable, no action needed
      if (Math.abs(imbalance) < 0.01) return 0;
      if (battery.currentCharge <= 0 && imbalance > 0) return 0; // Can't discharge an empty battery
      if (battery.currentCharge >= battery.capacity && imbalance < 0) return 0; // Can't charge a full battery

      let batteryPower = 0;

      if (imbalance > 0) {
        // Need to discharge (negative power)
        const maxDischarge = Math.min(
          battery.maxRate, // Limited by rate
          battery.currentCharge * battery.efficiency, // Limited by available energy
          imbalance // Limited by what's needed
        );
        batteryPower = -maxDischarge;
      } else {
        // Can charge (positive power)
        const maxCharge = Math.min(
          battery.maxRate, // Limited by rate
          (battery.capacity - battery.currentCharge) / battery.efficiency, // Limited by remaining capacity
          -imbalance // Limited by excess power
        );
        batteryPower = maxCharge;
      }

      return batteryPower;
    },
    [simulationState.battery]
  );

  // Update battery state based on power flow
  const updateBatteryState = useCallback(
    (batteryPower: number) => {
      // Calculate energy change (in MWh)
      // For charging (positive power): apply efficiency loss
      // For discharging (negative power): apply efficiency loss
      const energyChange =
        batteryPower *
        (batteryPower > 0
          ? simulationState.battery.efficiency
          : 1 / simulationState.battery.efficiency);

      const newCharge = Math.max(
        0,
        Math.min(
          simulationState.battery.capacity,
          simulationState.battery.currentCharge + energyChange
        )
      );

      return {
        ...simulationState.battery,
        currentCharge: newCharge,
        currentOutput: batteryPower,
      };
    },
    [simulationState.battery, simulationState.network.speed]
  );

  // Calculate revenue and costs using actual generator outputs
  const calculateFinancials = useCallback(
    (supply: number, batteryPower: number, pricePerMWh: number) => {
      // Calculate revenue from power delivered (per hour)
      // Only get paid for what's actually consumed (min between supply and load)
      const currentLoad = calculateLoad();
      const powerDelivered = Math.min(supply, currentLoad);
      const revenue = powerDelivered * pricePerMWh;

      // Calculate operational costs for each generator (per hour)
      const operationalCosts = simulationState.generators.reduce(
        (total, generator) => {
          // Use the actual current output for cost calculation
          const variableCost = generator.currentOutput * generator.variableCost;
          return total + variableCost;
        },
        0
      );

      // Calculate battery operational costs (per hour)
      const batteryOpCost = Math.abs(batteryPower) * 1; // $1 per MWh of battery usage

      // Calculate net income
      const netIncome = revenue - operationalCosts - batteryOpCost;

      return netIncome;
    },
    [simulationState.generators, calculateLoad]
  );

  const calculatePrice = (deviations: number[]) => {
    // Calculate average deviation for base price
    const avgDeviation = deviations.reduce((a, b) => a + b) / deviations.length;
    const MaxDeviation = 1;
    const normalizedDeviation = Math.min(avgDeviation / MaxDeviation, 1);
    let price = 200 - normalizedDeviation * 180; // Base price range 20-200

    // Find maximum deviation in the period
    const maxDeviation = Math.max(...deviations);

    // Add penalties for large deviations
    if (maxDeviation > 1) {
      // Calculate penalty that increases with larger deviations
      // Start with $50 penalty at 1 Hz and increase quadratically

      const penalty = 30 * maxDeviation;
      price = Math.max(20, price - penalty); // Ensure price doesn't go below $20
    }

    return price;
  };

  const calculateSustainability = useCallback(
    (generators: Generator[]): SustainabilityStatus => {
      // Calculate total and renewable generation for current render
      const currentTotalGeneration = generators.reduce(
        (sum: number, gen: Generator) => sum + (gen.currentOutput || 0),
        0
      );

      const currentRenewableGeneration = generators
        .filter((g: Generator) => ["solar", "wind", "hydro"].includes(g.type))
        .reduce((sum: number, g: Generator) => sum + (g.currentOutput || 0), 0);

      // Calculate emissions for this tick
      const currentEmissions = generators.reduce(
        (total: number, generator: Generator) => {
          const emissionsFactor = EMISSIONS_FACTORS[generator.type] || 0;
          return total + (generator.currentOutput || 0) * emissionsFactor;
        },
        0
      );

      // Calculate generation mix
      const generationMix = generators.reduce(
        (mix: Record<string, number>, generator: Generator) => {
          mix[generator.type] = generator.currentOutput || 0;
          return mix;
        },
        {} as Record<string, number>
      );

      console.log("Calculating sustainability metrics:", {
        currentTotalGeneration,
        currentRenewableGeneration,
        currentEmissions,
        previousState: {
          cumulativeEmissions:
            simulationState.sustainability.cumulativeEmissions,
          cumulativeTotalGeneration:
            simulationState.sustainability.cumulativeTotalGeneration,
          maxRenewablePercentage:
            simulationState.sustainability.maxRenewablePercentage,
        },
        generators: generators.map((g: Generator) => ({
          type: g.type,
          output: g.currentOutput,
          emissions: (g.currentOutput || 0) * (EMISSIONS_FACTORS[g.type] || 0),
        })),
      });

      // Create new sustainability metrics
      const newSustainability: SustainabilityStatus = {
        currentEmissions,
        cumulativeEmissions:
          simulationState.sustainability.cumulativeEmissions + currentEmissions,
        maxRenewablePercentage: Math.max(
          simulationState.sustainability.maxRenewablePercentage,
          (currentRenewableGeneration / currentTotalGeneration) * 100 || 0
        ),
        cumulativeTotalGeneration:
          simulationState.sustainability.cumulativeTotalGeneration +
          currentTotalGeneration,
        totalGeneration: currentTotalGeneration,
        renewableGeneration: currentRenewableGeneration,
        generationMix,
      };

      console.log("Updated sustainability metrics:", {
        newMetrics: {
          currentEmissions: newSustainability.currentEmissions,
          cumulativeEmissions: newSustainability.cumulativeEmissions,
          maxRenewablePercentage: newSustainability.maxRenewablePercentage,
          cumulativeTotalGeneration:
            newSustainability.cumulativeTotalGeneration,
          totalGeneration: newSustainability.totalGeneration,
          renewableGeneration: newSustainability.renewableGeneration,
        },
        change: {
          emissionsChange:
            newSustainability.cumulativeEmissions -
            simulationState.sustainability.cumulativeEmissions,
          generationChange:
            newSustainability.cumulativeTotalGeneration -
            simulationState.sustainability.cumulativeTotalGeneration,
        },
      });

      return newSustainability;
    },
    [simulationState.sustainability]
  );

  // Simulation update callback
  const updateSimulation = useCallback(() => {
    if (!simulationState.network.isRunning) return;

    const intervalId = setInterval(() => {
      setSimulationState((prev: SimulationState): SimulationState => {
        // Progress time
        let newHour = prev.currentHour + 1;
        let newDate = prev.currentDate;

        // If we've reached the end of the day
        if (newHour >= 24) {
          newHour = 0;
          newDate = getNextDate(prev.currentDate);
        }

        // Progress through market data
        const nextDataIndex = (currentDataIndex + 1) % marketData.length;
        setCurrentDataIndex(nextDataIndex);

        const currentMarketData = marketData[currentDataIndex];

        // Calculate supply and generator updates
        const { updatedGenerators, totalSupply, newPidState } = calculateSupply(
          prev.generators,
          prev.network.frequency,
          prev.network.pid,
          currentMarketData
        );

        // Calculate load
        const load = currentMarketData
          ? currentMarketData.load_mw *
            (prev.network.customers / BASE_CUSTOMERS)
          : 0;

        // Calculate battery contribution
        const batteryPower = calculateBatteryPower(totalSupply, load);
        const finalSupply = totalSupply - batteryPower; // Subtract because negative means discharge

        // Update battery state
        const newBatteryState = updateBatteryState(batteryPower);

        // Calculate grid frequency with battery contribution
        const frequency = calculateFrequency(
          finalSupply,
          load,
          prev.network.frequency
        );

        // Update frequency history
        const newFrequencyHistory = [
          ...(prev.network.frequencyHistory || []),
          { frequency, timestamp: Date.now() },
        ];

        // Track frequency deviation for this tick
        const currentDeviation = Math.abs(frequency - 50);

        // Only use last 12 deviations for price calculation
        const recentDeviations = [
          ...(prev.market.dailyFrequencyDeviations || []),
          currentDeviation,
        ].slice(-12);

        // Update price every 12 data points
        const shouldUpdatePrice = recentDeviations.length >= 12;
        const newPrice = shouldUpdatePrice
          ? calculatePrice(recentDeviations)
          : prev.market.pricePerMWh;

        // Calculate financial update
        const netIncome = calculateFinancials(
          finalSupply,
          batteryPower,
          prev.market.pricePerMWh
        );

        // Calculate new sustainability metrics with updated generators
        const newSustainability = calculateSustainability(updatedGenerators);

        return {
          ...prev,
          generators: updatedGenerators,
          currentDate: newDate,
          currentHour: newHour,
          network: {
            ...prev.network,
            frequency,
            loadMW: load,
            supplyMW: finalSupply,
            frequencyHistory: newFrequencyHistory,
            pid: newPidState,
          },
          battery: newBatteryState,
          market: {
            ...prev.market,
            pricePerMWh: newPrice,
            lastPriceUpdate: shouldUpdatePrice
              ? Date.now()
              : prev.market.lastPriceUpdate,
            dailyFrequencyDeviations: recentDeviations,
          },
          sustainability: newSustainability,
          balance: prev.balance + netIncome,
          iteration: prev.iteration + 1,
        };
      });
    }, 1000 / simulationState.network.speed);

    return () => clearInterval(intervalId);
  }, [
    simulationState.network.isRunning,
    simulationState.network.speed,
    calculateSupply,
    calculateFrequency,
    calculateBatteryPower,
    updateBatteryState,
    calculateFinancials,
    calculateSustainability,
    getNextDate,
    marketData,
    currentDataIndex,
    setCurrentDataIndex,
  ]);

  // Use the callback in useEffect
  useEffect(() => {
    return updateSimulation();
  }, [updateSimulation]);

  // Handle date or hour changes
  useEffect(() => {
    if (simulationState.network.isRunning) {
      // Only fetch new data if 7 days have passed and it's midnight
      if (
        shouldFetchNewData(simulationState.currentDate, lastFetchDate) &&
        simulationState.currentHour === 0
      ) {
        console.log("Fetching new data:", {
          currentDate: simulationState.currentDate,
          lastFetchDate,
          hoursPassed: simulationState.currentHour,
        });
        fetchMarketData(simulationState.currentHour);
      }
    }
  }, [
    simulationState.currentDate,
    simulationState.currentHour,
    simulationState.network.isRunning,
    fetchMarketData,
    shouldFetchNewData,
    lastFetchDate,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Sustainability simulationState={simulationState} />
    </div>
  );
}
