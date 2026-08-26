import type { Matrix, Vector, StationaryResult, ComparisonResult } from '@/types';
import { transpose, vectorMatrixMultiply, norm2, vectorSubtract, allFinite } from './matrixOperations';
import { solveWithPartialPivoting } from './gaussianElimination';

export function computeStationaryDistribution(P: Matrix): StationaryResult {
  const n = P.length;

  const Pt = transpose(P);

  const A: number[][] = Pt.map((row, i) => row.map((val, j) => val - (i === j ? 1 : 0)));

  const b: number[] = new Array(n).fill(0);

  A[n - 1] = new Array(n).fill(1);
  b[n - 1] = 1;

  const gauss = solveWithPartialPivoting(A, b);

  if (gauss.singular || !gauss.solution) {
    return {
      distribution: null,
      method: 'none',
      valid: false,
      message: gauss.message || 'The current transition model does not provide a unique stationary distribution under this numerical formulation.',
      residualNorm: gauss.residualNorm,
      probabilitySum: NaN,
      stationarityCheck: false,
      steps: gauss.steps,
    };
  }

  const pi = gauss.solution;

  if (!allFinite(pi)) {
    return {
      distribution: null,
      method: 'none',
      valid: false,
      message: 'The computed stationary distribution contains non-finite values.',
      residualNorm: Infinity,
      probabilitySum: NaN,
      stationarityCheck: false,
      steps: gauss.steps,
    };
  }

  const probabilitySum = pi.reduce((s, x) => s + x, 0);
  const probValid = pi.every((x) => x >= -1e-9 && x <= 1 + 1e-9);
  const sumValid = Math.abs(probabilitySum - 1) < 1e-6;

  const piP = vectorMatrixMultiply(pi, P);
  const stationarityDiff = norm2(vectorSubtract(piP, pi));
  const stationarityCheck = stationarityDiff < 1e-6;

  const valid = probValid && sumValid && stationarityCheck;

  const message = valid
    ? 'Numerical solution verified.'
    : 'The stationary solution was computed but failed validation checks.';

  return {
    distribution: pi,
    method: 'gaussian',
    valid,
    message,
    residualNorm: gauss.residualNorm,
    probabilitySum,
    stationarityCheck,
    steps: gauss.steps,
  };
}

export function compareIterativeAndGaussian(
  iterative: Vector,
  gaussian: Vector | null,
  tolerance = 1e-4,
): ComparisonResult {
  if (!gaussian) {
    return {
      match: false,
      iterative,
      gaussian: null,
      maxDifference: Infinity,
      message: 'No Gaussian solution to compare against.',
    };
  }
  let maxDiff = 0;
  for (let i = 0; i < iterative.length; i++) {
    maxDiff = Math.max(maxDiff, Math.abs(iterative[i] - gaussian[i]));
  }
  const match = maxDiff < tolerance;
  return {
    match,
    iterative,
    gaussian,
    maxDifference: maxDiff,
    message: match
      ? 'Long-term result verified — the iterative forecast and the Gaussian solution agree within tolerance.'
      : `The two methods differ by ${maxDiff.toExponential(2)}. They may not agree due to the model structure.`,
  };
}
