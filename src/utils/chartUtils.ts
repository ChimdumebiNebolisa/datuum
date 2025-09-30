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

  let xAxisColumn = '';
  let yAxisColumn = '';

  if (chartType === 'pie') {
    // For pie charts, use categorical for labels and numeric for values
    xAxisColumn = categoricalColumns[0]?.name || '';
    yAxisColumn = numericColumns[0]?.name || '';
  } else if (chartType === 'scatter') {
    // For scatter plots, use two numeric columns
    xAxisColumn = numericColumns[0]?.name || '';
    yAxisColumn = numericColumns[1]?.name || numericColumns[0]?.name || '';
  } else {
    // For bar, line, doughnut, polarArea, radar, bubble charts
    xAxisColumn = categoricalColumns[0]?.name || '';
    yAxisColumn = numericColumns[0]?.name || '';
  }

  // Create default axes configuration
  const xAxes: AxisConfig[] = xAxisColumn ? [{
    id: 'x1',
    label: xAxisColumn,
    column: xAxisColumn,
    position: 'bottom',
    type: (categoricalColumns.find(c => c.name === xAxisColumn)?.type === 'date') ? 'time' : 'category',
    display: true,
    grid: { display: true },
    ticks: { color: '#666' }
  }] : [];

  const yAxes: AxisConfig[] = yAxisColumn ? [{
    id: 'y1',
    label: yAxisColumn,
    column: yAxisColumn,
    position: 'left',
    type: 'linear',
    display: true,
    grid: { display: true },
    ticks: { color: '#666' }
  }] : [];

  // Create default dataset configuration
  const datasets: DatasetConfig[] = yAxisColumn ? [{
    label: yAxisColumn,
    column: yAxisColumn,
    yAxisID: 'y1',
    xAxisID: 'x1',
    color: DEFAULT_COLORS[0],
    type: chartType === 'line' ? 'line' : chartType === 'scatter' ? 'scatter' : 'bar',
    fill: false,
    tension: 0.1
  }] : [];

  return {
    type: chartType,
    title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
    xAxes,
    yAxes,
    datasets,
    colors: [...DEFAULT_COLORS],
    // Legacy support
    xAxis: xAxisColumn,
    yAxis: yAxisColumn,
  };
}

