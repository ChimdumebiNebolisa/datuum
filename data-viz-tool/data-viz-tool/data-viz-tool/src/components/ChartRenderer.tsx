'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartConfig, ParsedData } from '@/types';
import { getChartData, validateChartConfig } from '@/utils/chartUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartRendererProps {
  data: ParsedData;
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
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
    chartInstanceRef.current = new ChartJS(ctx, {
      type: config.type === 'pie' ? 'pie' : config.type === 'scatter' ? 'scatter' : config.type,
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
        scales: config.type === 'scatter' ? {
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
        } : config.type !== 'pie' ? {
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
        } : undefined,
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
