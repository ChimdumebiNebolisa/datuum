'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  DoughnutController,
  PolarAreaController,
  RadarController,
  ScatterController,
  BubbleController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartConfig, ParsedData, AxisConfig } from '@/types';
import { getChartData, validateChartConfig } from '@/utils/chartUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  DoughnutController,
  PolarAreaController,
  RadarController,
  ScatterController,
  BubbleController,
  Title,
  Tooltip,
  Legend
);

interface ChartRendererProps {
  data: ParsedData;
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
}

function buildScalesConfig(config: ChartConfig) {
  // Handle legacy configuration
  if (config.xAxis && config.yAxis && config.xAxes.length === 0 && config.yAxes.length === 0) {
    return buildLegacyScalesConfig(config);
  }

  // Handle pie, doughnut, polarArea charts (no scales)
  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    return undefined;
  }

  const scales: any = {};

  // Build X axes
  config.xAxes.forEach((axis) => {
    if (!axis.display) return;

    scales[axis.id] = {
      type: axis.type,
      position: axis.position,
      display: axis.display,
      title: {
        display: true,
        text: axis.label,
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        display: axis.grid?.display ?? true,
        color: axis.grid?.color ?? '#e5e7eb',
      },
      ticks: {
        color: axis.ticks?.color ?? '#666',
        font: {
          size: axis.ticks?.font?.size ?? 10,
        },
      },
    };

    // Set beginAtZero for linear scales
    if (axis.type === 'linear') {
      scales[axis.id].beginAtZero = true;
    }
  });

  // Build Y axes
  config.yAxes.forEach((axis) => {
    if (!axis.display) return;

    scales[axis.id] = {
      type: axis.type,
      position: axis.position,
      display: axis.display,
      title: {
        display: true,
        text: axis.label,
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        display: axis.grid?.display ?? true,
        color: axis.grid?.color ?? '#e5e7eb',
      },
      ticks: {
        color: axis.ticks?.color ?? '#666',
        font: {
          size: axis.ticks?.font?.size ?? 10,
        },
      },
      beginAtZero: axis.type === 'linear',
    };
  });

  return scales;
}

function buildLegacyScalesConfig(config: ChartConfig) {
  // Handle pie, doughnut, polarArea charts (no scales)
  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    return undefined;
  }

  if (config.type === 'scatter') {
    return {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: config.xAxis,
        },
      },
      y: {
        title: {
          display: true,
          text: config.yAxis,
        },
      },
    };
  }

  return {
    x: {
      title: {
        display: true,
        text: config.xAxis,
      },
    },
    y: {
      title: {
        display: true,
        text: config.yAxis,
      },
      beginAtZero: true,
    },
  };
}

export default function ChartRenderer({ data, config }: ChartRendererProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.data.length) return;

    const validation = validateChartConfig(config, data.columns);
    if (!validation.isValid) {
      console.error('Invalid chart configuration:', validation.errors);
      return;
    }

    const chartData = getChartData(data.data, config);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    const chartType = config.type === 'pie' ? 'pie' : 
                     config.type === 'doughnut' ? 'doughnut' :
                     config.type === 'polarArea' ? 'polarArea' :
                     config.type === 'radar' ? 'radar' :
                     config.type === 'bubble' ? 'bubble' :
                     config.type === 'scatter' ? 'scatter' : config.type;
    
    // Build scales configuration for multi-axis support
    const scales = buildScalesConfig(config);
    
    chartInstanceRef.current = new ChartJS(ctx, {
      type: chartType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: chartData as any,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: config.title,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: config.type !== 'scatter',
            position: 'top' as const,
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          },
        },
        scales,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, config]);

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="h-96 w-full">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
