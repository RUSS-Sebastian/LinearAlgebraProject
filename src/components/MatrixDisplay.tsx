import type { Matrix, Vector } from '@/types';
import { WEATHER_STATES } from '@/types';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  matrix: Matrix;
  type: 'counts' | 'probabilities';
  rowSums?: Vector;
}

export function MatrixDisplay({ matrix, type, rowSums }: Props) {
  const isProb = type === 'probabilities';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-slate-500 font-medium px-3 py-2 border-b border-slate-200">
              Today \ Tomorrow
            </th>
            {WEATHER_STATES.map((w) => (
              <th
                key={w}
                className="text-center font-medium px-3 py-2 border-b border-slate-200"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <WeatherIcon weather={w} size="sm" />
                  <span className="text-slate-600">{w}</span>
                </div>
              </th>
            ))}
            {rowSums && (
              <th className="text-center text-slate-500 font-medium px-3 py-2 border-b border-slate-200">
                Row Total
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {WEATHER_STATES.map((rowWeather, i) => (
            <tr key={rowWeather} className="hover:bg-slate-50/60">
              <td className="text-left font-medium px-3 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <WeatherIcon weather={rowWeather} size="sm" />
                  <span className="text-slate-600">{rowWeather}</span>
                </div>
              </td>
              {matrix[i].map((val, j) => (
                <td
                  key={j}
                  className="text-center px-3 py-2.5 border-b border-slate-100 tabular-nums text-slate-700"
                >
                  {isProb ? formatPercent(val) : val}
                </td>
              ))}
              {rowSums && (
                <td className="text-center px-3 py-2.5 border-b border-slate-100 tabular-nums text-slate-400">
                  {rowSums[i]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPercent(val: number): string {
  if (!Number.isFinite(val)) return '—';
  return `${(val * 100).toFixed(1)}%`;
}
