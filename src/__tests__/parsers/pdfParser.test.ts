import { describe, it, expect } from 'vitest';
import { reconstructTable } from '../../parsers/pdfParser';

// ─── reconstructTable (pure function, no mocking needed) ──────────────────────

describe('reconstructTable', () => {
  it('reconstructs a simple tab-separated table', () => {
    const pages = [
      [
        'Date\tTSH\tT3\tT4',
        '2024-01-15\t2.1\t1.4\t8.2',
        '2024-04-10\t3.8\t1.2\t7.5',
      ],
    ];

    const result = reconstructTable(pages);
    expect(result).not.toBeNull();
    expect(result!.headers).toEqual(['Date', 'TSH', 'T3', 'T4']);
    expect(result!.rows).toHaveLength(2);
    expect(result!.rows[0]).toEqual(['2024-01-15', '2.1', '1.4', '8.2']);
  });

  it('reconstructs a table split across multiple pages', () => {
    const pages = [
      [
        'Date\tValue',
        '2024-01-01\t10',
      ],
      [
        '2024-02-01\t20',
        '2024-03-01\t30',
      ],
    ];

    const result = reconstructTable(pages);
    expect(result).not.toBeNull();
    expect(result!.headers).toEqual(['Date', 'Value']);
    expect(result!.rows).toHaveLength(3);
  });

  it('uses space-separated columns', () => {
    const pages = [
      [
        'Date    TSH    T3',
        '2024-01-15    2.1    1.4',
      ],
    ];

    const result = reconstructTable(pages);
    expect(result).not.toBeNull();
    expect(result!.headers).toEqual(['Date', 'TSH', 'T3']);
  });

  it('returns null for single line input', () => {
    expect(reconstructTable([['just one line']])).toBeNull();
  });

  it('returns null for single column input', () => {
    const pages = [['a', 'b', 'c']];
    expect(reconstructTable(pages)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(reconstructTable([])).toBeNull();
    expect(reconstructTable([[]])).toBeNull();
  });

  it('skips lines with mismatched column count', () => {
    const pages = [
      [
        'A\tB\tC',
        '1\t2\t3',
        'extra line that does not match',
        '4\t5\t6',
      ],
    ];

    const result = reconstructTable(pages);
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(2); // only the 2 matching rows
  });

  it('uses the line with the most columns as the header', () => {
    const pages = [
      [
        'Title line',
        'A\tB\tC\tD',
        '1\t2\t3\t4',
        '5\t6\t7\t8',
      ],
    ];

    const result = reconstructTable(pages);
    expect(result).not.toBeNull();
    expect(result!.headers).toEqual(['A', 'B', 'C', 'D']);
    expect(result!.rows).toHaveLength(2);
  });
});

// ─── parsePdf integration (mocked pdfjs-dist) ────────────────────────────────

// NOTE: Full parsePdf tests that exercise pdfjs-dist or tesseract.js are
// integration-level and require mocking the dynamic imports. The core logic
// is already tested through reconstructTable above.
//
// For CI, we test:
//  1. reconstructTable (pure, tested above)
//  2. normalizeRow (tested in normalizeData.test.ts)
//  3. inferColumnTypes / suggestRole (tested in csvParser.test.ts)
//
// The parsePdf function itself is a thin orchestrator of these tested pieces.

describe('parsePdf (orchestrator, mocked)', () => {
  it('is exported from pdfParser', async () => {
    const mod = await import('../../parsers/pdfParser');
    expect(typeof mod.parsePdf).toBe('function');
    expect(typeof mod.extractTextFromPdf).toBe('function');
    expect(typeof mod.ocrPdfPages).toBe('function');
    expect(typeof mod.reconstructTable).toBe('function');
  });
});
