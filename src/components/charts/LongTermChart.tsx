import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import type { Vector } from '@/types';
import { WEATHER_STATES } from '@/types';
import { WEATHER_COLORS } from '@/components/WeatherIcon';

interface Props {
  distribution: Vector;
}

interface ChartRow {
  name: string;
  value: number;
  color: string;
}

export function LongTermChart({ distribution }: Props) {
  const data: ChartRow[] = WEATHER_STATES.map((w, i) => ({
    name: w,
    value: +(distribution[i] * 100).toFixed(2),
    color: WEATHER_COLORS[w],
  }));

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: '13px', fill: '#475569' }} />
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
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => `${Number(v).toFixed(1)}%`}
              style={{ fontSize: '13px', fontWeight: 600, fill: '#475569' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
