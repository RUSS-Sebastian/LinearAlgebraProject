import type { Vector, Matrix, ConvergenceResult } from '@/types';
import { vectorMatrixMultiply, norm2, vectorSubtract, allFinite } from './matrixOperations';

export function iterateToConvergence(
  start: Vector,
  P: Matrix,
  tolerance = 1e-8,
  maxIterations = 10000,
): ConvergenceResult {
  let current = [...start];
  const history: { iteration: number; distribution: Vector; delta: number }[] = [];
  let converged = false;
  let iterations = 0;

  for (let k = 0; k < maxIterations; k++) {
    const next = vectorMatrixMultiply(current, P);
    if (!allFinite(next)) {
      return {
        converged: false,
        iterations: k,
        finalDistribution: current,
        history,
        message: 'Numerical overflow occurred during iteration. The model could not continue.',
      };
    }
    const diff = vectorSubtract(next, current);
    const delta = norm2(diff);
    history.push({ iteration: k + 1, distribution: [...next], delta });

    current = next;
    iterations = k + 1;

    if (delta < tolerance) {
      converged = true;
      break;
    }
  }

  const message = converged
    ? `Converged after ${iterations} iterations (tolerance ${tolerance}).`
    : `The model did not reach the selected convergence tolerance (${tolerance}) within the iteration limit (${maxIterations}).`;

  return {
    converged,
    iterations,
    finalDistribution: current,
    history,
    message,
  };
}
