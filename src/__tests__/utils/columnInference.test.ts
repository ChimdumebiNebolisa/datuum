import { describe, it, expect } from 'vitest';
import { applyFilters } from '../../utils/chartUtils';
import type { DataPoint, ActiveFilter } from '../../types';

// ─── applyFilters ─────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  const labData: DataPoint[] = [
    { date: '2024-01-15', TSH: 1.2, source: 'Lab A' },
    { date: '2024-03-10', TSH: 2.8, source: 'Lab B' },
    { date: '2024-06-20', TSH: 0.9, source: 'Lab A' },
    { date: '2024-09-05', TSH: 3.5, source: 'Lab C' },
  ];

  it('returns all data when no filters', () => {
    expect(applyFilters(labData, [])).toHaveLength(4);
  });

  // Date range
  it('filters by date range (from)', () => {
    const filters: ActiveFilter[] = [
      { id: '1', column: 'date', type: 'date-range', value: { from: '2024-03-01' } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(3);
    expect(result.every((r) => new Date(r.date as string) >= new Date('2024-03-01'))).toBe(true);
  });

  it('filters by date range (to)', () => {
    const filters: ActiveFilter[] = [
      { id: '1', column: 'date', type: 'date-range', value: { to: '2024-06-30' } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(3);
  });

  it('filters by date range (from + to)', () => {
    const filters: ActiveFilter[] = [
      { id: '1', column: 'date', type: 'date-range', value: { from: '2024-02-01', to: '2024-07-01' } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.date)).toContain('2024-03-10');
    expect(result.map((r) => r.date)).toContain('2024-06-20');
  });

  // Value range
  it('filters by value range (min)', () => {
    const filters: ActiveFilter[] = [
      { id: '2', column: 'TSH', type: 'value-range', value: { min: 2.0 } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
    expect(result.every((r) => Number(r.TSH) >= 2.0)).toBe(true);
  });

  it('filters by value range (max)', () => {
    const filters: ActiveFilter[] = [
      { id: '2', column: 'TSH', type: 'value-range', value: { max: 2.0 } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
  });

  it('filters by value range (min + max)', () => {
    const filters: ActiveFilter[] = [
      { id: '2', column: 'TSH', type: 'value-range', value: { min: 1.0, max: 3.0 } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
  });

  // Category filter
  it('filters by category include list', () => {
    const filters: ActiveFilter[] = [
      { id: '3', column: 'source', type: 'category', value: { include: ['Lab A'] } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.source === 'Lab A')).toBe(true);
  });

  it('returns all when category include is empty (no exclusions)', () => {
    const filters: ActiveFilter[] = [
      { id: '3', column: 'source', type: 'category', value: { include: [] } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(4);
  });

  // Multiple filters (AND logic)
  it('applies multiple filters with AND logic', () => {
    const filters: ActiveFilter[] = [
      { id: '1', column: 'date', type: 'date-range', value: { from: '2024-01-01', to: '2024-07-01' } },
      { id: '3', column: 'source', type: 'category', value: { include: ['Lab A'] } },
    ];
    const result = applyFilters(labData, filters);
    expect(result).toHaveLength(2);
  });

  // Edge: missing values pass through
  it('passes rows with missing filter column value through date filter', () => {
    const data: DataPoint[] = [{ date: null, val: 1 }, { date: '2024-05-01', val: 2 }];
    const filters: ActiveFilter[] = [
      { id: '1', column: 'date', type: 'date-range', value: { from: '2024-01-01' } },
    ];
    const result = applyFilters(data, filters);
    // null date passes through (no data to exclude it on)
    expect(result).toHaveLength(2);
  });
});

// ─── getReferenceRangeDatasets smoke test ────────────────────────────────────

import { getReferenceRangeDatasets } from '../../utils/chartUtils';
import type { ReferenceRange } from '../../types';

describe('getReferenceRangeDatasets', () => {
  const data: DataPoint[] = [
    { date: '2024-01-01', TSH: 1.5, lower: 0.5, upper: 4.5 },
    { date: '2024-02-01', TSH: 2.3, lower: 0.5, upper: 4.5 },
  ];
  const labels = ['2024-01-01', '2024-02-01'];

  it('returns 2 datasets for a full range (lower + upper)', () => {
    const ranges: ReferenceRange[] = [
      { id: 'r1', seriesColumn: 'TSH', lowerColumn: 'lower', upperColumn: 'upper', fillColor: 'rgba(34,197,94,0.15)' },
    ];
    const datasets = getReferenceRangeDatasets(data, ranges, labels, 'date') as Array<{_isReferenceBand: boolean}>;
    expect(datasets).toHaveLength(2);
    expect(datasets.every((d) => d._isReferenceBand)).toBe(true);
  });

  it('returns 1 dataset when only upper column is provided', () => {
    const ranges: ReferenceRange[] = [
      { id: 'r2', seriesColumn: 'TSH', upperColumn: 'upper', fillColor: 'rgba(34,197,94,0.15)' },
    ];
    const datasets = getReferenceRangeDatasets(data, ranges, labels, 'date');
    expect(datasets).toHaveLength(1);
  });

  it('returns 0 datasets when range has no columns', () => {
    const ranges: ReferenceRange[] = [
      { id: 'r3', seriesColumn: 'TSH', fillColor: 'rgba(34,197,94,0.15)' },
    ];
    const datasets = getReferenceRangeDatasets(data, ranges, labels, 'date');
    expect(datasets).toHaveLength(0);
  });

  it('uses null for missing bound values', () => {
    const sparseData: DataPoint[] = [
      { date: '2024-01-01', TSH: 1.5, lower: 0.5 },
      { date: '2024-02-01', TSH: 2.3, lower: null }, // missing lower
    ];
    const ranges: ReferenceRange[] = [
      { id: 'r4', seriesColumn: 'TSH', lowerColumn: 'lower', fillColor: 'rgba(34,197,94,0.15)' },
    ];
    const datasets = getReferenceRangeDatasets(sparseData, ranges, labels, 'date') as Array<{data: (number|null)[]}>;
    // The lower dataset data should have null for the missing row
    expect(datasets[0].data[1]).toBeNull();
  });
});
