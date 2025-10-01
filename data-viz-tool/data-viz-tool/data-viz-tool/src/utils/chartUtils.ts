import { ChartType, ChartConfig, DataPoint, ColumnInfo, AxisConfig, DatasetConfig } from '@/types';

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
];

export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function createDefaultChartConfig(
  data: DataPoint[],
  columns: ColumnInfo[],
  chartType: ChartType
): ChartConfig {
  const numericColumns = columns.filter((col) => col.type === 'numeric');
  const categoricalColumns = columns.filter((col) => col.type === 'categorical');

  let xAxis = '';
  let yAxis = '';

  if (chartType === 'pie') {
    // For pie charts, use categorical for labels and numeric for values
    xAxis = categoricalColumns[0]?.name || columns[0]?.name || '';
    yAxis = numericColumns[0]?.name || columns[1]?.name || '';
  } else if (chartType === 'scatter') {
    // For scatter plots, use two numeric columns
    xAxis = numericColumns[0]?.name || columns[0]?.name || '';
    yAxis = numericColumns[1]?.name || columns[1]?.name || '';
  } else {
    // For bar and line charts, use categorical for x and numeric for y
    xAxis = categoricalColumns[0]?.name || columns[0]?.name || '';
    yAxis = numericColumns[0]?.name || columns[1]?.name || '';
  }

  // Create default axes
  const xAxisConfig: AxisConfig = {
    id: 'x-axis-1',
    label: xAxis || 'X Axis',
    column: xAxis || '',
    position: 'bottom',
    type: chartType === 'scatter' ? 'linear' : 'category',
    display: true,
  };

  const yAxisConfig: AxisConfig = {
    id: 'y-axis-1',
    label: yAxis || 'Y Axis',
    column: yAxis || '',
    position: 'left',
    type: 'linear',
    display: true,
  };

  // Create default dataset
  const datasetConfig: DatasetConfig = {
    label: yAxis || 'Data',
    column: yAxis || '',
    yAxisID: 'y-axis-1',
    xAxisID: 'x-axis-1',
    color: DEFAULT_COLORS[0],
  };

  return {
    type: chartType,
    title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
    xAxes: [xAxisConfig],
    yAxes: [yAxisConfig],
    datasets: [datasetConfig],
    colors: [...DEFAULT_COLORS],
    // Legacy support
    xAxis,
    yAxis,
  };
}

export function getChartData(
  data: DataPoint[],
  config: ChartConfig
): { labels: string[]; datasets: unknown[] } {
  const { xAxis, yAxis, colors } = config;

  if (config.type === 'pie') {
    // Group data by xAxis and sum yAxis values
    const groupedData = data.reduce((acc, row) => {
      const label = String(row[xAxis] || '');
      const value = Number(row[yAxis] || 0);
      const currentValue = typeof acc[label] === 'number' ? acc[label] : 0;
      acc[label] = currentValue + (isNaN(value) ? 0 : value);
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(groupedData),
      datasets: [
        {
          data: Object.values(groupedData),
          backgroundColor: colors.slice(0, Object.keys(groupedData).length),
        },
      ],
    };
  }

  if (config.type === 'scatter') {
    return {
      labels: [],
      datasets: [
        {
          label: `${xAxis} vs ${yAxis}`,
          data: data.map((row) => ({
            x: Number(row[xAxis] || 0),
            y: Number(row[yAxis] || 0),
          })),
          backgroundColor: colors[0],
          borderColor: colors[0],
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }

  // For bar and line charts
  const groupedData = data.reduce((acc, row) => {
    const label = String(row[xAxis] || '');
    const value = Number(row[yAxis] || 0);
    const currentValue = typeof acc[label] === 'number' ? acc[label] : 0;
    acc[label] = currentValue + (isNaN(value) ? 0 : value);
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(groupedData),
    datasets: [
      {
        label: yAxis,
        data: Object.values(groupedData),
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 1,
      },
    ],
  };
}

export function validateChartConfig(
  config: ChartConfig,
  columns: ColumnInfo[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.xAxis) {
    errors.push('X-axis column is required');
  }

  if (!config.yAxis) {
    errors.push('Y-axis column is required');
  }

  const xColumn = columns.find((col) => col.name === config.xAxis);
  const yColumn = columns.find((col) => col.name === config.yAxis);

  if (config.type === 'pie' || config.type === 'scatter') {
    if (xColumn && config.type === 'pie' && xColumn.type !== 'categorical') {
      errors.push('Pie chart requires a categorical column for labels');
    }
    if (yColumn && config.type === 'pie' && yColumn.type !== 'numeric') {
      errors.push('Pie chart requires a numeric column for values');
    }
    if (config.type === 'scatter') {
      if (xColumn && xColumn.type !== 'numeric') {
        errors.push('Scatter plot requires numeric columns for both axes');
      }
      if (yColumn && yColumn.type !== 'numeric') {
        errors.push('Scatter plot requires numeric columns for both axes');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
