export interface DataPoint {
  [key: string]: string | number | Date;
}

export interface ParsedData {
  data: DataPoint[];
  columns: ColumnInfo[];
  headers: string[];
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'date';
  index: number;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | 'polarArea' | 'radar' | 'bubble';

export interface AxisConfig {
  id: string;
  label: string;
  column: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  display: boolean;
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
  tension?: number; // for line charts
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxes: AxisConfig[];
  yAxes: AxisConfig[];
  datasets: DatasetConfig[];
  colors: string[];
  // Legacy support - will be mapped to xAxes[0] and yAxes[0]
  xAxis?: string;
  yAxis?: string;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename: string;
  quality?: number;
}
