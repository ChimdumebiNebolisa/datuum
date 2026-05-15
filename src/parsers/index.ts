import { ParsedData } from '@/types';
import type { PdfParseOptions } from './pdfParser';

export interface ParseOptions {
  sheetName?: string;
  /** PDF-specific options (progress callback, etc.) */
  pdf?: PdfParseOptions;
}

/**
 * Parse a CSV or XLSX file into a ParsedData structure.
 * SheetJS (xlsx) is dynamically imported so it does not bloat the initial bundle.
 */
export async function parseFile(file: File, options?: ParseOptions): Promise<ParsedData> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const { parseCSV } = await import('./csvParser');
    return parseCSV(file);
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const { parseXlsx } = await import('./xlsxParser');
    return parseXlsx(file, options?.sheetName);
  }

  if (ext === 'pdf') {
    const { parsePdf } = await import('./pdfParser');
    return parsePdf(file, options?.pdf);
  }

  throw new Error(
    `Unsupported file type ".${ext}". Please upload a CSV (.csv), Excel (.xlsx, .xls), or PDF (.pdf) file.`
  );
}

/**
 * Returns the sheet names from an XLSX workbook without parsing all data.
 * Returns ['Sheet1'] for CSVs so callers don't need to branch.
 */
export async function getSheetNames(file: File): Promise<string[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') return ['Sheet1'];

  if (ext === 'pdf') return ['Page 1'];

  if (ext === 'xlsx' || ext === 'xls') {
    const { getSheetNames: xlsxGetSheetNames } = await import('./xlsxParser');
    return xlsxGetSheetNames(file);
  }

  return [];
}

// Re-export parsers for direct use in tests
export { parseCSV, validateParsedData as validateCSV, inferColumnTypes, suggestRole, sortData } from './csvParser';
export { parseXlsx } from './xlsxParser';
export { parsePdf } from './pdfParser';
export type { PdfParseOptions, PdfParseProgress } from './pdfParser';
