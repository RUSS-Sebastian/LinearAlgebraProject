import type { Matrix, Vector, WeatherRecord, TransitionCountResult, TransitionProbabilityResult } from '@/types';
import { WEATHER_STATES } from '@/types';
import { createMatrix } from './matrixOperations';

export function weatherToIndex(weather: string): number {
  const normalized = normalizeWeather(weather);
  const idx = WEATHER_STATES.indexOf(normalized as (typeof WEATHER_STATES)[number]);
  return idx;
}

export function normalizeWeather(weather: string): string {
  const trimmed = weather.trim().toLowerCase();
  if (trimmed === 'sunny') return 'Sunny';
  if (trimmed === 'cloudy') return 'Cloudy';
  if (trimmed === 'rainy') return 'Rainy';
  return weather.trim();
}

export function isValidWeather(weather: string): boolean {
  const trimmed = weather.trim().toLowerCase();
  return trimmed === 'sunny' || trimmed === 'cloudy' || trimmed === 'rainy';
}

export function buildTransitionCounts(records: WeatherRecord[]): TransitionCountResult {
  const n = WEATHER_STATES.length;
  const counts = createMatrix(n, n, 0);
  const rowTotals = new Array(n).fill(0) as Vector;

  for (let i = 0; i < records.length - 1; i++) {
    const fromIdx = weatherToIndex(records[i].weather);
    const toIdx = weatherToIndex(records[i + 1].weather);
    if (fromIdx < 0 || toIdx < 0) continue;
    counts[fromIdx][toIdx] += 1;
    rowTotals[fromIdx] += 1;
  }

  const zeroRows: number[] = [];
  for (let i = 0; i < n; i++) {
    if (rowTotals[i] === 0) zeroRows.push(i);
  }

  return { counts, rowTotals, zeroRows };
}

export function buildTransitionProbabilities(
  counts: Matrix,
  rowTotals: Vector,
): TransitionProbabilityResult {
  const n = counts.length;
  const matrix = createMatrix(n, n, 0);
  const zeroRows: number[] = [];

  for (let i = 0; i < n; i++) {
    if (rowTotals[i] === 0) {
      zeroRows.push(i);
      continue;
    }
    for (let j = 0; j < n; j++) {
      matrix[i][j] = counts[i][j] / rowTotals[i];
    }
  }

  return { matrix, rowTotals, zeroRows };
}
