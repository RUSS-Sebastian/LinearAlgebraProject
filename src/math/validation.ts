import type { Matrix, Vector, MatrixValidationResult } from '@/types';
import { allFinite, matrixAllFinite } from './matrixOperations';

export function validateTransitionMatrix(matrix: Matrix): MatrixValidationResult {
  const errors: string[] = [];
  const rowSums: Vector = [];
  const n = matrix.length;
  const tolerance = 1e-9;

  if (!matrixAllFinite(matrix)) {
    errors.push('The transition matrix contains non-numeric values (NaN or Infinity).');
    return { valid: false, errors, rowSums };
  }

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const val = matrix[i][j];
      if (val < -tolerance || val > 1 + tolerance) {
        errors.push(`Entry [${i}][${j}] = ${val} is outside the valid probability range [0, 1].`);
      }
      sum += val;
    }
    rowSums.push(sum);
    if (Math.abs(sum - 1) > tolerance) {
      errors.push(`Row ${i} sums to ${sum}, not 1 (tolerance ${tolerance}).`);
    }
  }

  return { valid: errors.length === 0, errors, rowSums };
}

export function isFiniteNonNegative(v: number): boolean {
  return Number.isFinite(v) && v >= 0;
}

export function allFiniteNonNegative(v: Vector): boolean {
  return v.every(isFiniteNonNegative);
}
