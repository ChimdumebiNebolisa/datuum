import { DataPoint } from '@/types';

// ─── Numeric normalization ────────────────────────────────────────────────────

/**
 * Attempt to convert a string to a number when the intent is unambiguous.
 * Handles: "1,234.56", "$100", "  42 ", negative numbers, percentages stripped of %.
 * Returns the original string if conversion is uncertain.
 */
export function normalizeNumericString(val: string): number | string {
  const trimmed = val.trim();
  if (trimmed === '') return val;

  // Strip leading currency symbols and trailing % sign
  const cleaned = trimmed
    .replace(/^[$€£¥]+/, '')
    .replace(/%$/, '')
    .replace(/,/g, '')
    .trim();

  if (cleaned === '') return val;

  const n = Number(cleaned);
  if (!isNaN(n) && isFinite(n)) return n;
  return val;
}

// ─── Blank normalization ──────────────────────────────────────────────────────

/**
 * Normalize blank/empty/whitespace-only values to null.
 */
export function normalizeBlank(val: unknown): string | number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    if (val.trim() === '') return null;
    return val;
  }
  return String(val);
}

// ─── Date normalization ───────────────────────────────────────────────────────

// Match common unambiguous date patterns
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;                    // YYYY-MM-DD
const US_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;         // MM/DD/YYYY or DD/MM/YYYY

/**
 * Attempt to normalize a date string to ISO format (YYYY-MM-DD).
 *
 * Only converts when the format is unambiguous:
 *   - YYYY-MM-DD is already ISO → keep as-is after validation
 *   - MM/DD/YYYY: only converted when month > 12 is impossible (i.e. first part ≤ 12)
 *     AND the values form a valid date. When first part > 12, treat as DD/MM/YYYY.
 *   - When both parts ≤ 12, the format is AMBIGUOUS → return null (preserve original).
 *
 * Returns the ISO string if confident, or null if ambiguous/invalid.
 */
export function normalizeDateString(val: string): string | null {
  const trimmed = val.trim();

  // Already ISO
  if (ISO_DATE.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return trimmed;
    return null;
  }

  // Slash-separated date
  const slashMatch = trimmed.match(US_DATE);
  if (slashMatch) {
    const a = parseInt(slashMatch[1], 10);
    const b = parseInt(slashMatch[2], 10);
    const year = parseInt(slashMatch[3], 10);

    // a > 12 → must be DD/MM/YYYY (a is day, b is month)
    if (a > 12 && b >= 1 && b <= 12) {
      const iso = `${year}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`;
      const d = new Date(iso + 'T00:00:00Z');
      if (!isNaN(d.getTime()) && d.getUTCDate() === a && d.getUTCMonth() + 1 === b) return iso;
      return null;
    }

    // b > 12 → must be MM/DD/YYYY (a is month, b is day)
    if (b > 12 && a >= 1 && a <= 12) {
      const iso = `${year}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
      const d = new Date(iso + 'T00:00:00Z');
      if (!isNaN(d.getTime()) && d.getUTCDate() === b && d.getUTCMonth() + 1 === a) return iso;
      return null;
    }

    // Both ≤ 12 → AMBIGUOUS (could be MM/DD or DD/MM) → do not convert
    return null;
  }

  return null;
}

// ─── Excel serial date detection ──────────────────────────────────────────────

/** Excel epoch: Jan 0, 1900 (with the Lotus 1-2-3 leap year bug) */
const EXCEL_EPOCH = new Date(1899, 11, 30).getTime();

/**
 * Detect and convert an Excel serial date number to ISO date string.
 * Excel serial dates are typically in the range ~1 to ~60000+ (year 1900–2063).
 * Returns ISO string if the number looks like a serial date, null otherwise.
 */
export function normalizeExcelSerialDate(val: number): string | null {
  // Reasonable range: 1 (Jan 1 1900) to 73050 (~year 2099)
  if (val < 1 || val > 73050 || !Number.isInteger(val)) return null;

  const ms = EXCEL_EPOCH + val * 86400000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// ─── Row normalization ────────────────────────────────────────────────────────

/**
 * Apply all normalizations to a single data row.
 *
 * Order:
 *   1. Normalize blanks (empty → null)
 *   2. Attempt numeric conversion for string values
 *
 * Date normalization is NOT applied automatically per-cell because it requires
 * column-level context (knowing a column is a date column). It's available as
 * a standalone function for callers that have that context.
 */
export function normalizeRow(
  row: Record<string, unknown>,
  headers: string[]
): DataPoint {
  const normalized: DataPoint = {};
  for (const key of headers) {
    let val = normalizeBlank(row[key]);
    if (typeof val === 'string') {
      const num = normalizeNumericString(val);
      if (typeof num === 'number') {
        val = num;
      } else {
        val = num; // keeps the string
      }
    }
    normalized[key] = val;
  }
  return normalized;
}
