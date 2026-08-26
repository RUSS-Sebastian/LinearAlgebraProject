import { useState } from 'react';
import { ChevronDown, ChevronUp, Sigma } from 'lucide-react';
import type { Matrix, Vector, StationaryResult, ConvergenceResult, ComparisonResult } from '@/types';
import { WEATHER_STATES } from '@/types';
import { GaussianVisualization } from './GaussianVisualization';

interface Props {
  transitionMatrix: Matrix;
  rowSums: Vector;
  convergence: ConvergenceResult;
  stationary: StationaryResult;
  comparison: ComparisonResult;
}

export function MathDrawer({ transitionMatrix, rowSums, convergence, stationary, comparison }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sigma className="w-5 h-5 text-sky-600" />
          <span className="font-semibold text-slate-800">Show Mathematics</span>
          <span className="text-sm text-slate-400">
            Transition matrix, stationary system, Gaussian elimination
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6 border-t border-slate-100">
          <MathSection title="Transition Matrix (P)">
            <p className="text-sm text-slate-500 mb-2">
              Row-stochastic: each row sums to 1. Rows = today's weather, columns = tomorrow's weather.
            </p>
            <MatrixText matrix={transitionMatrix} rowSums={rowSums} />
          </MathSection>

          <MathSection title="Forecast Formula">
            <pre className="text-sm bg-slate-50 rounded-lg p-3 text-slate-700 overflow-x-auto">
{`x(k+1) = x(k) · P

where x(k) is a row vector of probabilities for each weather state at step k,
and P is the row-stochastic transition matrix.`}
            </pre>
          </MathSection>

          <MathSection title="Convergence Check">
            <p className="text-sm text-slate-500 mb-2">
              Iterating until the change between consecutive distributions is below tolerance.
            </p>
            <pre className="text-sm bg-slate-50 rounded-lg p-3 text-slate-700 overflow-x-auto">
{`||x(k+1) - x(k)||₂ < tolerance

Tolerance: 1e-8
Max iterations: 10,000
Norm: Euclidean 2-norm

Result: ${convergence.message}
Iterations: ${convergence.iterations}`}
            </pre>
          </MathSection>

          <MathSection title="Stationary Distribution (πP = π)">
            <p className="text-sm text-slate-500 mb-2">
              We solve the system (Pᵀ - I)πᵀ = 0 with the last equation replaced by the
              normalization π₁ + π₂ + π₃ = 1.
            </p>
            {stationary.distribution ? (
              <div className="space-y-2">
                <div className="text-sm bg-slate-50 rounded-lg p-3 text-slate-700 overflow-x-auto">
                  π = [{stationary.distribution.map((v) => v.toFixed(6)).join(',  ')}]
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>Probability sum: {stationary.probabilitySum.toFixed(6)}</p>
                  <p>Residual 2-norm: {stationary.residualNorm.toExponential(3)}</p>
                  <p>Stationarity check (πP ≈ π): {stationary.stationarityCheck ? '✓ Passed' : '✗ Failed'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-600">{stationary.message}</p>
            )}
          </MathSection>

          <MathSection title="Gaussian Elimination with Partial Pivoting">
            <p className="text-sm text-slate-500 mb-3">
              The augmented matrix [A | b] is reduced to upper-triangular form, selecting the
              largest available pivot in each column to minimize numerical error.
            </p>
            <GaussianVisualization steps={stationary.steps} />
          </MathSection>

          <MathSection title="Method Comparison">
            <p className="text-sm text-slate-500 mb-2">{comparison.message}</p>
            {comparison.gaussian && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-slate-600 mb-1">Iterative</h4>
                  {WEATHER_STATES.map((w, i) => (
                    <div key={w} className="text-slate-500">
                      {w}: {(comparison.iterative[i] * 100).toFixed(2)}%
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-slate-600 mb-1">Gaussian</h4>
                  {WEATHER_STATES.map((w, i) => (
                    <div key={w} className="text-slate-500">
                      {w}: {(comparison.gaussian![i] * 100).toFixed(2)}%
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Max difference: {comparison.maxDifference.toExponential(3)}
            </p>
          </MathSection>
        </div>
      )}
    </div>
  );
}

function MathSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <span className="w-1 h-4 bg-sky-400 rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function MatrixText({ matrix, rowSums }: { matrix: Matrix; rowSums: Vector }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm tabular-nums border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-1.5"></th>
            {WEATHER_STATES.map((w) => (
              <th key={w} className="px-3 py-1.5 text-slate-500 font-normal">{w}</th>
            ))}
            <th className="px-3 py-1.5 text-slate-400 font-normal">Sum</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="px-3 py-1.5 text-slate-500 font-medium">{WEATHER_STATES[i]}</td>
              {row.map((val, j) => (
                <td key={j} className="px-3 py-1.5 text-center text-slate-700">{val.toFixed(6)}</td>
              ))}
              <td className="px-3 py-1.5 text-center text-slate-400">{rowSums[i].toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
