import type { WeatherRecord, ValidationResult } from '@/types';
import { isValidWeather, normalizeWeather } from '@/math/transitionMatrix';

export function parseCSV(text: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rejected: { row: string; reason: string }[] = [];
  const records: WeatherRecord[] = [];

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      valid: false,
      errors: ['The file is empty.'],
      warnings: [],
      records: [],
      rejected: [],
    };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const dateIdx = header.indexOf('date');
  const weatherIdx = header.indexOf('weather');

  if (dateIdx === -1 || weatherIdx === -1) {
    return {
      valid: false,
      errors: ['The CSV file must have "date" and "weather" columns.'],
      warnings: [],
      records: [],
      rejected: [],
    };
  }

  const seenDates = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const rawRow = lines[i];

    if (cols.length < Math.max(dateIdx, weatherIdx) + 1) {
      rejected.push({ row: rawRow, reason: 'Too few columns in this row.' });
      continue;
    }

    const dateRaw = cols[dateIdx];
    const weatherRaw = cols[weatherIdx];

    if (!dateRaw) {
      rejected.push({ row: rawRow, reason: 'Missing date value.' });
      continue;
    }

    if (!weatherRaw) {
      rejected.push({ row: rawRow, reason: 'Missing weather value.' });
      continue;
    }

    if (!isValidDate(dateRaw)) {
      rejected.push({ row: rawRow, reason: `Invalid date format: "${dateRaw}".` });
      continue;
    }

    if (!isValidWeather(weatherRaw)) {
      rejected.push({
        row: rawRow,
        reason: `Unknown weather state: "${weatherRaw}". Allowed: Sunny, Cloudy, Rainy.`,
      });
      continue;
    }

    if (seenDates.has(dateRaw)) {
      rejected.push({ row: rawRow, reason: `Duplicate date: "${dateRaw}".` });
      continue;
    }

    seenDates.add(dateRaw);
    records.push({
      date: dateRaw,
      weather: normalizeWeather(weatherRaw) as WeatherRecord['weather'],
    });
  }

  if (records.length === 0) {
    errors.push('No valid records were found after parsing.');
  } else if (records.length < 2) {
    errors.push('At least 2 valid records are needed to compute any transition.');
  }

  if (rejected.length > 0) {
    warnings.push(`${rejected.length} row(s) were rejected. See details below.`);
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  let unsorted = false;
  for (let i = 0; i < records.length; i++) {
    if (records[i].date !== sorted[i].date) {
      unsorted = true;
      break;
    }
  }
  if (unsorted) {
    warnings.push('Dates were not in chronological order and have been sorted automatically.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    records: sorted,
    rejected,
  };
}

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime());
}

export function recordsToCSV(records: WeatherRecord[]): string {
  const lines = ['date,weather'];
  for (const r of records) {
    lines.push(`${r.date},${r.weather}`);
  }
  return lines.join('\n');
}
