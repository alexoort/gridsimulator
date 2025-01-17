export type GeneratorType = 'solar' | 'wind' | 'nuclear' | 'coal' | 'hydro';

export interface Generator {
  id: string;
  type: GeneratorType;
  capacity: number; // MW
  currentOutput: number; // MW
  cost: number; // Initial cost
  variableCost: number; // Cost per MWh
  inertia: number; // System inertia constant H in seconds
}

export interface Battery {
  capacity: number; // MWh total storage capacity
  currentCharge: number; // MWh current stored energy
  maxRate: number; // MW maximum charge/discharge rate
  efficiency: number; // Round-trip efficiency (0-1)
  currentOutput: number; // MW current power output (negative when discharging)
}

export interface NetworkStatus {
  frequency: number;
  loadMW: number;
  supplyMW: number;
  customers: number;
  isRunning: boolean;
  speed: number;
  timeOfDay: number;
  frequencyHistory: { frequency: number; timestamp: number }[];
  pid: {
    kp: number;
    ki: number;
    kd: number;
    integral?: number;
    lastError?: number;
    useBattery: boolean;
  };
}

export interface MarketData {
  pricePerMWh: number;
  lastPriceUpdate: number;
  dailyFrequencyDeviations: number[];
  solarData: number[];
  windData: number[];
  demandData: number[];
}

export interface SimulationState {
  generators: Generator[];
  battery: Battery;
  network: NetworkStatus;
  market: MarketData;
  balance: number;
  iteration: number;
  currentDate: string;
  currentHour: number;
} 