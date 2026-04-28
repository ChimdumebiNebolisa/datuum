import Papa from 'papaparse';
import { DataPoint, ParsedData, ColumnInfo, ColumnType, ColumnRole, SortConfig } from '@/types';

// ─── Role suggestion ──────────────────────────────────────────────────────────

export function suggestRole(name: string, type: ColumnType, allColumns: { name: string; type: ColumnType }[]): ColumnRole {
  const lower = name.toLowerCase().replace(/[\s_\-\.]/g, '');

  if (type === 'date') return 'x-axis';

  // Reference lower bound patterns
  if (/lower|reflo|refmin|lowerlimit|lowerbound|lowref|llimit|lowerref|lownormal/.test(lower)) return 'ref-lower';
  if (/^(min|minimum)$/.test(lower)) return 'ref-lower';

  // Reference upper bound patterns
  if (/upper|refhi|refmax|upperlimit|upperbound|upref|ulimit|upperref|upnormal/.test(lower)) return 'ref-upper';
  if (/^(max|maximum)$/.test(lower)) return 'ref-upper';

  // Label / metadata patterns
  if (/source|lab|laboratory|notes?|comment|remark|method|instrument|analyst/.test(lower)) return 'label';

  // Numeric columns default to y-series (they are the values to chart)
  if (type === 'numeric') return 'y-series';

  // First categorical that looks like a time/date axis
  if (type === 'categorical') {
    // If it's the only non-numeric column, it's likely the x-axis
    const nonNumeric = allColumns.filter(c => c.type !== 'numeric');
    if (nonNumeric.length > 0 && nonNumeric[0].name === name) return 'x-axis';
  }

  return 'ignore';
}

// ─── Column type inference ────────────────────────────────────────────────────

export function inferColumnTypes(data: DataPoint[], headers: string[]): ColumnInfo[] {
  const allCols = headers.map((header) => {
    const sampleValues = data
      .slice(0, Math.min(20, data.length))
      .map((row) => row[header])
      .filter((v) => v !== null && v !== undefined && v !== '');

    let type: ColumnType = 'categorical';

    if (sampleValues.length > 0) {
      const allNumeric = sampleValues.every((v) => {
        const n = Number(v);
        return !isNaN(n) && isFinite(n);
      });

      if (allNumeric) {
        type = 'numeric';
      } else {
        // Use at least 80% valid date parse rate to avoid false positives
        const dateCount = sampleValues.filter((v) => {
          const d = new Date(v as string);
          return !isNaN(d.getTime());
        }).length;
        if (dateCount / sampleValues.length >= 0.8) {
          type = 'date';
        }
      }
    }

    return { name: header, type };
  });

  return allCols.map((col, index) => ({
    name: col.name,
    type: col.type,
    role: suggestRole(col.name, col.type, allCols),
    index,
  }));
}

// ─── Parse ────────────────────────────────────────────────────────────────────

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }

        const data = results.data as DataPoint[];
        const headers = results.meta.fields || [];
        const columns = inferColumnTypes(data, headers);

        resolve({
          data,
          columns,
          headers,
          source: { filename: file.name, format: 'csv' },
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateParsedData(data: ParsedData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.data.length === 0) errors.push('File is empty or contains no valid data rows');
  if (data.headers.length === 0) errors.push('File has no headers');

  const emptyColumns = data.columns.filter((col) =>
    data.data.every((row) => row[col.name] === null || row[col.name] === undefined || row[col.name] === '')
  );
  if (emptyColumns.length > 0) {
    errors.push(`Completely empty columns: ${emptyColumns.map((c) => c.name).join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

// Keep the old name for backward compat used elsewhere
export const validateCSV = validateParsedData;

// ─── Sort ─────────────────────────────────────────────────────────────────────

export function sortData(data: ParsedData, sortConfig: SortConfig): ParsedData {
  const { column, direction } = sortConfig;
  const columnInfo = data.columns.find((col) => col.name === column);
  if (!columnInfo) return data;

  const sortedData = [...data.data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (aVal === null || aVal === undefined || aVal === '') return direction === 'asc' ? -1 : 1;
    if (bVal === null || bVal === undefined || bVal === '') return direction === 'asc' ? 1 : -1;

    if (columnInfo.type === 'numeric') {
      return direction === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    }
    if (columnInfo.type === 'date') {
      const aT = new Date(aVal as string).getTime();
      const bT = new Date(bVal as string).getTime();
      return direction === 'asc' ? aT - bT : bT - aT;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return { ...data, data: sortedData };
}
