'use client';

import { useState, useEffect } from 'react';
import { ParsedData, ChartConfig } from '@/types';
import { createDefaultChartConfig } from '@/utils/chartUtils';
import DataTable from '@/components/table/DataTable';
import ChartRenderer from '@/components/chart/ChartRenderer';
import ChartControls from '@/components/chart/controls/ChartControls';
import ExportControls from '@/components/export/ExportControls';

interface SampleDataViewerProps {
  onBackToLanding: () => void;
}

export default function SampleDataViewer({ onBackToLanding }: SampleDataViewerProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'chart'>('data');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sampleData: ParsedData = {
      data: [
        { Month: 'January',   Sales: 12000, Profit: 3000, Region: 'North' },
        { Month: 'February',  Sales: 15000, Profit: 4000, Region: 'North' },
        { Month: 'March',     Sales: 18000, Profit: 5000, Region: 'North' },
        { Month: 'April',     Sales: 16000, Profit: 4200, Region: 'South' },
        { Month: 'May',       Sales: 20000, Profit: 5500, Region: 'South' },
        { Month: 'June',      Sales: 22000, Profit: 6000, Region: 'South' },
        { Month: 'July',      Sales: 19000, Profit: 4800, Region: 'East' },
        { Month: 'August',    Sales: 21000, Profit: 5200, Region: 'East' },
        { Month: 'September', Sales: 23000, Profit: 6500, Region: 'East' },
        { Month: 'October',   Sales: 25000, Profit: 7000, Region: 'West' },
        { Month: 'November',  Sales: 24000, Profit: 6800, Region: 'West' },
        { Month: 'December',  Sales: 28000, Profit: 8000, Region: 'West' },
      ],
      columns: [
        { name: 'Month',  type: 'categorical', role: 'x-axis',   index: 0 },
        { name: 'Sales',  type: 'numeric',     role: 'y-series', index: 1 },
        { name: 'Profit', type: 'numeric',     role: 'y-series', index: 2 },
        { name: 'Region', type: 'categorical', role: 'ignore',   index: 3 },
      ],
      headers: ['Month', 'Sales', 'Profit', 'Region'],
    };

    const timer = setTimeout(() => {
      setParsedData(sampleData);
      setChartConfig(createDefaultChartConfig(sampleData.data, sampleData.columns, 'bar'));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleConfigChange = (config: ChartConfig) => setChartConfig(config);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading sample data…</p>
        </div>
      </div>
    );
  }

  if (!parsedData || !chartConfig) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={onBackToLanding} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              ← Home
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-800">Sample Data — Monthly Sales</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-0">
            {(['data', 'chart'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'data' ? 'Data Table' : 'Chart'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'data' && (
          <DataTable data={parsedData} onDataChange={setParsedData} />
        )}

        {activeTab === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <ChartControls
                  data={parsedData}
                  config={chartConfig}
                  onConfigChange={handleConfigChange}
                />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <ChartRenderer data={parsedData} config={chartConfig} />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <ExportControls chartType={chartConfig.type} chartTitle={chartConfig.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
