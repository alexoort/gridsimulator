"use client";

import { useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SimulationState } from "../types/grid";

interface PowerGraphProps {
  simulationState: SimulationState;
}

interface DataPoint {
  time: string;
  load: number;
  generation: number;
  solar: number;
  wind: number;
}

export default function PowerGraph({ simulationState }: PowerGraphProps) {
  const maxDataPoints = 20;
  const dataRef = useRef<DataPoint[]>([]);

  // Initialize data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("powerGraphData");
      if (saved) {
        dataRef.current = JSON.parse(saved);
      }
    }
  }, []);

  // Combined effect for data management
  useEffect(() => {
    if (!simulationState.network.isRunning) {
      if (simulationState.currentHour === 0) {
        dataRef.current = [];
        localStorage.removeItem("powerGraphData");
      }
      return;
    }

    // Calculate solar and wind generation separately
    const solarGen = simulationState.generators
      .filter((g) => g.type === "solar")
      .reduce((sum, g) => sum + g.currentOutput, 0);

    const windGen = simulationState.generators
      .filter((g) => g.type === "wind")
      .reduce((sum, g) => sum + g.currentOutput, 0);

    // Add new data point
    const newPoint = {
      time: `${simulationState.currentHour.toString().padStart(2, "0")}:00`,
      load: simulationState.network.loadMW,
      generation: simulationState.network.supplyMW,
      solar: solarGen,
      wind: windGen,
    };

    // Update data in ref
    dataRef.current = [...dataRef.current, newPoint].slice(-maxDataPoints);
    localStorage.setItem("powerGraphData", JSON.stringify(dataRef.current));
  }, [
    simulationState.network.isRunning,
    simulationState.currentHour,
    simulationState.network.loadMW,
    simulationState.network.supplyMW,
    simulationState.generators,
    simulationState.iteration,
    simulationState.currentDate,
  ]);

  // Check if user owns solar or wind generators
  const hasSolar = simulationState.generators.some((g) => g.type === "solar");
  const hasWind = simulationState.generators.some((g) => g.type === "wind");

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        Power Balance
      </h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dataRef.current}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="load"
              name="Load (MW)"
              stroke="#8884d8"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="generation"
              name="Generation (MW)"
              stroke="#82ca9d"
              strokeWidth={2}
            />
            {hasSolar && (
              <Line
                type="monotone"
                dataKey="solar"
                name="Solar (MW)"
                stroke="#ffc658"
                strokeWidth={2}
              />
            )}
            {hasWind && (
              <Line
                type="monotone"
                dataKey="wind"
                name="Wind (MW)"
                stroke="#ff69b4"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
