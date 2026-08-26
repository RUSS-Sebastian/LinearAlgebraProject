import type { ForecastResult } from '@/types';
import { WEATHER_STATES } from '@/types';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  forecast: ForecastResult;
}

export function ForecastTable({ forecast }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-slate-500 font-medium px-3 py-2.5">Day</th>
            {WEATHER_STATES.map((w) => (
              <th key={w} className="text-right font-medium px-3 py-2.5 text-slate-600">
                <div className="flex items-center justify-end gap-1.5">
                  <WeatherIcon weather={w} size="sm" />
                  {w}
                </div>
              </th>
            ))}
            <th className="text-left font-medium px-3 py-2.5 text-slate-600">Most Likely</th>
          </tr>
        </thead>
        <tbody>
          {forecast.days.map((day) => (
            <tr key={day.day} className="border-b border-slate-100 hover:bg-slate-50/60">
              <td className="px-3 py-2.5 font-medium text-slate-700">{day.label}</td>
              {day.distribution.map((prob, j) => (
                <td
                  key={j}
                  className={`text-right px-3 py-2.5 tabular-nums ${
                    j === day.mostLikely ? 'font-semibold text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {(prob * 100).toFixed(1)}%
                </td>
              ))}
              <td className="px-3 py-2.5">
                {day.tie ? (
                  <span className="text-slate-500 italic text-xs">Tie between states</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <WeatherIcon weather={WEATHER_STATES[day.mostLikely]} size="sm" />
                    <span className="font-medium text-slate-700">
                      {WEATHER_STATES[day.mostLikely]}
                    </span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
