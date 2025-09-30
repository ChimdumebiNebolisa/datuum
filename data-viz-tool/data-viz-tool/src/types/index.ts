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

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxis: string;
  yAxis: string;
  colors: string[];
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename: string;
  quality?: number;
}
