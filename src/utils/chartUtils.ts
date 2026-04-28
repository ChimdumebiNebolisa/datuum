import {
  ChartType,
  ChartConfig,
  DataPoint,
  ColumnInfo,
  AxisConfig,
  DatasetConfig,
  ReferenceRange,
  ActiveFilter,
  DateRangeFilter,
  ValueRangeFilter,
  CategoryFilter,
} from '@/types';

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'polarArea', label: 'Polar Area' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'bubble', label: 'Bubble Chart' },
];

export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

// ─── Build default chart config from mapped column roles ──────────────────────

export function createDefaultChartConfig(
  _data: DataPoint[],
  columns: ColumnInfo[],
  chartType: ChartType = 'line'
): ChartConfig {
  const xCol = columns.find((c) => c.role === 'x-axis');
  const ySeries = columns.filter((c) => c.role === 'y-series');
  const refLowerCols = columns.filter((c) => c.role === 'ref-lower');
  const refUpperCols = columns.filter((c) => c.role === 'ref-upper');

  const xAxes: AxisConfig[] = xCol
    ? [
        {
          id: 'x1',
          label: xCol.displayName || xCol.name,
          column: xCol.name,
          position: 'bottom',
          type: xCol.type === 'date' ? 'time' : 'category',
          display: true,
          grid: { display: true },
          ticks: { color: '#6B7280' },
        },
      ]
    : [];

  const yAxes: AxisConfig[] = ySeries.slice(0, 1).map((col, i) => ({
    id: `y${i + 1}`,
    label: col.displayName || col.name,
    column: col.name,
    position: 'left',
    type: 'linear',
    display: true,
    unit: col.unit,
    grid: { display: true },
    ticks: { color: '#6B7280' },
  }));

  // Additional y-series share the same y-axis by default
  const datasets: DatasetConfig[] = ySeries.map((col, i) => ({
    label: col.displayName || col.name,
    column: col.name,
    yAxisID: 'y1',
    xAxisID: 'x1',
    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    type: chartType === 'line' ? 'line' : chartType === 'scatter' ? 'scatter' : 'bar',
    fill: false,
    tension: 0.3,
  }));

  // Auto-build reference ranges from ref-lower/ref-upper columns
  // Pair them by position: first lower with first upper, etc.
  const referenceRanges: ReferenceRange[] = ySeries.slice(0, refLowerCols.length || refUpperCols.length).map((seriesCol, i) => ({
    id: `ref-${i}`,
    seriesColumn: seriesCol.name,
    lowerColumn: refLowerCols[i]?.name,
    upperColumn: refUpperCols[i]?.name,
    label: 'Reference Range',
    fillColor: 'rgba(34, 197, 94, 0.12)',
  }));

  return {
    type: chartType,
    title: 'Chart',
    xAxes,
    yAxes,
    datasets,
    referenceRanges,
    filters: [],
    colors: [...DEFAULT_COLORS],
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export function applyFilters(data: DataPoint[], filters: ActiveFilter[]): DataPoint[] {
  if (filters.length === 0) return data;

  return data.filter((row) => {
    return filters.every((filter) => {
      const rawVal = row[filter.column];

      if (filter.type === 'date-range') {
        const f = filter.value as DateRangeFilter;
        if (!rawVal) return true; // missing values pass through
        const d = new Date(rawVal as string).getTime();
        if (isNaN(d)) return true;
        if (f.from && d < new Date(f.from).getTime()) return false;
        if (f.to && d > new Date(f.to).getTime()) return false;
        return true;
      }

      if (filter.type === 'value-range') {
        const f = filter.value as ValueRangeFilter;
        const n = Number(rawVal);
        if (isNaN(n)) return true;
        if (f.min !== undefined && n < f.min) return false;
        if (f.max !== undefined && n > f.max) return false;
        return true;
      }

      if (filter.type === 'category') {
        const f = filter.value as CategoryFilter;
        if (f.include.length === 0) return true;
        return f.include.includes(String(rawVal ?? ''));
      }

      return true;
    });
  });
}

// ─── Reference range band datasets ───────────────────────────────────────────

/**
 * Generate Chart.js datasets that create a shaded band between lower and upper bounds.
 *
 * Strategy: two transparent line datasets per range.
 *   lower: fill: false, pointRadius: 0, borderColor: transparent
 *   upper: fill: '-1' (fills back to the lower dataset), borderColor: transparent
 *
 * If a row is missing a bound value, we use null so Chart.js breaks the fill
 * at that point rather than creating a misleading band. This is intentional —
 * better to show a gap than invent data.
 */
export function getReferenceRangeDatasets(
  data: DataPoint[],
  ranges: ReferenceRange[],
  labels: string[],
  xColumn: string
): unknown[] {
  const bandDatasets: unknown[] = [];

  for (const range of ranges) {
    const { lowerColumn, upperColumn, fillColor, label } = range;
    if (!lowerColumn && !upperColumn) continue;

    // Build value arrays aligned to labels (x-axis values)
    const labelIndex = new Map(labels.map((l, i) => [l, i]));
    const lowerValues: (number | null)[] = new Array(labels.length).fill(null);
    const upperValues: (number | null)[] = new Array(labels.length).fill(null);

    for (const row of data) {
      const xVal = String(row[xColumn] ?? '');
      const idx = labelIndex.get(xVal);
      if (idx === undefined) continue;

      if (lowerColumn) {
        const raw = row[lowerColumn];
        if (raw === null || raw === undefined || raw === '') {
          lowerValues[idx] = null;
        } else {
          const v = Number(raw);
          lowerValues[idx] = isNaN(v) ? null : v;
        }
      }
      if (upperColumn) {
        const raw = row[upperColumn];
        if (raw === null || raw === undefined || raw === '') {
          upperValues[idx] = null;
        } else {
          const v = Number(raw);
          upperValues[idx] = isNaN(v) ? null : v;
        }
      }
    }

    // Lower boundary line (invisible, just anchors the fill)
    if (lowerColumn) {
      bandDatasets.push({
        label: `${label ?? 'Range'} Lower`,
        data: lowerValues,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0.3,
        _isReferenceBand: true,
      });
    }

    // Upper boundary line (fills back to the lower dataset)
    if (upperColumn) {
      bandDatasets.push({
        label: `${label ?? 'Range'} Upper`,
        data: upperValues,
        borderColor: 'transparent',
        // fill: '-1' fills toward the previous dataset (the lower line)
        // If there is no lower dataset, fill toward the x-axis
        fill: lowerColumn ? '-1' : 'origin',
        backgroundColor: fillColor,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.3,
        _isReferenceBand: true,
      });
    }
  }

  return bandDatasets;
}

// ─── Main chart data builder ──────────────────────────────────────────────────

export function getChartData(
  data: DataPoint[],
  config: ChartConfig
): { labels: string[]; datasets: unknown[] } {
  const primaryX = config.xAxes[0];

  if (!primaryX) return { labels: [], datasets: [] };

  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    const primaryY = config.yAxes[0];
    if (!primaryY) return { labels: [], datasets: [] };

    const grouped = data.reduce((acc: Record<string, number>, row) => {
      const lbl = String(row[primaryX.column] ?? '');
      const val = Number(row[primaryY.column] ?? 0);
      acc[lbl] = (acc[lbl] ?? 0) + (isNaN(val) ? 0 : val);
      return acc;
    }, {});

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          data: Object.values(grouped),
          backgroundColor: config.colors.slice(0, Object.keys(grouped).length),
        },
      ],
    };
  }

  if (config.type === 'scatter') {
    const datasets = config.datasets
      .map((ds) => {
        const yAxis = config.yAxes.find((a) => a.id === ds.yAxisID);
        const xAxis = config.xAxes.find((a) => a.id === ds.xAxisID);
        if (!yAxis || !xAxis) return null;
        return {
          label: ds.label,
          data: data.map((row) => ({
            x: Number(row[xAxis.column] ?? 0),
            y: Number(row[yAxis.column] ?? 0),
          })),
          backgroundColor: ds.color,
          borderColor: ds.color,
          pointRadius: 5,
          yAxisID: ds.yAxisID,
          xAxisID: ds.xAxisID,
        };
      })
      .filter(Boolean);
    return { labels: [], datasets };
  }

  // bar / line / radar / bubble
  const labels = [...new Set(data.map((row) => String(row[primaryX.column] ?? '')))];

  const seriesDatasets = config.datasets
    .map((ds) => {
      const yAxis = config.yAxes.find((a) => a.id === ds.yAxisID);
      const xAxis = config.xAxes.find((a) => a.id === ds.xAxisID);
      if (!yAxis || !xAxis) return null;

      // Build value per label, preserving null for missing rows
      // (important for time series with gaps — don't sum/aggregate)
      const valueMap = new Map<string, number | null>();
      for (const row of data) {
        const lbl = String(row[xAxis.column] ?? '');
        const val = row[yAxis.column];
        if (val !== null && val !== undefined && val !== '') {
          valueMap.set(lbl, Number(val));
        } else {
          if (!valueMap.has(lbl)) valueMap.set(lbl, null);
        }
      }

      return {
        label: ds.label,
        data: labels.map((l) => valueMap.get(l) ?? null),
        backgroundColor: ds.type === 'line' ? 'transparent' : ds.color,
        borderColor: ds.color,
        borderWidth: 2,
        fill: ds.fill ?? false,
        tension: ds.tension ?? 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: ds.yAxisID,
        xAxisID: ds.xAxisID,
        spanGaps: false, // show gap for missing values rather than connecting across them
      };
    })
    .filter(Boolean);

  // Inject reference range band datasets BEFORE series datasets so they render behind
  const bandDatasets = config.referenceRanges.length > 0
    ? getReferenceRangeDatasets(data, config.referenceRanges, labels, primaryX.column)
    : [];

  return {
    labels,
    datasets: [...bandDatasets, ...seriesDatasets],
  };
}

