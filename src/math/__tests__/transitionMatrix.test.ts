import { describe, it, expect } from 'vitest';
import { buildTransitionCounts, buildTransitionProbabilities, normalizeWeather, weatherToIndex } from '@/math/transitionMatrix';
import type { WeatherRecord } from '@/types';
import { WEATHER_STATES } from '@/types';

describe('normalizeWeather', () => {
  it('normalizes capitalization variants', () => {
    expect(normalizeWeather('sunny')).toBe('Sunny');
    expect(normalizeWeather('SUNNY')).toBe('Sunny');
    expect(normalizeWeather('Sunny')).toBe('Sunny');
    expect(normalizeWeather('  cloudy  ')).toBe('Cloudy');
    expect(normalizeWeather('RAINY')).toBe('Rainy');
  });
});

describe('weatherToIndex', () => {
  it('returns correct indices for valid states', () => {
    expect(weatherToIndex('Sunny')).toBe(0);
    expect(weatherToIndex('Cloudy')).toBe(1);
    expect(weatherToIndex('Rainy')).toBe(2);
  });
});

describe('buildTransitionCounts', () => {
  it('counts consecutive transitions correctly', () => {
    const records: WeatherRecord[] = [
      { date: '2026-01-01', weather: 'Sunny' },
      { date: '2026-01-02', weather: 'Sunny' },
      { date: '2026-01-03', weather: 'Cloudy' },
      { date: '2026-01-04', weather: 'Rainy' },
      { date: '2026-01-05', weather: 'Sunny' },
    ];
    const { counts, rowTotals, zeroRows } = buildTransitionCounts(records);

    expect(counts[0][0]).toBe(1);
    expect(counts[0][1]).toBe(1);
    expect(counts[0][2]).toBe(0);
    expect(counts[1][0]).toBe(0);
    expect(counts[1][1]).toBe(0);
    expect(counts[1][2]).toBe(1);
    expect(counts[2][0]).toBe(1);
    expect(counts[2][1]).toBe(0);
    expect(counts[2][2]).toBe(0);

    expect(rowTotals).toEqual([2, 1, 1]);
    expect(zeroRows).toEqual([]);
  });

  it('detects zero rows when last state has no following observation', () => {
    const records: WeatherRecord[] = [
      { date: '2026-01-01', weather: 'Sunny' },
      { date: '2026-01-02', weather: 'Rainy' },
    ];
    const { counts, rowTotals, zeroRows } = buildTransitionCounts(records);

    expect(counts[0][2]).toBe(1);
    expect(rowTotals).toEqual([1, 0, 0]);
    expect(zeroRows).toContain(1);
    expect(zeroRows).toContain(2);
  });
});

describe('buildTransitionProbabilities', () => {
  it('normalizes each row to sum to 1', () => {
    const counts = [
      [65, 25, 10],
      [20, 50, 30],
      [15, 35, 50],
    ];
    const rowTotals = [100, 100, 100];
    const { matrix, zeroRows } = buildTransitionProbabilities(counts, rowTotals);

    for (let i = 0; i < 3; i++) {
      const sum = matrix[i].reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1)).toBeLessThan(1e-12);
    }
    expect(zeroRows).toEqual([]);
  });

  it('produces correct probability values', () => {
    const counts = [
      [65, 25, 10],
      [0, 0, 0],
      [15, 35, 50],
    ];
    const rowTotals = [100, 0, 100];
    const { matrix, zeroRows } = buildTransitionProbabilities(counts, rowTotals);

    expect(matrix[0]).toEqual([0.65, 0.25, 0.10]);
    expect(matrix[1]).toEqual([0, 0, 0]);
    expect(matrix[2]).toEqual([0.15, 0.35, 0.50]);
    expect(zeroRows).toEqual([1]);
  });
});
