import { describe, it, expect } from 'vitest';
import { parseCSV } from '@/utils/csvParser';

describe('CSV Parser', () => {
  it('parses a valid CSV', () => {
    const csv = `date,weather
2026-08-01,Sunny
2026-08-02,Sunny
2026-08-03,Cloudy
2026-08-04,Rainy`;
    const result = parseCSV(csv);
    expect(result.valid).toBe(true);
    expect(result.records).toHaveLength(4);
    expect(result.records[0].weather).toBe('Sunny');
    expect(result.records[3].weather).toBe('Rainy');
  });

  it('normalizes weather capitalization', () => {
    const csv = `date,weather
2026-08-01,sunny
2026-08-02,SUNNY
2026-08-03,Cloudy`;
    const result = parseCSV(csv);
    expect(result.valid).toBe(true);
    expect(result.records[0].weather).toBe('Sunny');
    expect(result.records[1].weather).toBe('Sunny');
  });

  it('rejects unknown weather states', () => {
    const csv = `date,weather
2026-08-01,Sunny
2026-08-02,Snowy`;
    const result = parseCSV(csv);
    expect(result.rejected.length).toBeGreaterThan(0);
    expect(result.rejected[0].reason).toContain('Unknown weather state');
  });

  it('detects missing columns', () => {
    const csv = `date,temp
2026-08-01,25`;
    const result = parseCSV(csv);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('columns');
  });

  it('detects duplicate dates', () => {
    const csv = `date,weather
2026-08-01,Sunny
2026-08-01,Cloudy`;
    const result = parseCSV(csv);
    expect(result.rejected.length).toBeGreaterThan(0);
    expect(result.rejected[0].reason).toContain('Duplicate');
  });

  it('detects invalid dates', () => {
    const csv = `date,weather
2026-13-01,Sunny
2026-08-02,Cloudy`;
    const result = parseCSV(csv);
    expect(result.rejected.length).toBeGreaterThan(0);
  });

  it('handles empty file', () => {
    const result = parseCSV('');
    expect(result.valid).toBe(false);
  });

  it('sorts unsorted dates', () => {
    const csv = `date,weather
2026-08-03,Cloudy
2026-08-01,Sunny
2026-08-02,Sunny`;
    const result = parseCSV(csv);
    expect(result.valid).toBe(true);
    expect(result.records[0].date).toBe('2026-08-01');
    expect(result.warnings.some((w) => w.includes('sorted'))).toBe(true);
  });
});
