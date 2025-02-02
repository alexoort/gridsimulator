export type GeneratorType = 'solar' | 'wind' | 'nuclear' | 'coal' | 'hydro';

export interface Generator {
  id: string;
  type: GeneratorType;
  capacity: number; // MW
  currentOutput: number; // MW
  cost: number; // Initial cost
  variableCost: number; // Cost per MWh
  hourlyFixedCost: number; // Fixed cost per hour
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
    integral: number;
    lastError?: number;
    useBattery: boolean;
  };
}

export interface SustainabilityStatus {
  currentEmissions: number;
  cumulativeEmissions: number;
  maxRenewablePercentage: number;
  cumulativeTotalGeneration: number;
  totalGeneration: number;
  renewableGeneration: number;
  generationMix: { [key: string]: number };
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
  sustainability: SustainabilityStatus;
  balance: number;
  iteration: number;
  currentDate: string;
  currentHour: number;
}

// Define emissions factors (kg CO2 per MWh) based on lifecycle analysis
export const EMISSIONS_FACTORS: Record<string, number> = {
  solar: 41, // Solar PV - roof
  wind: 11, // Wind offshore (using lowest wind value)
  nuclear: 12, // Nuclear
  hydro: 24, // Hydropower
  coal: 820, // Coal
};

// Other shared constants can go here
export const INITIAL_BALANCE = 10000; 
export const BASE_CUSTOMERS = 7500000;
