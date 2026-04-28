import { describe, it, expect } from 'vitest';
import { getSheetNames, parseXlsx } from '../../parsers/xlsxParser';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal XLSX ArrayBuffer from a JS array of objects using SheetJS.
 * This lets us test xlsxParser against real binary data without fixture files.
 */
async function buildXlsxBuffer(
  rows: Record<string, unknown>[],
  sheetName = 'Sheet1'
): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[];
  return new Uint8Array(buf).buffer;
}

function bufferToFile(buffer: ArrayBuffer, name: string): File {
  return new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ─── getSheetNames ────────────────────────────────────────────────────────────

describe('getSheetNames', () => {
  it('returns single sheet name', async () => {
    const buf = await buildXlsxBuffer([{ a: 1 }], 'Data');
    const file = bufferToFile(buf, 'test.xlsx');
    const sheets = await getSheetNames(file);
    expect(sheets).toEqual(['Data']);
  });

  it('returns multiple sheet names', async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ x: 1 }]), 'Labs');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ y: 2 }]), 'Meds');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[];
    const file = bufferToFile(new Uint8Array(buf).buffer, 'multi.xlsx');
    const sheets = await getSheetNames(file);
    expect(sheets).toEqual(['Labs', 'Meds']);
  });
});

// ─── parseXlsx ────────────────────────────────────────────────────────────────

describe('parseXlsx', () => {
  it('parses headers correctly', async () => {
    const rows = [{ Date: '2024-01-01', TSH: 1.5, T3: 2.1 }];
    const buf = await buildXlsxBuffer(rows);
    const file = bufferToFile(buf, 'lab.xlsx');
    const result = await parseXlsx(file);
    expect(result.headers).toContain('Date');
    expect(result.headers).toContain('TSH');
    expect(result.headers).toContain('T3');
  });

  it('parses rows correctly', async () => {
    const rows = [
      { Date: '2024-01-01', TSH: 1.5 },
      { Date: '2024-02-01', TSH: 2.3 },
    ];
    const buf = await buildXlsxBuffer(rows);
    const file = bufferToFile(buf, 'lab.xlsx');
    const result = await parseXlsx(file);
    expect(result.data).toHaveLength(2);
    expect(Number(result.data[0]['TSH'])).toBeCloseTo(1.5);
  });

  it('infers numeric columns', async () => {
    const rows = [{ value: 1.2 }, { value: 3.4 }, { value: 0.8 }];
    const buf = await buildXlsxBuffer(rows);
    const file = bufferToFile(buf, 'test.xlsx');
    const result = await parseXlsx(file);
    const col = result.columns.find((c) => c.name === 'value');
    expect(col?.type).toBe('numeric');
  });

  it('attaches source metadata', async () => {
    const rows = [{ x: 1 }];
    const buf = await buildXlsxBuffer(rows, 'MySheet');
    const file = bufferToFile(buf, 'myfile.xlsx');
    const result = await parseXlsx(file, 'MySheet');
    expect(result.source?.filename).toBe('myfile.xlsx');
    expect(result.source?.format).toBe('xlsx');
    expect(result.source?.sheetName).toBe('MySheet');
  });

  it('uses first sheet when no sheetName provided', async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ val: 99 }]), 'Alpha');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ val: 1 }]), 'Beta');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[];
    const file = bufferToFile(new Uint8Array(buf).buffer, 'multi.xlsx');
    const result = await parseXlsx(file);
    expect(result.source?.sheetName).toBe('Alpha');
    expect(Number(result.data[0]['val'])).toBe(99);
  });

  it('throws for an unknown sheet name', async () => {
    const rows = [{ x: 1 }];
    const buf = await buildXlsxBuffer(rows, 'Sheet1');
    const file = bufferToFile(buf, 'test.xlsx');
    await expect(parseXlsx(file, 'NonExistent')).rejects.toThrow('"NonExistent"');
  });

  it('returns empty dataset for empty sheet', async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empty');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[];
    const file = bufferToFile(new Uint8Array(buf).buffer, 'empty.xlsx');
    const result = await parseXlsx(file, 'Empty');
    expect(result.data).toHaveLength(0);
    expect(result.headers).toHaveLength(0);
  });
});
