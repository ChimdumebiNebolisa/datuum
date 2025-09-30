'use client';

import { useState, useEffect } from 'react';
import { ParsedData, ChartConfig } from '@/types';
import { createDefaultChartConfig } from '@/utils/chartUtils';
import DataTable from '@/components/DataTable';
import ChartRenderer from '@/components/ChartRenderer';
import ChartControls from '@/components/ChartControls';
import ExportControls from '@/components/ExportControls';

interface SampleDataViewerProps {
  onBackToLanding: () => void;
}

export default function SampleDataViewer({ onBackToLanding }: SampleDataViewerProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'chart'>('data');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sample data
    const sampleData: ParsedData = {
      data: [
        { Month: 'January', Sales: 12000, Profit: 3000, Region: 'North' },
        { Month: 'February', Sales: 15000, Profit: 4000, Region: 'North' },
        { Month: 'March', Sales: 18000, Profit: 5000, Region: 'North' },
        { Month: 'April', Sales: 16000, Profit: 4200, Region: 'South' },
        { Month: 'May', Sales: 20000, Profit: 5500, Region: 'South' },
        { Month: 'June', Sales: 22000, Profit: 6000, Region: 'South' },
        { Month: 'July', Sales: 19000, Profit: 4800, Region: 'East' },
        { Month: 'August', Sales: 21000, Profit: 5200, Region: 'East' },
        { Month: 'September', Sales: 23000, Profit: 6500, Region: 'East' },
        { Month: 'October', Sales: 25000, Profit: 7000, Region: 'West' },
        { Month: 'November', Sales: 24000, Profit: 6800, Region: 'West' },
        { Month: 'December', Sales: 28000, Profit: 8000, Region: 'West' }
      ],
      columns: [
        { name: 'Month', type: 'categorical' as const, index: 0 },
        { name: 'Sales', type: 'numeric' as const, index: 1 },
        { name: 'Profit', type: 'numeric' as const, index: 2 },
        { name: 'Region', type: 'categorical' as const, index: 3 }
      ],
      headers: ['Month', 'Sales', 'Profit', 'Region']
    };

    // Simulate loading
    const timer = setTimeout(() => {
      setParsedData(sampleData);
      const defaultConfig = createDefaultChartConfig(sampleData.data, sampleData.columns, 'bar');
      setChartConfig(defaultConfig);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDataChange = (data: ParsedData) => {
    setParsedData(data);
    if (chartConfig) {
      const updatedConfig = createDefaultChartConfig(data.data, data.columns, chartConfig.type);
      setChartConfig(updatedConfig);
    }
  };

  const handleConfigChange = (config: ChartConfig) => {
    setChartConfig(config);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sample data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToLanding}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>←</span>
                <span>Back to Home</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow shadow-lg hover-glow transition-all duration-300">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 ">Sample Data - Datuum</h1>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Sample Data
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">📈 Sample Sales Data</h2>
          <p className="text-blue-700">
            This is sample data showing monthly sales, profit, and regional distribution. 
            You can explore different chart types, customize the visualization, and export your charts.
          </p>
        </div>

        {parsedData && (
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'data'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Data Table
                </button>
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'chart'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Chart
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'data' && (
              <DataTable data={parsedData} onDataChange={handleDataChange} />
            )}

            {activeTab === 'chart' && chartConfig && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Controls */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <ChartControls
                      data={parsedData}
                      config={chartConfig}
                      onConfigChange={handleConfigChange}
                    />
                  </div>
                </div>

                {/* Chart and Export */}
                <div className="lg:col-span-2 space-y-6">
                  <ChartRenderer
                    data={parsedData}
                    config={chartConfig}
                    onConfigChange={handleConfigChange}
                  />
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <ExportControls
                      chartType={chartConfig.type}
                      chartTitle={chartConfig.title}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Built with Next.js, Chart.js, and Tailwind CSS</p>
            <p className="mt-1">No backend required - everything runs in your browser</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
