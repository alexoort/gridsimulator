"use client";

import { useState, useEffect } from "react";
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
}

export default function PowerGraph({ simulationState }: PowerGraphProps) {
  const maxDataPoints = 20;

  // Initialize state from localStorage if available
  const [data, setData] = useState<DataPoint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("powerGraphData");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Combined effect for data management
  useEffect(() => {
    if (!simulationState.network.isRunning) {
      if (simulationState.currentHour === 0) {
        setData([]);
        localStorage.removeItem("powerGraphData");
      }
      return;
    }

    // Add new data point
    const newPoint = {
      time: `${simulationState.currentHour.toString().padStart(2, "0")}:00`,
      load: simulationState.network.loadMW,
      generation: simulationState.network.supplyMW,
    };

    setData((prevData) => {
      const newData = [...prevData, newPoint];
      return newData.slice(-maxDataPoints);
    });
  }, [
    simulationState.network.isRunning,
    simulationState.currentHour,
    simulationState.network.loadMW,
    simulationState.network.supplyMW,
  ]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("powerGraphData", JSON.stringify(data));
    }
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-purple-800">
        Power Balance
      </h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
