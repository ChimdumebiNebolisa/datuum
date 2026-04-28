// ─── Column ───────────────────────────────────────────────────────────────────

export type ColumnType = 'numeric' | 'categorical' | 'date';

export type ColumnRole =
  | 'x-axis'    // time or category axis
  | 'y-series'  // value to plot
  | 'ref-lower' // reference range lower bound
  | 'ref-upper' // reference range upper bound
  | 'label'     // extra tooltip field (e.g. "source", "lab")
  | 'ignore';   // excluded from chart

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  role: ColumnRole;
  index: number;
  unit?: string;        // e.g. "ng/dL", "mIU/L"
  displayName?: string; // override header in chart labels
}

// ─── Dataset (parsed file) ────────────────────────────────────────────────────

export interface DataPoint {
  [key: string]: string | number | null;
}

export interface DataSource {
  filename: string;
  format: 'csv' | 'xlsx';
  sheetName?: string;
}

export interface ParsedData {
  data: DataPoint[];
  columns: ColumnInfo[];
  headers: string[];
  source?: DataSource;
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface DateRangeFilter {
  from?: string; // ISO date string
  to?: string;
}

export interface ValueRangeFilter {
  min?: number;
  max?: number;
}

export interface CategoryFilter {
  include: string[];
}

export type FilterValue = DateRangeFilter | ValueRangeFilter | CategoryFilter;

export interface ActiveFilter {
  id: string;
  column: string;
  type: 'date-range' | 'value-range' | 'category';
  value: FilterValue;
}

// ─── Reference Ranges ─────────────────────────────────────────────────────────

export interface ReferenceRange {
  id: string;
  seriesColumn: string;  // which y-series this band applies to
  lowerColumn?: string;  // data column with lower bound per row
  upperColumn?: string;  // data column with upper bound per row
  label?: string;        // e.g. "Normal Range"
  fillColor: string;     // e.g. "rgba(34, 197, 94, 0.15)"
}

// ─── Chart Config ─────────────────────────────────────────────────────────────

export type ChartType =
  | 'bar'
  | 'line'
  | 'scatter'
  | 'pie'
  | 'doughnut'
  | 'polarArea'
  | 'radar'
  | 'bubble';

export interface AxisConfig {
  id: string;
  label: string;
  column: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  display: boolean;
  unit?: string; // appended to axis title: "T3 (ng/dL)"
  grid?: {
    display: boolean;
    color?: string;
  };
  ticks?: {
    color?: string;
    font?: {
      size?: number;
    };
  };
}

export interface DatasetConfig {
  label: string;
  column: string;
  yAxisID?: string;
  xAxisID?: string;
  color: string;
  type?: 'bar' | 'line' | 'scatter';
  fill?: boolean;
  tension?: number;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxes: AxisConfig[];
  yAxes: AxisConfig[];
  datasets: DatasetConfig[];
  referenceRanges: ReferenceRange[];
  filters: ActiveFilter[];
  colors: string[];
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename: string;
  quality?: number;
}
