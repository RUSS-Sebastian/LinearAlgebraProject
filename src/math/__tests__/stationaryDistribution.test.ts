import { describe, it, expect } from 'vitest';
import { computeStationaryDistribution, compareIterativeAndGaussian } from '@/math/stationaryDistribution';
import { iterateToConvergence } from '@/math/convergence';
import { generateForecast } from '@/math/forecast';
import { validateTransitionMatrix } from '@/math/validation';
import { vectorMatrixMultiply, norm2, vectorSubtract } from '@/math/matrixOperations';

const knownMatrix = [
  [0.65, 0.25, 0.10],
  [0.20, 0.50, 0.30],
  [0.15, 0.35, 0.50],
];

describe('Stationary distribution', () => {
  it('computes a valid stationary distribution', () => {
    const result = computeStationaryDistribution(knownMatrix);
    expect(result.distribution).not.toBeNull();
    expect(result.valid).toBe(true);
  });

  it('satisfies pi * P ≈ pi', () => {
    const result = computeStationaryDistribution(knownMatrix);
    if (!result.distribution) throw new Error('No distribution');
    const piP = vectorMatrixMultiply(result.distribution, knownMatrix);
    const diff = norm2(vectorSubtract(piP, result.distribution));
    expect(diff).toBeLessThan(1e-6);
  });

  it('sums to 1', () => {
    const result = computeStationaryDistribution(knownMatrix);
    if (!result.distribution) throw new Error('No distribution');
    const sum = result.distribution.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-6);
  });

  it('has all values in [0, 1]', () => {
    const result = computeStationaryDistribution(knownMatrix);
    if (!result.distribution) throw new Error('No distribution');
    for (const v of result.distribution) {
      expect(v).toBeGreaterThanOrEqual(-1e-9);
      expect(v).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe('Convergence', () => {
  it('converges for a regular transition matrix', () => {
    const start = [1, 0, 0];
    const result = iterateToConvergence(start, knownMatrix);
    expect(result.converged).toBe(true);
    expect(result.iterations).toBeLessThan(10000);
  });

  it('produces a final distribution close to the stationary distribution', () => {
    const start = [1, 0, 0];
    const conv = iterateToConvergence(start, knownMatrix);
    const stat = computeStationaryDistribution(knownMatrix);
    if (!stat.distribution) throw new Error('No stationary distribution');
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(conv.finalDistribution[i] - stat.distribution[i])).toBeLessThan(1e-4);
    }
  });
});

describe('Forecast', () => {
  it('produces correct first-step distribution from Sunny', () => {
    const result = generateForecast(0, knownMatrix, 3);
    expect(result.days[0].distribution).toEqual([0.65, 0.25, 0.10]);
  });

  it('produces correct second-step distribution', () => {
    const result = generateForecast(0, knownMatrix, 3);
    const expected = vectorMatrixMultiply([0.65, 0.25, 0.10], knownMatrix);
    for (let i = 0; i < 3; i++) {
      expect(result.days[1].distribution[i]).toBeCloseTo(expected[i], 10);
    }
  });

  it('identifies the most likely state correctly', () => {
    const result = generateForecast(0, knownMatrix, 1);
    expect(result.days[0].mostLikely).toBe(0);
  });
});

describe('Comparison', () => {
  it('iterative and Gaussian results match for a regular matrix', () => {
    const start = [1, 0, 0];
    const conv = iterateToConvergence(start, knownMatrix);
    const stat = computeStationaryDistribution(knownMatrix);
    const comp = compareIterativeAndGaussian(conv.finalDistribution, stat.distribution);
    expect(comp.match).toBe(true);
  });
});

describe('Matrix validation', () => {
  it('validates a correct stochastic matrix', () => {
    const result = validateTransitionMatrix(knownMatrix);
    expect(result.valid).toBe(true);
  });

  it('rejects a matrix with rows not summing to 1', () => {
    const bad = [
      [0.5, 0.3, 0.1],
      [0.2, 0.5, 0.3],
      [0.15, 0.35, 0.50],
    ];
    const result = validateTransitionMatrix(bad);
    expect(result.valid).toBe(false);
  });
});
