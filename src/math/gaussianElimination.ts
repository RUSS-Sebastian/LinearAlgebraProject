import type { Matrix, Vector, GaussianResult, GaussianStep } from '@/types';
import { cloneMatrix, cloneVector, norm2 } from './matrixOperations';

export function solveWithPartialPivoting(A: Matrix, b: Vector): GaussianResult {
  const steps: GaussianStep[] = [];
  const n = A.length;
  if (n === 0) {
    return { solution: [], steps, singular: false, message: 'Empty system.', residualNorm: 0 };
  }

  const aug: Matrix = A.map((row, i) => [...row, b[i]]);
  steps.push({
    description: 'Original augmented matrix [A | b]',
    matrix: cloneMatrix(aug),
    detail: 'We start with the linear system written as an augmented matrix.',
  });

  const pivotTolerance = 1e-12;

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      const absVal = Math.abs(aug[row][col]);
      if (absVal > maxVal) {
        maxVal = absVal;
        maxRow = row;
      }
    }

    if (maxVal < pivotTolerance) {
      steps.push({
        description: `Step ${col + 1} — Singular system detected`,
        matrix: cloneMatrix(aug),
        detail: `The largest available pivot in column ${col + 1} is ${maxVal.toExponential(3)}, which is below the numerical tolerance ${pivotTolerance}. The system does not have a unique solution.`,
      });
      return {
        solution: null,
        steps,
        singular: true,
        message: 'The system is singular — no unique stationary distribution exists under this formulation.',
        residualNorm: Infinity,
      };
    }

    if (maxRow !== col) {
      const tmp = aug[col];
      aug[col] = aug[maxRow];
      aug[maxRow] = tmp;
      steps.push({
        description: `Step ${col + 1} — Row swap for a stable pivot`,
        matrix: cloneMatrix(aug),
        detail: `Row ${col + 1} and row ${maxRow + 1} were swapped so the largest available value (${maxVal.toExponential(3)}) sits on the pivot. This reduces numerical error during elimination.`,
      });
    } else {
      steps.push({
        description: `Step ${col + 1} — Pivot selected (no swap needed)`,
        matrix: cloneMatrix(aug),
        detail: `The pivot in column ${col + 1} is already the largest available value (${maxVal.toExponential(3)}). No row swap was needed.`,
      });
    }

    const pivot = aug[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / pivot;
      if (Math.abs(factor) < 1e-15) continue;
      for (let k = col; k <= n; k++) {
        aug[row][k] -= factor * aug[col][k];
      }
    }
    steps.push({
      description: `Step ${col + 1} — Elimination below the pivot`,
      matrix: cloneMatrix(aug),
      detail: `Entries below the pivot in column ${col + 1} have been zeroed out. The matrix is moving toward upper-triangular form.`,
    });
  }

  const solution = backSubstitution(aug);
  if (!solution || solution.some((x) => !Number.isFinite(x))) {
    return {
      solution: null,
      steps,
      singular: true,
      message: 'Back substitution produced non-finite values.',
      residualNorm: Infinity,
    };
  }

  const residual = b.map((bi, i) => {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += A[i][j] * solution[j];
    return bi - sum;
  });
  const residualNorm = norm2(residual);

  steps.push({
    description: 'Back substitution — solution found',
    matrix: aug.map((row, i) => [...row.slice(0, n), solution[i] ?? 0]),
    detail: `Working from the last row upward, each unknown is computed. The residual 2-norm is ${residualNorm.toExponential(3)}.`,
  });

  return {
    solution,
    steps,
    singular: false,
    message: 'System solved successfully.',
    residualNorm,
  };
}

export function backSubstitution(aug: Matrix): Vector | null {
  const n = aug.length;
  const solution = new Array(n).fill(0) as Vector;
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * solution[j];
    }
    const diag = aug[i][i];
    if (Math.abs(diag) < 1e-12) return null;
    solution[i] = sum / diag;
  }
  return solution;
}

export function formatMatrix(m: Matrix, decimals = 4): string {
  return m
    .map((row) => row.map((x) => x.toFixed(decimals)).join('  '))
    .join('\n');
}

export function formatVector(v: Vector, decimals = 4): string {
  return v.map((x) => x.toFixed(decimals)).join('  ');
}

export { cloneVector };
