import { describe, it, expect } from 'vitest';
import {
  normalizeNumericString,
  normalizeBlank,
  normalizeDateString,
  normalizeExcelSerialDate,
  normalizeRow,
} from '../../parsers/normalizeData';

// ─── normalizeNumericString ───────────────────────────────────────────────────

describe('normalizeNumericString', () => {
  it('converts plain integers', () => {
    expect(normalizeNumericString('42')).toBe(42);
  });

  it('converts decimals', () => {
    expect(normalizeNumericString('3.14')).toBe(3.14);
  });

  it('converts negative numbers', () => {
    expect(normalizeNumericString('-7.5')).toBe(-7.5);
  });

  it('strips commas in thousands', () => {
    expect(normalizeNumericString('1,234.56')).toBe(1234.56);
  });

  it('strips leading currency symbols', () => {
    expect(normalizeNumericString('$100')).toBe(100);
    expect(normalizeNumericString('€50.00')).toBe(50);
    expect(normalizeNumericString('£1,200')).toBe(1200);
  });

  it('strips trailing percent sign', () => {
    expect(normalizeNumericString('95%')).toBe(95);
  });

  it('trims whitespace', () => {
    expect(normalizeNumericString('  42  ')).toBe(42);
  });

  it('preserves non-numeric strings', () => {
    expect(normalizeNumericString('hello')).toBe('hello');
    expect(normalizeNumericString('Lab A')).toBe('Lab A');
  });

  it('preserves empty strings', () => {
    expect(normalizeNumericString('')).toBe('');
  });
});

// ─── normalizeBlank ───────────────────────────────────────────────────────────

describe('normalizeBlank', () => {
  it('converts null to null', () => {
    expect(normalizeBlank(null)).toBeNull();
  });

  it('converts undefined to null', () => {
    expect(normalizeBlank(undefined)).toBeNull();
  });

  it('converts empty string to null', () => {
    expect(normalizeBlank('')).toBeNull();
  });

  it('converts whitespace-only string to null', () => {
    expect(normalizeBlank('   ')).toBeNull();
  });

  it('converts NaN number to null', () => {
    expect(normalizeBlank(NaN)).toBeNull();
  });

  it('preserves valid numbers', () => {
    expect(normalizeBlank(0)).toBe(0);
    expect(normalizeBlank(42)).toBe(42);
  });

  it('preserves non-empty strings', () => {
    expect(normalizeBlank('hello')).toBe('hello');
  });
});

// ─── normalizeDateString ──────────────────────────────────────────────────────

describe('normalizeDateString', () => {
  it('recognizes YYYY-MM-DD format', () => {
    expect(normalizeDateString('2024-01-15')).toBe('2024-01-15');
  });

  it('converts DD/MM/YYYY when day > 12', () => {
    // 25/01/2024 → day is 25, must be DD/MM/YYYY
    expect(normalizeDateString('25/01/2024')).toBe('2024-01-25');
  });

  it('converts MM/DD/YYYY when day > 12', () => {
    // 01/25/2024 → second part is 25, must be MM/DD/YYYY
    expect(normalizeDateString('01/25/2024')).toBe('2024-01-25');
  });

  it('returns null for ambiguous dates (both parts ≤ 12)', () => {
    // 03/04/2024 could be March 4 or April 3
    expect(normalizeDateString('03/04/2024')).toBeNull();
  });

  it('returns null for invalid ISO dates', () => {
    expect(normalizeDateString('2024-13-01')).toBeNull();
  });

  it('returns null for non-date strings', () => {
    expect(normalizeDateString('hello')).toBeNull();
    expect(normalizeDateString('42')).toBeNull();
  });
});

// ─── normalizeExcelSerialDate ─────────────────────────────────────────────────

describe('normalizeExcelSerialDate', () => {
  it('converts serial date 44927 to 2023-01-01', () => {
    // 44927 is Jan 1, 2023 in Excel serial date format
    expect(normalizeExcelSerialDate(44927)).toBe('2023-01-01');
  });

  it('returns null for non-integer values', () => {
    expect(normalizeExcelSerialDate(1.5)).toBeNull();
  });

  it('returns null for values out of range', () => {
    expect(normalizeExcelSerialDate(0)).toBeNull();
    expect(normalizeExcelSerialDate(100000)).toBeNull();
  });
});

// ─── normalizeRow ─────────────────────────────────────────────────────────────

describe('normalizeRow', () => {
  it('normalizes blanks and numeric strings in a row', () => {
    const row = { date: '2024-01-15', value: '1,234.56', name: '', empty: null };
    const headers = ['date', 'value', 'name', 'empty'];
    const result = normalizeRow(row, headers);

    expect(result.date).toBe('2024-01-15');
    expect(result.value).toBe(1234.56);
    expect(result.name).toBeNull();
    expect(result.empty).toBeNull();
  });

  it('preserves non-numeric strings', () => {
    const row = { label: 'Lab A', count: '42' };
    const headers = ['label', 'count'];
    const result = normalizeRow(row, headers);

    expect(result.label).toBe('Lab A');
    expect(result.count).toBe(42);
  });
});
