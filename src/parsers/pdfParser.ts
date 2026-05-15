import { DataPoint, ParsedData } from '@/types';
import { inferColumnTypes } from './csvParser';
import { normalizeRow } from './normalizeData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfParseOptions {
  /** Called with progress updates during parsing. */
  onProgress?: (status: PdfParseProgress) => void;
}

export interface PdfParseProgress {
  stage: 'loading' | 'extracting-text' | 'running-ocr' | 'normalizing';
  /** 0–1 fraction, or undefined if indeterminate */
  progress?: number;
  /** e.g. "Extracting text from page 2 of 5" */
  message: string;
}

// ─── Text extraction (pdfjs-dist) ─────────────────────────────────────────────

/**
 * Extract text content from a PDF file page by page using pdfjs-dist.
 *
 * Returns an array of pages, where each page is an array of reconstructed
 * text lines. Lines are reconstructed by grouping text items that share
 * approximately the same y-coordinate, then sorting by x-coordinate.
 *
 * This is a heuristic — complex PDF layouts (multi-column, rotated text,
 * overlapping elements) may produce incorrect results.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (msg: string, fraction: number) => void
): Promise<string[][]> {
  const pdfjsLib = await import('pdfjs-dist');

  // Configure worker — use the bundled worker from pdfjs-dist
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = pdf.numPages;
  const allPages: string[][] = [];

  for (let i = 1; i <= pageCount; i++) {
    onProgress?.(`Extracting text from page ${i} of ${pageCount}`, i / pageCount);

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items by approximate y-coordinate (within 2px tolerance)
    const lineMap = new Map<number, { x: number; text: string }[]>();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round((item as { transform: number[] }).transform[5] / 2) * 2;
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({
        x: (item as { transform: number[] }).transform[4],
        text: item.str.trim(),
      });
    }

    // Sort lines by y-coordinate (top of page first = highest y value)
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);

    const pageLines: string[] = [];
    for (const y of sortedYs) {
      const items = lineMap.get(y)!;
      items.sort((a, b) => a.x - b.x);
      const line = items.map((it) => it.text).join('\t');
      if (line.trim()) pageLines.push(line);
    }

    allPages.push(pageLines);
  }

  return allPages;
}

// ─── Row reconstruction from text lines ───────────────────────────────────────

/**
 * Attempt to parse tab/multi-space separated text lines into a table structure.
 *
 * Strategy:
 *   1. Split each line by tabs or 2+ consecutive spaces
 *   2. Use the first line with the most columns as the header row
 *   3. Subsequent lines with a matching column count become data rows
 *   4. Lines with a different column count are skipped
 *
 * Returns null if no usable table structure is found (fewer than 2 rows
 * or fewer than 2 columns).
 */
export function reconstructTable(
  pages: string[][]
): { headers: string[]; rows: string[][] } | null {
  // Flatten all pages into one list of lines
  const allLines = pages.flat();
  if (allLines.length < 2) return null;

  // Split each line into cells
  const splitLines = allLines.map((line) => line.split(/\t|  +/).map((c) => c.trim()));

  // Find the line with the most columns — likely the header
  let headerIdx = 0;
  let maxCols = 0;
  for (let i = 0; i < splitLines.length; i++) {
    if (splitLines[i].length > maxCols) {
      maxCols = splitLines[i].length;
      headerIdx = i;
    }
  }

  if (maxCols < 2) return null;

  const headers = splitLines[headerIdx];
  const rows: string[][] = [];

  // Collect data rows that match the header column count (±1 tolerance)
  for (let i = 0; i < splitLines.length; i++) {
    if (i === headerIdx) continue;
    const line = splitLines[i];
    if (line.length >= maxCols - 1 && line.length <= maxCols + 1) {
      // Pad or trim to match header length
      const padded = headers.map((_, j) => line[j] ?? '');
      rows.push(padded);
    }
  }

  if (rows.length === 0) return null;

  return { headers, rows };
}

// ─── OCR fallback ─────────────────────────────────────────────────────────────

/**
 * Render PDF pages to canvas images, then OCR each page with Tesseract.js.
 *
 * This is slow (5–30s per page) and the output may contain errors.
 * The function is designed to be mockable in tests.
 */
export async function ocrPdfPages(
  file: File,
  onProgress?: (msg: string, fraction: number) => void
): Promise<string[][]> {
  const pdfjsLib = await import('pdfjs-dist');

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = pdf.numPages;
  const allPages: string[][] = [];

  // Dynamically import Tesseract only when OCR is needed
  const Tesseract = await import('tesseract.js');
  const worker = await Tesseract.createWorker('eng');

  try {
    for (let i = 1; i <= pageCount; i++) {
      onProgress?.(
        `Running OCR on page ${i} of ${pageCount} (this may take a moment)`,
        i / pageCount
      );

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x for better OCR quality

      // Render page to an OffscreenCanvas (or regular canvas in fallback)
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
      if (!ctx) continue;

      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      // Convert canvas to image blob for Tesseract
      const blob = await canvas.convertToBlob({ type: 'image/png' });

      const { data } = await worker.recognize(blob);
      const lines = data.text
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      allPages.push(lines);
    }
  } finally {
    await worker.terminate();
  }

  return allPages;
}

// ─── Main PDF parser ──────────────────────────────────────────────────────────

/**
 * Parse a PDF file into a ParsedData structure.
 *
 * Strategy:
 *   1. Attempt text extraction with pdfjs-dist
 *   2. Try to reconstruct a table from the extracted text
 *   3. If text extraction yields no usable table, fall back to OCR
 *   4. Normalize the extracted data through the shared normalization layer
 *
 * The user should always inspect extracted data before charting.
 * PDF table extraction is heuristic and may contain errors.
 */
export async function parsePdf(
  file: File,
  options?: PdfParseOptions
): Promise<ParsedData> {
  const { onProgress } = options ?? {};

  // Step 1: Extract text
  onProgress?.({
    stage: 'extracting-text',
    message: 'Extracting text from PDF…',
  });

  let pages = await extractTextFromPdf(file, (msg, fraction) => {
    onProgress?.({ stage: 'extracting-text', progress: fraction, message: msg });
  });

  // Count total page count before we try anything
  const pageCount = pages.length;

  // Step 2: Try table reconstruction from text
  let table = reconstructTable(pages);
  let extractionMethod: 'text' | 'ocr' = 'text';

  // Step 3: If text extraction failed, try OCR
  if (!table) {
    onProgress?.({
      stage: 'running-ocr',
      message: 'Text extraction found no table structure. Trying OCR…',
    });

    extractionMethod = 'ocr';
    pages = await ocrPdfPages(file, (msg, fraction) => {
      onProgress?.({ stage: 'running-ocr', progress: fraction, message: msg });
    });

    table = reconstructTable(pages);

    if (!table) {
      throw new Error(
        'Could not extract a table from this PDF. ' +
        'The file may not contain tabular data, or the layout may be too complex. ' +
        'Try converting it to CSV or Excel first.'
      );
    }
  }

  // Step 4: Normalize data
  onProgress?.({
    stage: 'normalizing',
    message: 'Normalizing extracted data…',
  });

  const { headers, rows } = table;

  const data: DataPoint[] = rows.map((row) => {
    const raw: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      raw[headers[j]] = row[j] ?? null;
    }
    return normalizeRow(raw, headers);
  });

  const columns = inferColumnTypes(data, headers);

  return {
    data,
    columns,
    headers,
    source: {
      filename: file.name,
      format: 'pdf',
      pageCount,
      extractionMethod,
    },
  };
}
