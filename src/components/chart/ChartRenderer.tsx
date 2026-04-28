'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
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
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ChartConfig, ParsedData } from '@/types';
import { getChartData, applyFilters, validateChartConfig } from '@/utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement, BarController,
  LineElement, LineController,
  PointElement,
  ArcElement,
  PieController, DoughnutController, PolarAreaController, RadarController,
  ScatterController, BubbleController,
  Title, Tooltip, Legend,
  Filler, // required for fill: '-1' reference bands
);

interface ChartRendererProps {
  data: ParsedData;
  config: ChartConfig;
}

function buildAxisTitle(label: string, unit?: string): string {
  return unit ? `${label} (${unit})` : label;
}

// Chart.js scale types are deeply generic; use a loose type here to avoid
// assignment errors at the chart constructor call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScaleConfig = Record<string, any>;

function buildScales(config: ChartConfig): ScaleConfig | undefined {
  if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
    return undefined;
  }

  const scales: ScaleConfig = {};

  for (const axis of config.xAxes) {
    if (!axis.display) continue;
    scales[axis.id] = {
      type: axis.type,
      position: axis.position,
      display: true,
      title: {
        display: true,
        text: buildAxisTitle(axis.label, axis.unit),
        font: { size: 11, weight: 'bold' },
        color: '#6B7280',
      },
      grid: { display: axis.grid?.display ?? true, color: axis.grid?.color ?? '#F3F4F6' },
      ticks: { color: axis.ticks?.color ?? '#9CA3AF', font: { size: axis.ticks?.font?.size ?? 10 } },
      // For time scales, let Chart.js auto-format ticks
      ...(axis.type === 'time' ? { time: { tooltipFormat: 'yyyy-MM-dd', displayFormats: { day: 'MMM d, yyyy', month: 'MMM yyyy' } } } : {}),
    };
  }

  for (const axis of config.yAxes) {
    if (!axis.display) continue;
    scales[axis.id] = {
      type: axis.type,
      position: axis.position,
      display: true,
      title: {
        display: true,
        text: buildAxisTitle(axis.label, axis.unit),
        font: { size: 11, weight: 'bold' },
        color: '#6B7280',
      },
      grid: { display: axis.grid?.display ?? true, color: axis.grid?.color ?? '#F3F4F6' },
      ticks: { color: axis.ticks?.color ?? '#9CA3AF', font: { size: axis.ticks?.font?.size ?? 10 } },
      beginAtZero: false,
    };
  }

  return scales;
}

export default function ChartRenderer({ data, config }: ChartRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.data.length) return;

    const validation = validateChartConfig(config, data.columns);
    if (!validation.isValid) return;

    // Apply active filters before rendering
    const filteredData = applyFilters(data.data, config.filters);
    const chartData = getChartData(filteredData, config);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // Build tooltip callbacks that include unit labels
    const yUnitMap: Record<string, string | undefined> = {};
    for (const axis of config.yAxes) {
      if (axis.unit) yUnitMap[axis.id] = axis.unit;
    }

    chartRef.current = new ChartJS(ctx, {
      type: config.type,
      // Chart.js expects a generic data shape; our union type is correct but not assignable without cast
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: chartData as any,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!config.title,
            text: config.title,
            font: { size: 15, weight: 'bold' },
            color: '#1F2937',
            padding: { bottom: 16 },
          },
          legend: {
            display: config.type !== 'scatter',
            position: 'top',
            labels: {
              font: { size: 11 },
              color: '#374151',
              // Hide reference band entries from legend
              filter: (item) => {
                const ds = (chartData.datasets as Array<{ _isReferenceBand?: boolean }>)[item.datasetIndex ?? 0];
                return !ds?._isReferenceBand;
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              // Append unit to tooltip values when available
              label: (ctx) => {
                const ds = ctx.dataset as { _isReferenceBand?: boolean; label?: string };
                if (ds._isReferenceBand) return; // hide band entries from tooltip
                const yAxisId = (ctx.dataset as { yAxisID?: string }).yAxisID;
                const unit = yAxisId ? yUnitMap[yAxisId] : undefined;
                const val = ctx.parsed.y ?? ctx.parsed;
                return ` ${ds.label}: ${typeof val === 'number' ? val.toFixed(2) : val}${unit ? ' ' + unit : ''}`;
              },
            },
          },
        },
        scales: buildScales(config),
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, config]);

  const validation = validateChartConfig(config, data.columns);

  if (!validation.isValid) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-2">Chart not ready</p>
        <ul className="text-xs text-gray-400 space-y-1">
          {validation.errors.map((e, i) => <li key={i}>• {e}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="h-96">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
