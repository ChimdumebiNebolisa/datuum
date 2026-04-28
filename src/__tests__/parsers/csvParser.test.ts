import { describe, it, expect } from 'vitest';
import { inferColumnTypes, suggestRole } from '../../parsers/csvParser';
import type { DataPoint } from '../../types';

// ─── inferColumnTypes ─────────────────────────────────────────────────────────

describe('inferColumnTypes', () => {
  it('detects numeric columns', () => {
    const data: DataPoint[] = [{ value: 1.2 }, { value: 3.4 }, { value: 0.9 }];
    const cols = inferColumnTypes(data, ['value']);
    expect(cols[0].type).toBe('numeric');
  });

  it('detects date columns', () => {
    const data: DataPoint[] = [
      { date: '2024-01-15' },
      { date: '2024-02-20' },
      { date: '2024-03-10' },
    ];
    const cols = inferColumnTypes(data, ['date']);
    expect(cols[0].type).toBe('date');
  });

  it('detects categorical columns', () => {
    const data: DataPoint[] = [
      { lab: 'Lab A' },
      { lab: 'Lab B' },
      { lab: 'Lab C' },
    ];
    const cols = inferColumnTypes(data, ['lab']);
    expect(cols[0].type).toBe('categorical');
  });

  it('assigns correct index', () => {
    const data: DataPoint[] = [{ a: 1, b: 'x', c: '2024-01-01' }];
    const cols = inferColumnTypes(data, ['a', 'b', 'c']);
    expect(cols[0].index).toBe(0);
    expect(cols[1].index).toBe(1);
    expect(cols[2].index).toBe(2);
  });

  it('handles mixed-type columns gracefully as categorical', () => {
    const data: DataPoint[] = [{ val: '123' }, { val: 'abc' }, { val: '456' }];
    const cols = inferColumnTypes(data, ['val']);
    // Not 100% numeric → categorical
    expect(cols[0].type).toBe('categorical');
  });

  it('handles empty values by excluding them from type inference', () => {
    const data: DataPoint[] = [
      { x: 1 }, { x: '' }, { x: null }, { x: 2 }, { x: 3 },
    ];
    const cols = inferColumnTypes(data, ['x']);
    expect(cols[0].type).toBe('numeric');
  });
});

// ─── suggestRole ─────────────────────────────────────────────────────────────

describe('suggestRole', () => {
  const allCols = (name: string, type: 'numeric' | 'date' | 'categorical') =>
    [{ name, type }];

  // Date columns → x-axis
  it('suggests x-axis for date columns', () => {
    expect(suggestRole('Date', 'date', allCols('Date', 'date'))).toBe('x-axis');
    expect(suggestRole('collected_at', 'date', allCols('collected_at', 'date'))).toBe('x-axis');
  });

  // Reference lower
  it('suggests ref-lower for lower/min columns', () => {
    expect(suggestRole('Lower Limit', 'numeric', allCols('Lower Limit', 'numeric'))).toBe('ref-lower');
    expect(suggestRole('lower_ref', 'numeric', allCols('lower_ref', 'numeric'))).toBe('ref-lower');
    expect(suggestRole('min', 'numeric', allCols('min', 'numeric'))).toBe('ref-lower');
    expect(suggestRole('RefLow', 'numeric', allCols('RefLow', 'numeric'))).toBe('ref-lower');
    expect(suggestRole('LowerBound', 'numeric', allCols('LowerBound', 'numeric'))).toBe('ref-lower');
  });

  // Reference upper
  it('suggests ref-upper for upper/max columns', () => {
    expect(suggestRole('Upper Limit', 'numeric', allCols('Upper Limit', 'numeric'))).toBe('ref-upper');
    expect(suggestRole('upper_ref', 'numeric', allCols('upper_ref', 'numeric'))).toBe('ref-upper');
    expect(suggestRole('max', 'numeric', allCols('max', 'numeric'))).toBe('ref-upper');
    expect(suggestRole('RefHigh', 'numeric', allCols('RefHigh', 'numeric'))).toBe('ref-upper');
  });

  // Label columns
  it('suggests label for source/lab/notes columns', () => {
    expect(suggestRole('Source', 'categorical', allCols('Source', 'categorical'))).toBe('label');
    expect(suggestRole('Lab', 'categorical', allCols('Lab', 'categorical'))).toBe('label');
    expect(suggestRole('Notes', 'categorical', allCols('Notes', 'categorical'))).toBe('label');
    expect(suggestRole('laboratory', 'categorical', allCols('laboratory', 'categorical'))).toBe('label');
  });

  // Lab values like TSH, T3, T4 → y-series
  it('suggests y-series for generic numeric columns like TSH, T3, T4', () => {
    expect(suggestRole('TSH', 'numeric', allCols('TSH', 'numeric'))).toBe('y-series');
    expect(suggestRole('T3', 'numeric', allCols('T3', 'numeric'))).toBe('y-series');
    expect(suggestRole('T4', 'numeric', allCols('T4', 'numeric'))).toBe('y-series');
    expect(suggestRole('FreeT4', 'numeric', allCols('FreeT4', 'numeric'))).toBe('y-series');
  });

  // First non-numeric → x-axis
  it('suggests x-axis for the first categorical column', () => {
    const cols = [
      { name: 'Month', type: 'categorical' as const },
      { name: 'Revenue', type: 'numeric' as const },
    ];
    expect(suggestRole('Month', 'categorical', cols)).toBe('x-axis');
  });

  // Other categorical → ignore
  it('suggests ignore for secondary categorical columns', () => {
    const cols = [
      { name: 'Month', type: 'categorical' as const },
      { name: 'Region', type: 'categorical' as const },
    ];
    expect(suggestRole('Region', 'categorical', cols)).toBe('ignore');
  });
});
