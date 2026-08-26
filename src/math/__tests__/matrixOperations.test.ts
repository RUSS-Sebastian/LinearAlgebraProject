import { describe, it, expect } from 'vitest';
import {
  vectorMatrixMultiply,
  matrixVectorMultiply,
  transpose,
  identity,
  norm2,
  vectorSubtract,
} from '@/math/matrixOperations';

describe('vectorMatrixMultiply (row vector * matrix)', () => {
  it('multiplies a row vector by a matrix correctly', () => {
    const v = [1, 0, 0];
    const m = [
      [0.5, 0.3, 0.2],
      [0.1, 0.6, 0.3],
      [0.2, 0.2, 0.6],
    ];
    const result = vectorMatrixMultiply(v, m);
    expect(result).toEqual([0.5, 0.3, 0.2]);
  });

  it('handles a different starting vector', () => {
    const v = [0, 0, 1];
    const m = [
      [0.5, 0.3, 0.2],
      [0.1, 0.6, 0.3],
      [0.2, 0.2, 0.6],
    ];
    const result = vectorMatrixMultiply(v, m);
    expect(result).toEqual([0.2, 0.2, 0.6]);
  });
});

describe('matrixVectorMultiply', () => {
  it('multiplies a matrix by a column vector', () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    const v = [5, 6];
    expect(matrixVectorMultiply(m, v)).toEqual([17, 39]);
  });
});

describe('transpose', () => {
  it('transposes a square matrix', () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(transpose(m)).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });
});

describe('identity', () => {
  it('creates an identity matrix', () => {
    expect(identity(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });
});

describe('norm2', () => {
  it('computes the Euclidean 2-norm', () => {
    expect(norm2([3, 4])).toBeCloseTo(5, 10);
    expect(norm2([0, 0, 0])).toBe(0);
    expect(norm2([1, 0, 0])).toBe(1);
  });
});

describe('vectorSubtract', () => {
  it('subtracts element-wise', () => {
    expect(vectorSubtract([5, 3, 1], [1, 2, 3])).toEqual([4, 1, -2]);
  });
});
