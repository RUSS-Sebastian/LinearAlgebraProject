import type { GaussianStep } from '@/types';
import { WEATHER_STATES } from '@/types';

interface Props {
  steps: GaussianStep[];
}

export function GaussianVisualization({ steps }: Props) {
  if (steps.length === 0) {
    return <p className="text-slate-500 text-sm">No steps to display.</p>;
  }

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div
          key={i}
          className="border border-slate-200 rounded-xl p-4 bg-slate-50/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-700">{step.description}</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3 ml-9">{step.detail}</p>
          <div className="ml-9 overflow-x-auto">
            <table className="text-xs tabular-nums border-collapse">
              <thead>
                <tr>
                  {step.matrix[0].map((_, j) => (
                    <th key={j} className="px-2 py-1 text-slate-400 font-normal">
                      {j < WEATHER_STATES.length ? `c${j + 1}` : 'b'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.matrix.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((val, ci) => (
                      <td
                        key={ci}
                        className={`px-2.5 py-1.5 text-center border border-slate-200 ${
                          ci === row.length - 1 ? 'bg-sky-50/60 font-medium' : ''
                        }`}
                      >
                        {val.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {i < steps.length - 1 && (
            <div className="ml-9 mt-2 text-sky-400 text-xs">↓</div>
          )}
        </div>
      ))}
    </div>
  );
}