// ─── Multi-axis helpers (preserved from original) ─────────────────────────────

export function addYAxis(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const col = columns.find((c) => c.name === column);
  if (!col || col.type !== 'numeric') return config;

  const id = `y${config.yAxes.length + 1}`;
  const newAxis: AxisConfig = {
    id,
    label: col.displayName || col.name,
    column,
    position: config.yAxes.length % 2 === 0 ? 'left' : 'right',
    type: 'linear',
    display: true,
    unit: col.unit,
    grid: { display: true },
    ticks: { color: '#6B7280' },
  };

  return { ...config, yAxes: [...config.yAxes, newAxis] };
}

export function addXAxis(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const col = columns.find((c) => c.name === column);
  if (!col || (col.type !== 'categorical' && col.type !== 'date')) return config;

  const id = `x${config.xAxes.length + 1}`;
  const newAxis: AxisConfig = {
    id,
    label: col.displayName || col.name,
    column,
    position: config.xAxes.length % 2 === 0 ? 'bottom' : 'top',
    type: col.type === 'date' ? 'time' : 'category',
    display: true,
    grid: { display: true },
    ticks: { color: '#6B7280' },
  };

  return { ...config, xAxes: [...config.xAxes, newAxis] };
}

export function removeAxis(config: ChartConfig, axisId: string): ChartConfig {
  return {
    ...config,
    xAxes: config.xAxes.filter((a) => a.id !== axisId),
    yAxes: config.yAxes.filter((a) => a.id !== axisId),
    datasets: config.datasets.filter(
      (ds) => ds.xAxisID !== axisId && ds.yAxisID !== axisId
    ),
  };
}

