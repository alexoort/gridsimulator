"use client";

import { useEffect, useCallback, useState } from "react";
import { SimulationState } from "../types/grid";
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
  const calculateSupply = useCallback(() => {
    let totalSupply = 0;
    const currentMarketData = marketData[currentDataIndex];

    // Calculate PID correction
    const error = simulationState.network.frequency - 50;
    const { pid } = simulationState.network;

    // Ensure lastError is defined
    const lastError = pid.lastError ?? error;

    // Calculate PID terms
    const proportionalTerm = pid.kp * error;
    const derivativeTerm = pid.kd * (error - lastError);

    // Integral term - accumulate error over time
    const newIntegral = (pid.integral || 0) + error;
    const maxIntegral = 100 / pid.ki; // Prevent excessive buildup
    const clampedIntegral = Math.max(
      -maxIntegral,
      Math.min(maxIntegral, newIntegral)
    );
    const integralTerm = pid.ki * clampedIntegral;

    const pidCorrection = -(proportionalTerm + integralTerm + derivativeTerm);

    // Update state with clamped integral and generator outputs
    setSimulationState((prev) => {
      const updatedGenerators = prev.generators.map((generator) => {
        let output = generator.capacity;

        if (currentMarketData) {
          // Adjust output based on generator type and market data
          switch (generator.type) {
            case "solar":
              output *= currentMarketData.solar_factor;
              break;
            case "wind":
              output *= currentMarketData.wind_factor;
              break;
            // Apply PID correction to non-renewable sources
            default:
              // Limit correction to ±50% of capacity
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

      return {
        ...prev,
        generators: updatedGenerators,
        network: {
          ...prev.network,
          pid: {
            ...prev.network.pid,
            integral: clampedIntegral,
            lastError: error,
          },
        },
      };
    });

    // Calculate total supply from updated generator outputs
    simulationState.generators.forEach((generator) => {
      let output = generator.capacity;

      if (!currentMarketData) return output;

      // Adjust output based on generator type and market data
      switch (generator.type) {
        case "solar":
          output *= currentMarketData.solar_factor;
          break;
        case "wind":
          output *= currentMarketData.wind_factor;
          break;
        // Apply PID correction to non-renewable sources
        default:
          // Limit correction to ±50% of capacity
          const correctionFactor = Math.max(
            -0.5,
            Math.min(0.5, pidCorrection / 100)
          );
          output *= 1 + correctionFactor;
          break;
      }

      totalSupply += output;
    });

    // Store cumulative generation in localStorage
    const storedGeneration = localStorage.getItem("cumulativeGeneration");
    const cumulativeGeneration = storedGeneration
      ? parseFloat(storedGeneration) + totalSupply
      : totalSupply;
    localStorage.setItem(
      "cumulativeGeneration",
      cumulativeGeneration.toString()
    );

    return totalSupply;
  }, [
    simulationState.generators,
    marketData,
    currentDataIndex,
    simulationState.network.frequency,
    setSimulationState,
  ]);

  // Calculate load based on market data and customer base
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateLoad = useCallback(() => {
    const currentMarketData = marketData[currentDataIndex];
    if (!currentMarketData) return 0;

    // Scale the historical load based on our current customer base
    const historicalCustomers = 7500000; // Baseline customer count https://www.iso-ne.com/about/key-stats
    const customerRatio =
      simulationState.network.customers / historicalCustomers;
    return currentMarketData.load_mw * customerRatio;
  }, [marketData, currentDataIndex, simulationState.network.customers]);

  // Calculate total system inertia from all generators using weighted average
  const calculateSystemInertia = useCallback(() => {
    // Log initial state
    console.log(
      "Starting inertia calculation with generators:",
      simulationState.generators.map((g) => ({
        type: g.type,
        capacity: g.capacity,
        inertia: g.inertia,
        product: g.inertia * g.capacity,
      }))
    );

    // Calculate sum of (inertia * rated power) for each generator
    const weightedInertiaSum = simulationState.generators.reduce(
      (sum, generator) => {
        const product = generator.inertia * generator.capacity;
        console.log("Adding to weighted sum:", {
          type: generator.type,
          inertia: generator.inertia,
          capacity: generator.capacity,
          product,
          runningSum: sum + product,
        });
        return sum + product;
      },
      0
    );

    // Calculate total system base power (sum of all generator capacities)
    const totalBasePower = simulationState.generators.reduce(
      (sum, generator) => {
        console.log("Adding to base power:", {
          type: generator.type,
          capacity: generator.capacity,
          runningSum: sum + generator.capacity,
        });
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

      // Log frequency calculation details
      console.log("Frequency calculation:", {
        powerImbalance,
        systemInertia,
        frequencyDeviation,
        finalFrequency: currentFrequency + frequencyDeviation,
      });

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

      // Log battery action
      console.log("Battery operation:", {
        imbalance,
        batteryPower,
        currentCharge: battery.currentCharge,
        efficiency: battery.efficiency,
        atMaxRate: Math.abs(batteryPower) >= battery.maxRate,
      });

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

      // Log battery state update
      console.log("Updating battery state:", {
        batteryPower,
        energyChange,
        currentCharge: simulationState.battery.currentCharge,
        newCharge,
        efficiency: simulationState.battery.efficiency,
      });

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

      console.log("Financial update:", {
        powerDelivered,
        totalSupply: supply,
        totalLoad: currentLoad,
        revenue,
        operationalCosts,
        batteryOpCost,
        netIncome,
        pricePerMWh,
        generatorOutputs: simulationState.generators.map((g) => ({
          type: g.type,
          output: g.currentOutput,
          cost: g.currentOutput * g.variableCost,
        })),
      });

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

  // Update simulation state
  useEffect(() => {
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

        // Calculate initial supply and demand
        const baseSupply = calculateSupply();
        const load = calculateLoad();

        // Calculate battery contribution
        const batteryPower = calculateBatteryPower(baseSupply, load);
        const totalSupply = baseSupply - batteryPower; // Subtract because negative means discharge

        // Update battery state
        const newBatteryState = updateBatteryState(batteryPower);

        // Calculate grid frequency with battery contribution
        const frequency = calculateFrequency(
          totalSupply,
          load,
          prev.network.frequency
        );

        // Update frequency history - now keep all data points
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

        // Calculate new price if needed
        let newPrice = prev.market.pricePerMWh;
        if (shouldUpdatePrice) {
          newPrice = calculatePrice(recentDeviations);
        }

        // Calculate financial update
        const netIncome = calculateFinancials(
          totalSupply,
          batteryPower,
          prev.market.pricePerMWh
        );

        // Calculate total and renewable generation for current render
        const currentTotalGeneration = prev.generators.reduce(
          (sum, gen) => sum + (gen.currentOutput || 0),
          0
        );

        const currentRenewableGeneration = prev.generators
          .filter((g) => ["solar", "wind", "hydro"].includes(g.type))
          .reduce((sum, g) => sum + (g.currentOutput || 0), 0);

        // Calculate emissions for this tick
        const currentEmissions = prev.generators.reduce((total, generator) => {
          const emissionsFactor = EMISSIONS_FACTORS[generator.type] || 0;
          return total + (generator.currentOutput || 0) * emissionsFactor;
        }, 0);

        // Calculate generation mix
        const generationMix = prev.generators.reduce((mix, generator) => {
          mix[generator.type] = generator.currentOutput || 0;
          return mix;
        }, {} as Record<string, number>);

        // Update sustainability metrics
        const newSustainability = {
          currentEmissions,
          cumulativeEmissions:
            prev.sustainability.cumulativeEmissions + currentEmissions,
          maxRenewablePercentage: Math.max(
            prev.sustainability.maxRenewablePercentage,
            (currentRenewableGeneration / currentTotalGeneration) * 100 || 0
          ),
          cumulativeTotalGeneration:
            prev.sustainability.cumulativeTotalGeneration +
            currentTotalGeneration,
          totalGeneration: currentTotalGeneration,
          renewableGeneration: currentRenewableGeneration,
          generationMix,
        };

        return {
          ...prev,
          currentDate: newDate,
          currentHour: newHour,
          network: {
            ...prev.network,
            frequency,
            loadMW: load,
            supplyMW: totalSupply,
            frequencyHistory: newFrequencyHistory,
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
    calculateLoad,
    calculateFrequency,
    calculateBatteryPower,
    updateBatteryState,
    calculateFinancials,
    getNextDate,
    marketData.length,
    currentDataIndex,
  ]);

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
