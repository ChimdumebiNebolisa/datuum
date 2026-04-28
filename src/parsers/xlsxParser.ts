// Dynamic SheetJS import — keeps it out of the initial bundle.
// Call sites must await these functions.

import { DataPoint, ParsedData } from '@/types';
import { inferColumnTypes } from './csvParser';

function normalizeValue(val: unknown): string | number | null {
  if (val === null || val === undefined || val === '') return null;
  // SheetJS with cellDates:true returns JS Date objects for date cells
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    // Normalize to ISO date string (YYYY-MM-DD) so type inference works
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return String(val);
}

export async function getSheetNames(file: File): Promise<string[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  return wb.SheetNames;
}

export async function parseXlsx(file: File, sheetName?: string): Promise<ParsedData> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  // cellDates:true: tells SheetJS to deserialize date serial numbers into JS Date objects
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  const targetSheet = sheetName ?? wb.SheetNames[0];
  if (!wb.SheetNames.includes(targetSheet)) {
    throw new Error(`Sheet "${targetSheet}" not found in workbook`);
  }

  const ws = wb.Sheets[targetSheet];

  // raw:false converts everything to strings first, but we want numbers preserved
  // so we use raw:true and normalize ourselves
  // cellDates is set on XLSX.read above — dates arrive as JS Date objects in rawRows already
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    header: 0,
    defval: null,
    raw: true,
  }) as Record<string, unknown>[];

  if (rawRows.length === 0) {
    return {
      data: [],
      columns: [],
      headers: [],
      source: { filename: file.name, format: 'xlsx', sheetName: targetSheet },
    };
  }

  const headers = Object.keys(rawRows[0]);

  const data: DataPoint[] = rawRows.map((row) => {
    const normalized: DataPoint = {};
    for (const key of headers) {
      normalized[key] = normalizeValue(row[key]);
    }
    return normalized;
  });

  const columns = inferColumnTypes(data, headers);

  return {
    data,
    columns,
    headers,
    source: { filename: file.name, format: 'xlsx', sheetName: targetSheet },
  };
}