export function getChartData(
  data: DataPoint[],
  config: ChartConfig
): { labels: string[]; datasets: unknown[] } {
  // Handle legacy config format
  if (config.xAxis && config.yAxis && config.xAxes.length === 0 && config.yAxes.length === 0) {
    return getLegacyChartData(data, config);
  }

  // Multi-axis configuration
  const primaryXAxis = config.xAxes.find(axis => axis.display) || config.xAxes[0];
  const primaryYAxis = config.yAxes.find(axis => axis.display) || config.yAxes[0];

  if (!primaryXAxis || !primaryYAxis) {
    return { labels: [], datasets: [] };
  }

  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    // Group data by primary X axis and sum Y axis values
    const groupedData = data.reduce((acc, row) => {
      const label = String(row[primaryXAxis.column] || '');
      const value = Number(row[primaryYAxis.column] || 0);
      const currentValue = typeof acc[label] === 'number' ? acc[label] : 0;
      acc[label] = currentValue + (isNaN(value) ? 0 : value);
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(groupedData),
      datasets: [
        {
          data: Object.values(groupedData),
          backgroundColor: config.colors.slice(0, Object.keys(groupedData).length),
        },
      ],
    };
  }

  if (config.type === 'scatter') {
    const datasets = config.datasets.map((dataset, index) => {
      const yAxis = config.yAxes.find(axis => axis.id === dataset.yAxisID);
      const xAxis = config.xAxes.find(axis => axis.id === dataset.xAxisID);
      
      if (!yAxis || !xAxis) return null;

      return {
        label: dataset.label,
        data: data.map((row) => ({
          x: Number(row[xAxis.column] || 0),
          y: Number(row[yAxis.column] || 0),
        })),
        backgroundColor: dataset.color,
        borderColor: dataset.color,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: dataset.yAxisID,
        xAxisID: dataset.xAxisID,
      };
    }).filter(Boolean);

    return {
      labels: [],
      datasets,
    };
  }

  if (config.type === 'bubble') {
    const datasets = config.datasets.map((dataset) => {
      const yAxis = config.yAxes.find(axis => axis.id === dataset.yAxisID);
      const xAxis = config.xAxes.find(axis => axis.id === dataset.xAxisID);
      
      if (!yAxis || !xAxis) return null;

      return {
        label: dataset.label,
        data: data.map((row) => ({
          x: Number(row[xAxis.column] || 0),
          y: Number(row[yAxis.column] || 0),
          r: 10, // Default radius for bubble
        })),
        backgroundColor: dataset.color,
        borderColor: dataset.color,
        yAxisID: dataset.yAxisID,
        xAxisID: dataset.xAxisID,
      };
    }).filter(Boolean);

    return {
      labels: [],
      datasets,
    };
  }

  if (config.type === 'radar') {
    // For radar charts, we need to group by categories and show multiple datasets
    const categories = [...new Set(data.map(row => String(row[primaryXAxis.column] || '')))];
    const datasets = config.datasets.map((dataset) => {
      const yAxis = config.yAxes.find(axis => axis.id === dataset.yAxisID);
      if (!yAxis) return null;

      return {
        label: dataset.label,
        data: categories.map(category => {
          const categoryData = data.filter(row => String(row[primaryXAxis.column] || '') === category);
          return categoryData.reduce((sum, row) => sum + Number(row[yAxis.column] || 0), 0);
        }),
        backgroundColor: dataset.color + '20',
        borderColor: dataset.color,
        pointBackgroundColor: dataset.color,
      };
    }).filter(Boolean);

    return {
      labels: categories,
      datasets,
    };
  }

  // For bar and line charts with multi-axis support
  const labels = [...new Set(data.map(row => String(row[primaryXAxis.column] || '')))];
  
  const datasets = config.datasets.map((dataset) => {
    const yAxis = config.yAxes.find(axis => axis.id === dataset.yAxisID);
    const xAxis = config.xAxes.find(axis => axis.id === dataset.xAxisID);
    
    if (!yAxis || !xAxis) return null;

    // Group data by X axis and sum Y axis values
    const groupedData = data.reduce((acc, row) => {
      const label = String(row[xAxis.column] || '');
      const value = Number(row[yAxis.column] || 0);
      const currentValue = typeof acc[label] === 'number' ? acc[label] : 0;
      acc[label] = currentValue + (isNaN(value) ? 0 : value);
      return acc;
    }, {} as Record<string, number>);

    return {
      label: dataset.label,
      data: labels.map(label => groupedData[label] || 0),
      backgroundColor: dataset.type === 'line' ? 'transparent' : dataset.color,
      borderColor: dataset.color,
      borderWidth: dataset.type === 'line' ? 2 : 1,
      fill: dataset.fill || false,
      tension: dataset.tension || 0.1,
      yAxisID: dataset.yAxisID,
      xAxisID: dataset.xAxisID,
    };
  }).filter(Boolean);

  return {
    labels,
    datasets,
  };
}

