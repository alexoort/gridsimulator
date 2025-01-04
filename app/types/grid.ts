export type GeneratorType = 'solar' | 'wind' | 'nuclear' | 'coal' | 'hydro';

export interface Generator {
  id: string;
  type: GeneratorType;
  capacity: number; // MW
  currentOutput: number; // MW
  cost: number; // Cost per MW
}

export interface NetworkStatus {
  frequency: number; // Hz, nominal 50Hz
  loadMW: number;
  supplyMW: number;
  customers: number;
  isRunning: boolean;
  speed: number;
  timeOfDay: number; // 0-23 hours
}

export interface MarketData {
  pricePerMWh: number;
  loadCurve: number[]; // 24 hour load curve
  solarGenerationCurve: number[]; // 24 hour solar generation curve
  windGenerationCurve: number[]; // 24 hour wind generation curve
}

export interface SimulationState {
  generators: Generator[];
  network: NetworkStatus;
  market: MarketData;
  balance: number; // Player's money
  iteration: number;
} 