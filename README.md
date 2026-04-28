# Datuum

**Frontend-only CSV/XLSX spreadsheet-to-chart builder.**  
Upload a file, preview your data, map column roles, and generate customizable charts with reference range overlays, filters, and PNG/SVG/PDF export — entirely in the browser. No backend, no AI, no account required.

---

## What it does

Datuum walks you through four steps:

1. **Upload** — drag-and-drop or click to upload a `.csv`, `.xlsx`, or `.xls` file. Multi-sheet Excel workbooks show a sheet-selector before import.
2. **Preview** — inspect the parsed data in a searchable, scrollable table before committing to a chart.
3. **Map Columns** — assign a role to each column (x-axis, value series, reference bounds, label, or ignore). Datuum applies smart defaults based on column names and types. Add units and display names per column.
4. **Chart and Export** — a Chart.js chart renders immediately. Customize chart type, series colors, reference range bands, and filters. Export as PNG, SVG, or PDF.

---

## Key features

| Feature | Detail |
| --- | --- |
| CSV upload | PapaParse; handles quoted fields, mixed encodings |
| XLSX/XLS upload | SheetJS; dynamically imported to keep the initial bundle lean |
| Excel multi-sheet selector | Modal lists sheet names — choose before import |
| Table preview | Searchable, paginated, sortable data table |
| Column role mapping | Assign x-axis / y-series / ref-lower / ref-upper / label / ignore per column |
| Automatic suggestions | Column names pattern-matched to roles; date columns detected by value sampling |
| Units and display names | Optional per-column unit (e.g. `ng/dL`) and display name override |
| 8 chart types | Line, Bar, Scatter, Pie, Doughnut, Polar Area, Radar, Bubble |
| Reference range overlays | Shaded band between lower and upper bound columns using Chart.js `fill: '-1'` |
| Filters | Date-range, value-range, and category filters; applied before every render |
| PNG/SVG/PDF export | html2canvas + jsPDF; no watermarks |
| Frontend-only | Your data never leaves the browser — no server, no tracking |

---

## Column roles

| Role | Meaning |
| --- | --- |
| `x-axis` | Horizontal axis — date, time, or category values |
| `y-series` | Plotted as a line, bar, or scatter series |
| `ref-lower` | Lower boundary of a reference range band |
| `ref-upper` | Upper boundary of a reference range band |
| `label` | Shown in tooltips only; not plotted |
| `ignore` | Excluded from the chart entirely |

Pair a `ref-lower` and `ref-upper` column with a `y-series` column to produce a shaded reference band behind that series.

---

## Example use case

A user uploads a spreadsheet tracking lab results over time:

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

> **Medical disclaimer:** Datuum only visualizes uploaded data. It does not provide medical advice, diagnosis, or treatment recommendations.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Charts | Chart.js v4 + chartjs-adapter-date-fns |
| CSV parsing | PapaParse |
| XLSX parsing | SheetJS (`xlsx`) |
| Export | html2canvas + jsPDF |
| Unit tests | Vitest + jsdom + @testing-library/jest-dom |
| E2E tests | Playwright (Chromium) |

---

## Architecture