// Legacy support function
function getLegacyChartData(
  data: DataPoint[],
  config: ChartConfig
): { labels: string[]; datasets: unknown[] } {
  const { xAxis, yAxis, colors } = config;

  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    // Group data by xAxis and sum yAxis values
    const groupedData = data.reduce((acc, row) => {
      const label = String(row[xAxis!] || '');
      const value = Number(row[yAxis!] || 0);
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
            x: Number(row[xAxis!] || 0),
            y: Number(row[yAxis!] || 0),
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
    const label = String(row[xAxis!] || '');
    const value = Number(row[yAxis!] || 0);
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

// Multi-axis utility functions
export function addYAxis(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const columnInfo = columns.find(col => col.name === column);
  if (!columnInfo || columnInfo.type !== 'numeric') {
    return config;
  }

  const newYAxisId = `y${config.yAxes.length + 1}`;
  const newYAxis: AxisConfig = {
    id: newYAxisId,
    label: column,
    column,
    position: config.yAxes.length % 2 === 0 ? 'left' : 'right',
    type: 'linear',
    display: true,
    grid: { display: true },
    ticks: { color: '#666' }
  };

  return {
    ...config,
    yAxes: [...config.yAxes, newYAxis]
  };
}

export function addXAxis(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const columnInfo = columns.find(col => col.name === column);
  if (!columnInfo || (columnInfo.type !== 'categorical' && columnInfo.type !== 'date')) {
    return config;
  }

  const newXAxisId = `x${config.xAxes.length + 1}`;
  const newXAxis: AxisConfig = {
    id: newXAxisId,
    label: column,
    column,
    position: config.xAxes.length % 2 === 0 ? 'bottom' : 'top',
    type: columnInfo.type === 'date' ? 'time' : 'category',
    display: true,
    grid: { display: true },
    ticks: { color: '#666' }
  };

  return {
    ...config,
    xAxes: [...config.xAxes, newXAxis]
  };
}

export function removeAxis(config: ChartConfig, axisId: string): ChartConfig {
  const isXAxis = config.xAxes.some(axis => axis.id === axisId);
  const isYAxis = config.yAxes.some(axis => axis.id === axisId);

  let newConfig = { ...config };

  if (isXAxis) {
    newConfig.xAxes = config.xAxes.filter(axis => axis.id !== axisId);
    // Remove datasets that reference this axis
    newConfig.datasets = config.datasets.filter(dataset => dataset.xAxisID !== axisId);
  }

  if (isYAxis) {
    newConfig.yAxes = config.yAxes.filter(axis => axis.id !== axisId);
    // Remove datasets that reference this axis
    newConfig.datasets = config.datasets.filter(dataset => dataset.yAxisID !== axisId);
  }

  return newConfig;
}

export function addDataset(config: ChartConfig, column: string, columns: ColumnInfo[]): ChartConfig {
  const columnInfo = columns.find(col => col.name === column);
  if (!columnInfo || columnInfo.type !== 'numeric') {
    return config;
  }

  const availableYAxis = config.yAxes.find(axis => axis.display);
  const availableXAxis = config.xAxes.find(axis => axis.display);

  if (!availableYAxis || !availableXAxis) {
    return config;
  }

  const newDataset: DatasetConfig = {
    label: column,
    column,
    yAxisID: availableYAxis.id,
    xAxisID: availableXAxis.id,
    color: config.colors[config.datasets.length % config.colors.length],
    type: config.type === 'line' ? 'line' : config.type === 'scatter' ? 'scatter' : 'bar',
    fill: false,
    tension: 0.1
  };

  return {
    ...config,
    datasets: [...config.datasets, newDataset]
  };
}

export function removeDataset(config: ChartConfig, index: number): ChartConfig {
  const newDatasets = config.datasets.filter((_, i) => i !== index);
  return {
    ...config,
    datasets: newDatasets
  };
}

export function validateChartConfig(
  config: ChartConfig,
  columns: ColumnInfo[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Legacy validation
  if (config.xAxis && config.yAxis && config.xAxes.length === 0 && config.yAxes.length === 0) {
    return validateLegacyChartConfig(config, columns);
  }

  // Multi-axis validation
  if (config.xAxes.length === 0) {
    errors.push('At least one X-axis is required');
  }

  if (config.yAxes.length === 0) {
    errors.push('At least one Y-axis is required');
  }

  if (config.datasets.length === 0) {
    errors.push('At least one dataset is required');
  }

  // Validate each axis
  config.xAxes.forEach((axis, index) => {
    const column = columns.find(col => col.name === axis.column);
    if (!column) {
      errors.push(`X-axis ${index + 1}: Column "${axis.column}" not found`);
      return;
    }

    if (config.type === 'pie') {
      if (column.type !== 'categorical' && column.type !== 'date') {
        errors.push(`X-axis ${index + 1}: Pie chart requires categorical or date column`);
      }
    } else if (config.type === 'scatter') {
      if (column.type !== 'numeric') {
        errors.push(`X-axis ${index + 1}: Scatter plot requires numeric column`);
      }
    } else {
      if (column.type !== 'categorical' && column.type !== 'date') {
        errors.push(`X-axis ${index + 1}: ${config.type} chart requires categorical or date column`);
      }
    }
  });

  config.yAxes.forEach((axis, index) => {
    const column = columns.find(col => col.name === axis.column);
    if (!column) {
      errors.push(`Y-axis ${index + 1}: Column "${axis.column}" not found`);
      return;
    }

    if (column.type !== 'numeric') {
      errors.push(`Y-axis ${index + 1}: Y-axis requires numeric column`);
    }
  });

  // Validate datasets
  config.datasets.forEach((dataset, index) => {
    const column = columns.find(col => col.name === dataset.column);
    if (!column) {
      errors.push(`Dataset ${index + 1}: Column "${dataset.column}" not found`);
      return;
    }

    if (column.type !== 'numeric') {
      errors.push(`Dataset ${index + 1}: Dataset requires numeric column`);
    }

    const yAxis = config.yAxes.find(axis => axis.id === dataset.yAxisID);
    const xAxis = config.xAxes.find(axis => axis.id === dataset.xAxisID);

    if (!yAxis) {
      errors.push(`Dataset ${index + 1}: Y-axis "${dataset.yAxisID}" not found`);
    }

    if (!xAxis) {
      errors.push(`Dataset ${index + 1}: X-axis "${dataset.xAxisID}" not found`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateLegacyChartConfig(
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
