'use client';

import { useState } from 'react';
import { ParsedData, ChartConfig } from '@/types';
import { createDefaultChartConfig } from '@/utils/chartUtils';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import ChartRenderer from '@/components/ChartRenderer';
import ChartControls from '@/components/ChartControls';
import ExportControls from '@/components/ExportControls';

interface DataVisualizationAppProps {
  onBackToLanding: () => void;
}

export default function DataVisualizationApp({ onBackToLanding }: DataVisualizationAppProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'data' | 'chart'>('upload');

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data);
    setError(null);
    
    // Create default chart configuration
    const defaultConfig = createDefaultChartConfig(data.data, data.columns, 'bar');
    setChartConfig(defaultConfig);
    
    setActiveTab('data');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setParsedData(null);
    setChartConfig(null);
  };

  const handleDataChange = (data: ParsedData) => {
    setParsedData(data);
    // Update chart config if it exists
    if (chartConfig) {
      const updatedConfig = createDefaultChartConfig(data.data, data.columns, chartConfig.type);
      setChartConfig(updatedConfig);
    }
  };

  const handleConfigChange = (config: ChartConfig) => {
    setChartConfig(config);
  };

  const resetApp = () => {
    setParsedData(null);
    setChartConfig(null);
    setError(null);
    setActiveTab('upload');
  };

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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Data Visualization Tool</h1>
              </div>
            </div>
            {parsedData && (
              <button
                onClick={resetApp}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!parsedData ? (
          // Upload Section
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Beautiful Charts from Your Data
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload a CSV file or enter data manually to generate interactive charts instantly. 
                No backend required - everything runs in your browser.
              </p>
            </div>
            <FileUpload onDataParsed={handleDataParsed} onError={handleError} />
          </div>
        ) : (
          // Data and Chart Section
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