```text
src/
├── parsers/
│   ├── csvParser.ts       # PapaParse wrapper; inferColumnTypes; suggestRole heuristics
│   ├── xlsxParser.ts      # SheetJS wrapper; getSheetNames; parseXlsx (dynamic import)
│   └── index.ts           # parseFile() factory — dispatches by file extension
│
├── components/
│   ├── upload/
│   │   ├── FileUpload.tsx  # react-dropzone; detects sheet count; triggers SheetSelector
│   │   └── SheetSelector.tsx # Modal for multi-sheet Excel workbooks
│   ├── mapping/
│   │   └── ColumnMapper.tsx  # Per-column role/type/unit/display-name editor
│   ├── chart/
│   │   ├── ChartRenderer.tsx # Chart.js canvas; registers Filler for ref bands
│   │   └── controls/         # ChartControls, ChartTypeSelector, SeriesConfigPanel,
│   │                         # ReferenceRangePanel, FilterPanel, ColorCustomizer
│   ├── export/
│   │   └── ExportControls.tsx # PNG / SVG / PDF buttons
│   ├── table/
│   │   ├── DataTable.tsx
│   │   └── DataSearchFilter.tsx
│   └── ui/
│       └── ParticleNetwork.tsx # Landing page canvas animation
│
├── utils/
│   ├── chartUtils.ts      # createDefaultChartConfig; applyFilters; getReferenceRangeDatasets
│   └── exportUtils.ts     # exportChart; generateFilename
│
├── types/
│   └── index.ts           # ColumnRole, ColumnInfo, ReferenceRange, ActiveFilter, ChartConfig…
│
└── DataVisualizationApp.tsx  # useReducer state machine: upload → preview → map → chart

tests/
├── global-setup.ts           # Generates tests/fixtures/sample-lab-data.xlsx at runtime
└── e2e/
    └── datuum-flow.spec.ts   # 9 Playwright tests covering CSV and XLSX end-to-end flows

src/__tests__/
├── parsers/csvParser.test.ts     # 18 Vitest tests: type inference + role suggestions
├── parsers/xlsxParser.test.ts    # 8 Vitest tests: sheet names, parsing, edge cases
└── utils/columnInference.test.ts # 11 Vitest tests: filters + reference range datasets
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

# Vitest unit tests (37 tests)
npm run test

# Playwright E2E tests — headless (9 tests)
npm run test:e2e

# Playwright E2E tests — headed (watch the browser)
npm run test:e2e:headed
```

The Playwright suite starts the Next.js dev server automatically and generates a synthetic XLSX fixture before running.

---

## Sample data

`public/sample-lab-data.csv` — synthetic thyroid lab values (TSH, T3, T4) with reference bounds, units, and source columns. Use it to walk through the full pipeline without uploading real data.

---

## Known limitations

- **No persistence** — data and chart config are lost on page refresh (browser-only state).
- **No AI / OCR / PDF parsing** — Datuum reads structured tabular data only (.csv, .xlsx, .xls).
- **Large XLSX files** — parsing runs on the main thread; very large workbooks (>20 MB) may block briefly.
- **PDF export** — uses html2canvas + jsPDF; complex chart styles may not render perfectly in all browsers.
- **High-cardinality category filters** — the toggle-button UI becomes unwieldy for columns with many unique values (>50).

---

## Future work

- JSON and TSV upload
- Improved PDF report export (proper vector rendering)
- Web Worker parsing for large files
- Session persistence via `localStorage` or URL hash
- Aggregation modes (sum/avg/count per x-axis bucket)
- Click-to-add annotations on the chart timeline

---

## Engineering highlights

This project is a practical demonstration of several frontend engineering patterns:

- **Parser factory** — `parseFile()` in `src/parsers/index.ts` dispatches to PapaParse or SheetJS based on file extension; SheetJS is dynamically imported so it stays out of the initial bundle.
- **Multi-format input** — a single upload component handles CSV, XLSX, and XLS; multi-sheet workbooks are handled with a dedicated sheet-selector modal rather than a guess.
- **Column role mapping** — `suggestRole()` pattern-matches column names to roles using a priority ladder (date name/type → x-axis, lower/min patterns → ref-lower, etc.). The UI exposes all assignments for manual correction before the chart is built.
- **Reference range rendering** — bands are drawn using Chart.js native `fill: '-1'` (fill toward the previous dataset) without any plugins. Null values in either boundary column produce intentional gaps rather than interpolated bands.
- **Automated testing** — 37 Vitest unit tests cover parsers, column inference, filter logic, and reference range dataset generation. 9 Playwright E2E tests drive the full browser flow from landing page through chart and export for both CSV and XLSX files.
