import { ChartType, ChartConfig, DataPoint, ColumnInfo, AxisConfig, DatasetConfig } from '@/types';

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'polarArea', label: 'Polar Area Chart' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'bubble', label: 'Bubble Chart' },
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
  const categoricalColumns = columns.filter((col) => col.type === 'categorical' || col.type === 'date');

  let xAxis = '';
  let yAxis = '';

  if (chartType === 'pie') {
    // For pie charts, use categorical for labels and numeric for values
    xAxis = categoricalColumns[0]?.name || '';
    yAxis = numericColumns[0]?.name || '';
  } else if (chartType === 'scatter') {
    // For scatter plots, use two numeric columns
    xAxis = numericColumns[0]?.name || '';
    yAxis = numericColumns[1]?.name || numericColumns[0]?.name || '';
  } else {
    // For bar, line, doughnut, polarArea, radar, bubble charts
    xAxis = categoricalColumns[0]?.name || '';
    yAxis = numericColumns[0]?.name || '';
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
  // Use legacy xAxis/yAxis for backward compatibility, or get from first axis
  const xAxis = config.xAxis || config.xAxes[0]?.column || '';
  const yAxis = config.yAxis || config.yAxes[0]?.column || '';
  const colors = config.colors;

  // Early return if no valid axes
  if (!xAxis || !yAxis) {
    return { labels: [], datasets: [] };
  }

  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
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

  if (config.type === 'bubble') {
    return {
      labels: [],
      datasets: [
        {
          label: `${xAxis} vs ${yAxis}`,
          data: data.map((row) => ({
            x: Number(row[xAxis] || 0),
            y: Number(row[yAxis] || 0),
            r: 10, // Default radius for bubble
          })),
          backgroundColor: colors[0],
          borderColor: colors[0],
        },
      ],
    };
  }

  if (config.type === 'radar') {
    // For radar charts, we need to group by categories and show multiple datasets
    const categories = [...new Set(data.map(row => String(row[xAxis] || '')))];
    const datasets = [{
      label: yAxis,
      data: categories.map(category => {
        const categoryData = data.filter(row => String(row[xAxis] || '') === category);
        return categoryData.reduce((sum, row) => sum + Number(row[yAxis] || 0), 0);
      }),
      backgroundColor: colors[0] + '20',
      borderColor: colors[0],
      pointBackgroundColor: colors[0],
    }];

    return {
      labels: categories,
      datasets,
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

  // Chart-specific validation
  if (config.type === 'pie') {
    if (xColumn && xColumn.type !== 'categorical' && xColumn.type !== 'date') {
      errors.push('Pie chart requires a categorical or date column for labels');
    }
    if (yColumn && yColumn.type !== 'numeric') {
      errors.push('Pie chart requires a numeric column for values');
    }
  } else if (config.type === 'scatter') {
    if (xColumn && xColumn.type !== 'numeric') {
      errors.push('Scatter plot requires numeric columns for both axes');
    }
    if (yColumn && yColumn.type !== 'numeric') {
      errors.push('Scatter plot requires numeric columns for both axes');
    }
  } else {
    // For bar, line, doughnut, polarArea, radar, bubble charts
    if (xColumn && xColumn.type !== 'categorical' && xColumn.type !== 'date') {
      errors.push(`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} chart requires a categorical or date column for X-axis`);
    }
    if (yColumn && yColumn.type !== 'numeric') {
      errors.push(`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} chart requires a numeric column for Y-axis`);
    }
  }

  // Check if both axes are the same
  if (config.xAxis && config.yAxis && config.xAxis === config.yAxis) {
    errors.push('X-axis and Y-axis cannot be the same column');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
