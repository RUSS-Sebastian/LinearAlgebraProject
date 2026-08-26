import type { Matrix, Vector, ForecastResult, ForecastDay } from '@/types';
import { WEATHER_STATES } from '@/types';
import { vectorMatrixMultiply, allFinite } from './matrixOperations';

export function generateForecast(
  startWeatherIndex: number,
  P: Matrix,
  days: number,
): ForecastResult {
  const n = P.length;
  const startVector = new Array(n).fill(0) as Vector;
  startVector[startWeatherIndex] = 1;

  const distributions: Vector[] = [];
  let current = startVector;

  for (let day = 1; day <= days; day++) {
    const next = vectorMatrixMultiply(current, P);
    if (!allFinite(next)) {
      break;
    }
    distributions.push([...next]);
    current = next;
  }

  const forecastDays: ForecastDay[] = distributions.map((dist, idx) => {
    let maxIdx = 0;
    let maxVal = dist[0];
    let tie = false;
    for (let i = 1; i < dist.length; i++) {
      if (dist[i] > maxVal + 1e-12) {
        maxVal = dist[i];
        maxIdx = i;
        tie = false;
      } else if (Math.abs(dist[i] - maxVal) <= 1e-12) {
        tie = true;
      }
    }
    return {
      day: idx + 1,
      label: idx === 0 ? 'Tomorrow' : `Day ${idx + 1}`,
      distribution: dist,
      mostLikely: maxIdx,
      tie,
    };
  });

  return { days: forecastDays, distributions };
}

export function getWeatherLabel(index: number): string {
  return WEATHER_STATES[index] ?? 'Unknown';
}