export function addDataset(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const col = columns.find((c) => c.name === column);
  if (!col || col.type !== 'numeric') return config;

  const yAxis = config.yAxes.find((a) => a.display) ?? config.yAxes[0];
  const xAxis = config.xAxes.find((a) => a.display) ?? config.xAxes[0];
  if (!yAxis || !xAxis) return config;

  const ds: DatasetConfig = {
    label: col.displayName || col.name,
    column,
    yAxisID: yAxis.id,
    xAxisID: xAxis.id,
    color: config.colors[config.datasets.length % config.colors.length],
    type: config.type === 'line' ? 'line' : config.type === 'scatter' ? 'scatter' : 'bar',
    fill: false,
    tension: 0.3,
  };

  return { ...config, datasets: [...config.datasets, ds] };
}

export function removeDataset(config: ChartConfig, index: number): ChartConfig {
  return { ...config, datasets: config.datasets.filter((_, i) => i !== index) };
}

export function validateChartConfig(
  config: ChartConfig,
  columns: ColumnInfo[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.xAxes.length === 0) errors.push('At least one X-axis is required');
  if (config.yAxes.length === 0 && config.type !== 'pie' && config.type !== 'doughnut' && config.type !== 'polarArea')
    errors.push('At least one Y-axis is required');
  if (config.datasets.length === 0) errors.push('At least one dataset is required');

  config.xAxes.forEach((axis, i) => {
    if (!columns.find((c) => c.name === axis.column))
      errors.push(`X-axis ${i + 1}: column "${axis.column}" not found`);
  });

  config.yAxes.forEach((axis, i) => {
    const col = columns.find((c) => c.name === axis.column);
    if (!col) {
      errors.push(`Y-axis ${i + 1}: column "${axis.column}" not found`);
    } else if (col.type !== 'numeric') {
      errors.push(`Y-axis ${i + 1}: column "${axis.column}" must be numeric`);
    }
  });

  config.datasets.forEach((ds, i) => {
    if (!columns.find((c) => c.name === ds.column))
      errors.push(`Dataset ${i + 1}: column "${ds.column}" not found`);
    if (!config.yAxes.find((a) => a.id === ds.yAxisID))
      errors.push(`Dataset ${i + 1}: Y-axis "${ds.yAxisID}" not found`);
    if (!config.xAxes.find((a) => a.id === ds.xAxisID))
      errors.push(`Dataset ${i + 1}: X-axis "${ds.xAxisID}" not found`);
  });

  return { isValid: errors.length === 0, errors };
}
