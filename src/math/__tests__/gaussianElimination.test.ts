import { describe, it, expect } from 'vitest';
import { solveWithPartialPivoting } from '@/math/gaussianElimination';

describe('Gaussian elimination with partial pivoting', () => {
  it('solves a simple 2x2 system', () => {
    const A = [
      [2, 1],
      [1, 3],
    ];
    const b = [5, 10];
    const result = solveWithPartialPivoting(A, b);
    expect(result.solution).not.toBeNull();
    expect(result.solution![0]).toBeCloseTo(1, 8);
    expect(result.solution![1]).toBeCloseTo(3, 8);
  });

  it('solves a 3x3 system with known solution', () => {
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ];
    const b = [8, -11, -3];
    const result = solveWithPartialPivoting(A, b);
    expect(result.solution).not.toBeNull();
    expect(result.solution![0]).toBeCloseTo(2, 6);
    expect(result.solution![1]).toBeCloseTo(3, 6);
    expect(result.solution![2]).toBeCloseTo(-1, 6);
  });

  it('performs row swap when first pivot is small', () => {
    const A = [
      [1e-10, 1],
      [1, 1],
    ];
    const b = [1, 2];
    const result = solveWithPartialPivoting(A, b);
    expect(result.solution).not.toBeNull();
    expect(result.singular).toBe(false);
    expect(result.solution![0]).toBeCloseTo(1, 6);
    expect(result.solution![1]).toBeCloseTo(1, 6);
  });

  it('detects a singular system', () => {
    const A = [
      [1, 2, 3],
      [2, 4, 6],
      [1, 1, 1],
    ];
    const b = [6, 12, 3];
    const result = solveWithPartialPivoting(A, b);
    expect(result.singular).toBe(true);
    expect(result.solution).toBeNull();
  });

  it('produces a small residual for a valid system', () => {
    const A = [
      [3, 2, 1],
      [1, 4, 2],
      [2, 1, 5],
    ];
    const b = [10, 12, 15];
    const result = solveWithPartialPivoting(A, b);
    expect(result.solution).not.toBeNull();
    expect(result.residualNorm).toBeLessThan(1e-8);
  });
});
