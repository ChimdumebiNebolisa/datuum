'use client';

import { ExportOptions } from '@/types';
import { exportChart, generateFilename } from '@/utils/exportUtils';

interface ExportControlsProps {
  chartType: string;
  chartTitle?: string;
  sourceInfo?: string; // filename [+ sheet name] shown in PDF report
}

export default function ExportControls({ chartType, chartTitle, sourceInfo }: ExportControlsProps) {
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('No chart found. Make sure the chart is visible before exporting.');
      return;
    }

    try {
      const filename = generateFilename(chartType, new Date());
      const options: ExportOptions = { format, filename, quality: format === 'png' ? 0.95 : undefined };
      await exportChart(canvas, options);
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export as ${format.toUpperCase()} failed. Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Export</h3>
        {sourceInfo && (
          <span className="text-xs text-gray-400 font-mono truncate max-w-48" title={sourceInfo}>{sourceInfo}</span>
        )}
      </div>

      <div className="flex gap-2">
        {(['png', 'svg', 'pdf'] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleExport(fmt)}
            className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wide"
          >
            {fmt}
          </button>
        ))}
      </div>

      {chartTitle && (
        <p className="text-xs text-gray-400 mt-2 text-center truncate" title={chartTitle}>
          &ldquo;{chartTitle}&rdquo;
        </p>
      )}
    </div>
  );
}
