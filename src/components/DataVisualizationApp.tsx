'use client';

import { useReducer } from 'react';
import { ParsedData, ChartConfig, ColumnInfo } from '@/types';
import { createDefaultChartConfig } from '@/utils/chartUtils';
import FileUpload from '@/components/upload/FileUpload';
import DataTable from '@/components/table/DataTable';
import ColumnMapper from '@/components/mapping/ColumnMapper';
import ChartRenderer from '@/components/chart/ChartRenderer';
import ChartControls from '@/components/chart/controls/ChartControls';
import ExportControls from '@/components/export/ExportControls';
import ErrorWithSuggestions from '@/components/ui/ErrorWithSuggestions';

// ─── State ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'preview' | 'map' | 'chart';

interface AppState {
  step: Step;
  parsedData: ParsedData | null;
  mappedColumns: ColumnInfo[] | null;
  chartConfig: ChartConfig | null;
  error: string | null;
}

type AppAction =
  | { type: 'FILE_PARSED'; payload: ParsedData }
  | { type: 'COLUMNS_MAPPED'; payload: { columns: ColumnInfo[]; config: ChartConfig } }
  | { type: 'CHART_CONFIG_CHANGED'; payload: ChartConfig }
  | { type: 'DATA_CHANGED'; payload: ParsedData }
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'FILE_PARSED':
      return {
        ...state,
        parsedData: action.payload,
        mappedColumns: action.payload.columns,
        chartConfig: null,
        error: null,
        step: 'preview',
      };
    case 'COLUMNS_MAPPED':
      return {
        ...state,
        mappedColumns: action.payload.columns,
        chartConfig: action.payload.config,
        step: 'chart',
      };
    case 'CHART_CONFIG_CHANGED':
      return { ...state, chartConfig: action.payload };
    case 'DATA_CHANGED':
      return { ...state, parsedData: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'ERROR':
      return { ...state, error: action.payload, step: 'upload' };
    case 'RESET':
      return { step: 'upload', parsedData: null, mappedColumns: null, chartConfig: null, error: null };
    default:
      return state;
  }
}

const INITIAL_STATE: AppState = {
  step: 'upload',
  parsedData: null,
  mappedColumns: null,
  chartConfig: null,
  error: null,
};

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: 'preview', label: 'Preview' },
  { key: 'map', label: 'Map Columns' },
  { key: 'chart', label: 'Chart' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface DataVisualizationAppProps {
  onBackToLanding: () => void;
}

export default function DataVisualizationApp({ onBackToLanding }: DataVisualizationAppProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { step, parsedData, mappedColumns, chartConfig, error } = state;

  const handleDataParsed = (data: ParsedData) => {
    dispatch({ type: 'FILE_PARSED', payload: data });
  };

  const handleBuildChart = () => {
    if (!parsedData || !mappedColumns) return;
    const dataWithRoles = { ...parsedData, columns: mappedColumns };
    const config = createDefaultChartConfig(dataWithRoles.data, mappedColumns, 'line');
    dispatch({ type: 'COLUMNS_MAPPED', payload: { columns: mappedColumns, config } });
  };

  const handleColumnMappingChange = (cols: ColumnInfo[]) => {
    dispatch({ type: 'DATA_CHANGED', payload: { ...parsedData!, columns: cols } });
  };

  const handleConfigChange = (config: ChartConfig) => {
    dispatch({ type: 'CHART_CONFIG_CHANGED', payload: config });
  };

  const canGoToStep = (target: Step): boolean => {
    if (target === 'preview') return !!parsedData;
    if (target === 'map') return !!parsedData;
    if (target === 'chart') return !!chartConfig;
    return false;
  };

  // Effective data for chart/table (uses mapped columns)
  const effectiveData = parsedData && mappedColumns
    ? { ...parsedData, columns: mappedColumns }
    : parsedData;

  const sourceLabel = parsedData?.source
    ? `${parsedData.source.filename}${parsedData.source.sheetName ? ` › ${parsedData.source.sheetName}` : ''}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToLanding}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
              >
                ← Home
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <span className="text-sm font-semibold text-gray-800">Datuum</span>
              {sourceLabel && (
                <>
                  <div className="w-px h-5 bg-gray-200" />
                  <span className="text-xs text-gray-500 font-mono truncate max-w-48" title={sourceLabel}>
                    {sourceLabel}
                  </span>
                </>
              )}
            </div>
            {parsedData && (
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step navigation (only when file loaded) */}
      {parsedData && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-0">
              {STEPS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => canGoToStep(key) && dispatch({ type: 'SET_STEP', payload: key })}
                  disabled={!canGoToStep(key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    step === key
                      ? 'border-blue-500 text-blue-600'
                      : canGoToStep(key)
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorWithSuggestions error={error} onRetry={() => dispatch({ type: 'RESET' })} />
        )}

        {/* Upload step */}
        {step === 'upload' && (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload a spreadsheet
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                CSV or Excel files. No AI, no backend — everything runs in your browser.
              </p>
            </div>
            <FileUpload
              onDataParsed={handleDataParsed}
              onError={(e) => dispatch({ type: 'ERROR', payload: e })}
            />
            <p className="mt-6 text-xs text-gray-400 italic">
              This tool visualizes uploaded data and does not provide medical advice.
            </p>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && effectiveData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Data Preview</h3>
                <p className="text-sm text-gray-500">
                  {effectiveData.data.length} rows · {effectiveData.headers.length} columns
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'map' })}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Map Columns →
              </button>
            </div>
            <DataTable data={effectiveData} onDataChange={(d) => dispatch({ type: 'DATA_CHANGED', payload: d })} />
          </div>
        )}

        {/* Map step */}
        {step === 'map' && effectiveData && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <ColumnMapper
              columns={mappedColumns || effectiveData.columns}
              sampleData={effectiveData.data.slice(0, 5)}
              onChange={handleColumnMappingChange}
              onBuildChart={handleBuildChart}
            />
          </div>
        )}

        {/* Chart step */}
        {step === 'chart' && effectiveData && chartConfig && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
                <ChartControls
                  data={effectiveData}
                  config={chartConfig}
                  onConfigChange={handleConfigChange}
                />
              </div>
            </div>

            {/* Chart + export */}
            <div className="lg:col-span-2 space-y-4">
              <ChartRenderer data={effectiveData} config={chartConfig} />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <ExportControls chartType={chartConfig.type} chartTitle={chartConfig.title} sourceInfo={sourceLabel ?? undefined} />
              </div>
              <p className="text-xs text-gray-400 italic text-center">
                This tool visualizes uploaded data and does not provide medical advice.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
