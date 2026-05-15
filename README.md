# Datuum

**Frontend-only Data Visualization Builder with CSV, XLSX, and PDF Support.**  
Upload a file, preview your data, map column roles, and generate customizable charts with reference range overlays, filters, and PNG/SVG/PDF export — entirely in the browser. No backend, no AI data sharing, no account required.

---

## What it does

Datuum walks you through four steps:

1. **Upload** — drag-and-drop or click to upload a `.csv`, `.xlsx`, `.xls`, or `.pdf` file. Multi-sheet Excel workbooks show a sheet-selector. PDFs undergo heuristic text extraction with an OCR fallback.
2. **Preview** — inspect the parsed data in a searchable, scrollable table. You will see a "Reference Status" badge for rows that have corresponding reference ranges.
3. **Map Columns** — assign a role to each column (x-axis, value series, reference bounds, label, or ignore). Datuum applies smart defaults based on column names and types. Add units and display names per column.
4. **Chart and Export** — a Chart.js chart renders immediately. Customize chart type, series colors, reference range bands, and filters. Export as PNG, SVG, or PDF.

---

## Key features

| Feature | Detail |
| --- | --- |
| CSV upload | PapaParse; handles quoted fields, mixed encodings |
| XLSX/XLS upload | SheetJS; dynamically imported to keep the initial bundle lean |
| PDF text extraction | Uses `pdfjs-dist` to heuristically extract tabular text data |
| OCR fallback | Uses `tesseract.js` for scanned PDFs (runs locally via Web Workers) |
| Table preview | Searchable, paginated, sortable data table with out-of-range status badges |
| Column role mapping | Assign x-axis / y-series / ref-lower / ref-upper / label / ignore per column |
| Automatic suggestions | Column names pattern-matched to roles; name-aware reference range pairing |
| 8 chart types | Line, Bar, Scatter, Pie, Doughnut, Polar Area, Radar, Bubble |
| Reference overlays | Shaded band between lower and upper bound columns using Chart.js `fill: '-1'` |
| Frontend-only | Your data never leaves the browser — no server API, no tracking |

---

## Example use case

A user uploads a spreadsheet or PDF tracking lab results over time:

| Date | TSH | T3 | T4 | TSH_Lower | TSH_Upper | Source |
| --- | --- | --- | --- | --- | --- | --- |
| 2024-01-15 | 2.1 | 1.4 | 8.2 | 0.5 | 4.5 | Lab A |
| 2024-04-10 | 3.8 | 1.2 | 7.5 | 0.5 | 4.5 | Lab A |

Datuum auto-assigns:
- `Date` → x-axis
- `TSH`, `T3`, `T4` → y-series
- `TSH_Lower` → ref-lower, `TSH_Upper` → ref-upper
- `Source` → label

The result is a line chart with a green reference band showing the normal TSH range, immediately visible for any value that fell outside bounds. 

A synthetic version of this data is included at [`public/sample-lab-data.csv`](public/sample-lab-data.csv).  
A PDF version of this data is available at [`public/sample-lab-data.pdf`](public/sample-lab-data.pdf) (generated via `node scripts/generatePdfFixture.js`).

> **Medical disclaimer:** Datuum only visualizes uploaded data. It does not provide medical advice, diagnosis, or treatment recommendations.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4 |
| Charts | Chart.js v4 + chartjs-adapter-date-fns |
| Parsing | PapaParse, SheetJS (`xlsx`), `pdfjs-dist`, `tesseract.js` |
| Export | html2canvas + jsPDF |
| Unit tests | Vitest + jsdom (95 tests) |
| E2E tests | Playwright (9 tests) |

---

## Architecture

```text
src/
├── parsers/
│   ├── csvParser.ts       # PapaParse wrapper; inferColumnTypes; suggestRole
│   ├── xlsxParser.ts      # SheetJS wrapper; parseXlsx (dynamic import)
│   ├── pdfParser.ts       # pdfjs-dist text extraction + tesseract.js OCR fallback
│   ├── normalizeData.ts   # Shared normalizer for dates, numbers, and Excel serials
│   └── index.ts           # parseFile() factory — dispatches by file extension
│
├── components/
│   ├── upload/            # FileUpload (react-dropzone), SheetSelector
│   ├── mapping/           # ColumnMapper (role editor)
│   ├── chart/             # ChartRenderer, ChartControls, ReferenceRangePanel
│   ├── export/            # ExportControls
│   ├── table/             # DataTable, DataSearchFilter
│   └── ui/                # Error handling, animations
│
├── utils/
│   ├── chartUtils.ts      # ChartConfig generation, matchRefColumn, getRangeStatus
│   └── exportUtils.ts     # HTML to Canvas/PDF conversion
│
└── DataVisualizationApp.tsx # Main state machine: upload → preview → map → chart
```

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
# Next.js production build
npm run build

# Vitest unit tests (95 tests covering parsers, inference, logic)
npm run test

# Playwright E2E tests (CSV/XLSX flows)
npm run test:e2e
```

---

## Known limitations

- **PDF extraction heuristics** — Reconstructing a table from PDF text positions is a heuristic process. Complex layouts, rotated text, or merged cells may yield incorrect rows. Always verify the data.
- **OCR accuracy and speed** — Scanned PDFs fall back to Tesseract OCR which runs locally in a web worker. It may be slow (5–30 seconds per page) and can hallucinate or misread numbers. You will see a warning when OCR is used.
- **No persistence** — Data and chart config are lost on page refresh (browser-only state).
- **Shared Y-axis** — Currently, multiple y-series share the same y-axis scale, which can be misleading if units differ drastically.

---

## Future work

- Add a "Per Marker" chart view to separate series with different units.
- JSON and TSV upload support.
- Improved PDF report export (proper vector rendering instead of canvas capture).
- Aggregation modes (sum/avg/count per x-axis bucket).
