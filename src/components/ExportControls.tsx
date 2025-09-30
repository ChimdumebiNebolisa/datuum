'use client';

import React from 'react';
import { ExportOptions } from '@/types';
import { exportChart, generateFilename } from '@/utils/exportUtils';

interface ExportControlsProps {
  chartType: string;
  chartTitle?: string;
}

export default function ExportControls({ chartType }: ExportControlsProps) {
  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    // Find the chart canvas in the document
    const chartElement = document.querySelector('canvas');
    if (!chartElement) {
      alert('Chart canvas not found. Please ensure the chart is rendered.');
      return;
    }

    try {
      const filename = generateFilename(chartType, new Date());
      const options: ExportOptions = {
        format,
        filename,
        quality: format === 'png' ? 0.9 : undefined,
      };

      await exportChart(chartElement, options);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export chart as ${format.toUpperCase()}. Please try again.`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Export Chart</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleExport('png')}
          className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <span className="mr-2">📷</span>
          PNG
        </button>
        
        <button
          onClick={() => handleExport('svg')}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <span className="mr-2">🎨</span>
          SVG
        </button>
        
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <span className="mr-2">📄</span>
          PDF
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>• PNG: High quality image, good for presentations</p>
        <p>• SVG: Vector format, scalable without quality loss</p>
        <p>• PDF: Print-ready format, includes chart title</p>
      </div>
    </div>
  );
}
