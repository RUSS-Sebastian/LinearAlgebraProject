import type { WeatherRecord, WeatherState } from '@/types';
import { WEATHER_STATES } from '@/types';

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const transitionBias: Record<WeatherState, [number, number, number]> = {
  Sunny: [0.62, 0.27, 0.11],
  Cloudy: [0.22, 0.48, 0.30],
  Rainy: [0.15, 0.35, 0.50],
};

function pickNext(current: WeatherState, rng: () => number): WeatherState {
  const probs = transitionBias[current];
  const r = rng();
  if (r < probs[0]) return 'Sunny';
  if (r < probs[0] + probs[1]) return 'Cloudy';
  return 'Rainy';
}

export function generateDemoData(days = 365, seed = 20260801): WeatherRecord[] {
  const rng = mulberry32(seed);
  const records: WeatherRecord[] = [];
  let current: WeatherState = 'Sunny';
  const startDate = new Date('2025-01-01T00:00:00Z');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    records.push({ date: dateStr, weather: current });
    if (i < days - 1) {
      current = pickNext(current, rng);
    }
  }

  return records;
}

export const DEMO_DATA_LABEL = 'Demo data — synthetic historical observations for demonstration.';

export function getDemoData(): WeatherRecord[] {
  return generateDemoData(365, 20260801);
}

export { WEATHER_STATES };
