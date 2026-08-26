import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Vector } from '@/types';
import { WEATHER_STATES } from '@/types';
import { WEATHER_COLORS } from '@/components/WeatherIcon';

interface Props {
  distributions: Vector[];
}

interface ChartRow {
  day: string;
  Sunny: number;
  Cloudy: number;
  Rainy: number;
}

export function ForecastChart({ distributions }: Props) {
  const data: ChartRow[] = distributions.map((dist, i) => ({
    day: i === 0 ? 'Tomorrow' : `Day ${i + 1}`,
    Sunny: +(dist[0] * 100).toFixed(2),
    Cloudy: +(dist[1] * 100).toFixed(2),
    Rainy: +(dist[2] * 100).toFixed(2),
  }));

  return (
    <div className="w-full" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: '12px', fill: '#64748b' }} />
          <YAxis
            tick={{ fontSize: '12px', fill: '#64748b' }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(v) => `${Number(v).toFixed(1)}%`}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '13px' }} />
          {WEATHER_STATES.map((w) => (
            <Line
              key={w}
              type="monotone"
              dataKey={w}
              stroke={WEATHER_COLORS[w]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
