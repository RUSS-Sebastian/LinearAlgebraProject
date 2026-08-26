export type Matrix = number[][];
export type Vector = number[];

export const WEATHER_STATES = ['Sunny', 'Cloudy', 'Rainy'] as const;
export type WeatherState = (typeof WEATHER_STATES)[number];
export type WeatherIndex = 0 | 1 | 2;

export interface WeatherRecord {
  date: string;
  weather: WeatherState;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  records: WeatherRecord[];
  rejected: { row: string; reason: string }[];
}

export interface TransitionCountResult {
  counts: Matrix;
  rowTotals: Vector;
  zeroRows: number[];
}

export interface TransitionProbabilityResult {
  matrix: Matrix;
  rowTotals: Vector;
  zeroRows: number[];
}

export interface MatrixValidationResult {
  valid: boolean;
  errors: string[];
  rowSums: Vector;
}

export interface ForecastDay {
  day: number;
  label: string;
  distribution: Vector;
  mostLikely: number;
  tie: boolean;
}

export interface ForecastResult {
  days: ForecastDay[];
  distributions: Vector[];
}

export interface ConvergenceResult {
  converged: boolean;
  iterations: number;
  finalDistribution: Vector;
  history: { iteration: number; distribution: Vector; delta: number }[];
  message: string;
}

export interface GaussianStep {
  description: string;
  matrix: Matrix;
  detail: string;
}

export interface GaussianResult {
  solution: Vector | null;
  steps: GaussianStep[];
  singular: boolean;
  message: string;
  residualNorm: number;
}

export interface StationaryResult {
  distribution: Vector | null;
  method: 'gaussian' | 'none';
  valid: boolean;
  message: string;
  residualNorm: number;
  probabilitySum: number;
  stationarityCheck: boolean;
  steps: GaussianStep[];
}

export interface ComparisonResult {
  match: boolean;
  iterative: Vector;
  gaussian: Vector | null;
  maxDifference: number;
  message: string;
}
