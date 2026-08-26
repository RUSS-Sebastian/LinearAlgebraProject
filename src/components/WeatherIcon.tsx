import { Sun, Cloud, CloudRain } from 'lucide-react';
import type { WeatherState } from '@/types';

interface Props {
  weather: WeatherState | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-14 h-14',
};

export function WeatherIcon({ weather, size = 'md', className = '' }: Props) {
  const cls = `${sizeMap[size]} ${className}`;
  switch (weather) {
    case 'Sunny':
      return <Sun className={cls} style={{ color: '#f59e0b' }} aria-label="Sunny" />;
    case 'Cloudy':
      return <Cloud className={cls} style={{ color: '#64748b' }} aria-label="Cloudy" />;
    case 'Rainy':
      return <CloudRain className={cls} style={{ color: '#0284c7' }} aria-label="Rainy" />;
    default:
      return null;
  }
}

export const WEATHER_COLORS: Record<string, string> = {
  Sunny: '#f59e0b',
  Cloudy: '#64748b',
  Rainy: '#0284c7',
};
