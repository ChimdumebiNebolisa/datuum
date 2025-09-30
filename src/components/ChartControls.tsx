'use client';

import { useState, useEffect } from 'react';
import { ChartConfig, ChartType, ParsedData, SortConfig, AxisConfig, DatasetConfig } from '@/types';
import { 
  CHART_TYPES, 
  createDefaultChartConfig, 
  validateChartConfig,
  addYAxis,
  addXAxis,
  removeAxis,
  addDataset,
  removeDataset
} from '@/utils/chartUtils';
import { sortData } from '@/utils/csvParser';

interface ChartControlsProps {
  data: ParsedData;
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  onDataChange?: (data: ParsedData) => void;
}

export default function ChartControls({ data, config, onConfigChange, onDataChange }: ChartControlsProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [pendingConfig, setPendingConfig] = useState<ChartConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Update pending config when prop config changes
  useEffect(() => {
    setPendingConfig(config);
    setHasChanges(false);
  }, [config]);

  // Validate config whenever it changes
  useEffect(() => {
    const validation = validateChartConfig(pendingConfig, data.columns);
    setValidationErrors(validation.errors);
  }, [pendingConfig, data.columns]);

  const handleChartTypeChange = (type: ChartType) => {
    // Create new config with smart defaults
    const newConfig = createDefaultChartConfig(data.data, data.columns, type);
    
    // If current axes are valid for new chart type, keep them
    const xColumn = data.columns.find(col => col.name === pendingConfig.xAxis);
    const yColumn = data.columns.find(col => col.name === pendingConfig.yAxis);
    
    if (xColumn && yColumn) {
      const validation = validateChartConfig({ ...pendingConfig, type }, data.columns);
      if (validation.isValid) {
        // Keep current axes if they're valid for the new chart type
        newConfig.xAxis = pendingConfig.xAxis;
        newConfig.yAxis = pendingConfig.yAxis;
      }
    }
    
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleTitleChange = (title: string) => {
    const newConfig = { ...pendingConfig, title };
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleAxisChange = (axis: 'xAxis' | 'yAxis', value: string) => {
    const newConfig = { ...pendingConfig, [axis]: value };
    
    // If the selected column is the same as the other axis, clear it
    if (axis === 'xAxis' && value === pendingConfig.yAxis) {
      newConfig.yAxis = '';
    } else if (axis === 'yAxis' && value === pendingConfig.xAxis) {
      newConfig.xAxis = '';
    }
    
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...pendingConfig.colors];
    newColors[index] = color;
    const newConfig = { ...pendingConfig, colors: newColors };
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const addColor = () => {
    const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
    const newColor = defaultColors[pendingConfig.colors.length % defaultColors.length];
    const newConfig = { ...pendingConfig, colors: [...pendingConfig.colors, newColor] };
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const removeColor = (index: number) => {
    if (pendingConfig.colors.length > 1) {
      const newColors = pendingConfig.colors.filter((_, i) => i !== index);
      const newConfig = { ...pendingConfig, colors: newColors };
      setPendingConfig(newConfig);
      setHasChanges(true);
    }
  };

  const handleVisualize = () => {
    onConfigChange(pendingConfig);
    setHasChanges(false);
  };

  // Multi-axis management functions
  const handleAddYAxis = (column: string) => {
    const newConfig = addYAxis(pendingConfig, column, data.columns);
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleAddXAxis = (column: string) => {
    const newConfig = addXAxis(pendingConfig, column, data.columns);
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleRemoveAxis = (axisId: string) => {
    const newConfig = removeAxis(pendingConfig, axisId);
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleAddDataset = (column: string) => {
    const newConfig = addDataset(pendingConfig, column, data.columns);
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleRemoveDataset = (index: number) => {
    const newConfig = removeDataset(pendingConfig, index);
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleUpdateAxis = (axisId: string, updates: Partial<AxisConfig>) => {
    const newConfig = { ...pendingConfig };
    
    // Update X axis
    const xAxisIndex = newConfig.xAxes.findIndex(axis => axis.id === axisId);
    if (xAxisIndex !== -1) {
      newConfig.xAxes[xAxisIndex] = { ...newConfig.xAxes[xAxisIndex], ...updates };
    }
    
    // Update Y axis
    const yAxisIndex = newConfig.yAxes.findIndex(axis => axis.id === axisId);
    if (yAxisIndex !== -1) {
      newConfig.yAxes[yAxisIndex] = { ...newConfig.yAxes[yAxisIndex], ...updates };
    }
    
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  const handleUpdateDataset = (index: number, updates: Partial<DatasetConfig>) => {
    const newConfig = { ...pendingConfig };
    newConfig.datasets[index] = { ...newConfig.datasets[index], ...updates };
    setPendingConfig(newConfig);
    setHasChanges(true);
  };

  // Get filtered columns for axis selection
  const getFilteredColumns = (axis: 'xAxis' | 'yAxis') => {
    if (pendingConfig.type === 'pie') {
      return axis === 'xAxis' 
        ? data.columns.filter(col => col.type === 'categorical' || col.type === 'date')
        : data.columns.filter(col => col.type === 'numeric');
    }
    
    if (pendingConfig.type === 'scatter') {
      return data.columns.filter(col => col.type === 'numeric');
    }
    
    // For bar, line, doughnut, polarArea, radar, bubble charts
    return axis === 'xAxis'
      ? data.columns.filter(col => col.type === 'categorical' || col.type === 'date')
      : data.columns.filter(col => col.type === 'numeric');
  };

  const handleSort = (columnName: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.column === columnName && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }
    
    const newSortConfig: SortConfig = { column: columnName, direction: newDirection };
    setSortConfig(newSortConfig);
    
    if (onDataChange) {
      const sortedData = sortData(data, newSortConfig);
      onDataChange(sortedData);
    }
  };

  const clearSort = () => {
    setSortConfig(null);
    if (onDataChange) {
      onDataChange(data);
    }
  };

  const getSortIcon = (columnName: string) => {
    if (sortConfig?.column !== columnName) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span className="text-blue-500">↑</span> : <span className="text-blue-500">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort Data by:</span>
          <div className="flex flex-wrap gap-2">
            {data.headers.map((header) => (
              <div key={header} className="flex items-center gap-1">
                <span className="text-xs text-gray-600">{header}:</span>
                <button
                  onClick={() => handleSort(header)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortConfig?.column === header && sortConfig?.direction === 'asc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={`Sort ${header} ascending`}
                >
                  ↑ Asc
                </button>
                <button
                  onClick={() => {
                    if (sortConfig?.column === header && sortConfig?.direction === 'asc') {
                      handleSort(header); // This will toggle to desc
                    } else {
                      const newSortConfig = { column: header, direction: 'desc' as const };
                      setSortConfig(newSortConfig);
                      if (onDataChange) {
                        const sortedData = sortData(data, newSortConfig);
                        onDataChange(sortedData);
                      }
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortConfig?.column === header && sortConfig?.direction === 'desc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={`Sort ${header} descending`}
                >
                  ↓ Desc
                </button>
              </div>
            ))}
            {sortConfig && (
              <button
                onClick={clearSort}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                title="Clear all sorting"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        {sortConfig && (
          <div className="mt-2 text-xs text-gray-600">
            Currently sorted by: <span className="font-medium text-gray-900">{sortConfig.column}</span> ({sortConfig.direction})
          </div>
        )}
      </div>

      {/* Chart Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chart Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleChartTypeChange(type.value)}
              className={`px-3 py-2 text-sm rounded border ${
                pendingConfig.type === type.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chart Title
        </label>
        <input
          type="text"
          value={pendingConfig.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800 font-medium mb-1">Chart Configuration Issues:</div>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy Axis Selection - Only show for pie charts or when no multi-axis config exists */}
      {(pendingConfig.type === 'pie' || pendingConfig.type === 'doughnut' || pendingConfig.type === 'polarArea' || 
        (pendingConfig.xAxes.length === 0 && pendingConfig.yAxes.length === 0)) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis ({pendingConfig.type === 'pie' ? 'Labels' : 'X-Axis'})
            </label>
            <select
              value={pendingConfig.xAxis || ''}
              onChange={(e) => handleAxisChange('xAxis', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.some(error => error.includes('X-axis')) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            >
              <option value="">Select X-Axis...</option>
              {getFilteredColumns('xAxis').map((column) => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.type})
                </option>
              ))}
            </select>
            {getFilteredColumns('xAxis').length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No {pendingConfig.type === 'pie' ? 'categorical' : pendingConfig.type === 'scatter' ? 'numeric' : 'categorical'} columns available
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis ({pendingConfig.type === 'pie' ? 'Values' : 'Y-Axis'})
            </label>
            <select
              value={pendingConfig.yAxis || ''}
              onChange={(e) => handleAxisChange('yAxis', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.some(error => error.includes('Y-axis')) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            >
              <option value="">Select Y-Axis...</option>
              {getFilteredColumns('yAxis').map((column) => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.type})
                </option>
              ))}
            </select>
            {getFilteredColumns('yAxis').length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No numeric columns available
              </p>
            )}
          </div>
        </div>
      )}

      {/* Color Palette */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Colors
          </label>
          <button
            onClick={addColor}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Color
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingConfig.colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-1">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              {pendingConfig.colors.length > 1 && (
                <button
                  onClick={() => removeColor(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Convert to Multi-Axis Button */}
      {pendingConfig.type !== 'pie' && pendingConfig.type !== 'doughnut' && pendingConfig.type !== 'polarArea' && 
       pendingConfig.xAxes.length === 0 && pendingConfig.yAxes.length === 0 && pendingConfig.xAxis && pendingConfig.yAxis && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Multi-Axis Support</h4>
              <p className="text-xs text-blue-700 mt-1">
                Convert to multi-axis mode to add multiple Y-axes (left/right) and X-axes (top/bottom)
              </p>
            </div>
            <button
              onClick={() => {
                // Convert legacy config to multi-axis
                const newConfig = { ...pendingConfig };
                newConfig.xAxes = [{
                  id: 'x1',
                  label: pendingConfig.xAxis!,
                  column: pendingConfig.xAxis!,
                  position: 'bottom',
                  type: (data.columns.find(c => c.name === pendingConfig.xAxis)?.type === 'date') ? 'time' : 'category',
                  display: true,
                  grid: { display: true },
                  ticks: { color: '#666' }
                }];
                newConfig.yAxes = [{
                  id: 'y1',
                  label: pendingConfig.yAxis!,
                  column: pendingConfig.yAxis!,
                  position: 'left',
                  type: 'linear',
                  display: true,
                  grid: { display: true },
                  ticks: { color: '#666' }
                }];
                newConfig.datasets = [{
                  label: pendingConfig.yAxis!,
                  column: pendingConfig.yAxis!,
                  yAxisID: 'y1',
                  xAxisID: 'x1',
                  color: pendingConfig.colors[0],
                  type: pendingConfig.type === 'line' ? 'line' : pendingConfig.type === 'scatter' ? 'scatter' : 'bar',
                  fill: false,
                  tension: 0.1
                }];
                setPendingConfig(newConfig);
                setHasChanges(true);
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
          </div>
        </div>
      )}

      {/* Multi-Axis Configuration */}
      {pendingConfig.type !== 'pie' && pendingConfig.type !== 'doughnut' && pendingConfig.type !== 'polarArea' && (
        <>
          {/* Y-Axes Configuration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Y-Axes
              </label>
              <select
                onChange={(e) => e.target.value && handleAddYAxis(e.target.value)}
                value=""
                className="text-sm text-blue-600 hover:text-blue-800 border-none bg-transparent cursor-pointer"
              >
                <option value="">+ Add Y-Axis</option>
                {data.columns
                  .filter(col => col.type === 'numeric')
                  .map(column => (
                    <option key={column.name} value={column.name}>
                      {column.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              {pendingConfig.yAxes.map((axis, index) => (
                <div key={axis.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{axis.label}</span>
                      <span className="text-xs text-gray-500">({axis.position})</span>
                    </div>
                    {pendingConfig.yAxes.length > 1 && (
                      <button
                        onClick={() => handleRemoveAxis(axis.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={axis.position}
                      onChange={(e) => handleUpdateAxis(axis.id, { position: e.target.value as 'left' | 'right' })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={axis.display}
                        onChange={(e) => handleUpdateAxis(axis.id, { display: e.target.checked })}
                        className="text-xs"
                      />
                      <span className="text-xs text-gray-600">Show</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* X-Axes Configuration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                X-Axes
              </label>
              <select
                onChange={(e) => e.target.value && handleAddXAxis(e.target.value)}
                value=""
                className="text-sm text-blue-600 hover:text-blue-800 border-none bg-transparent cursor-pointer"
              >
                <option value="">+ Add X-Axis</option>
                {data.columns
                  .filter(col => col.type === 'categorical' || col.type === 'date')
                  .map(column => (
                    <option key={column.name} value={column.name}>
                      {column.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              {pendingConfig.xAxes.map((axis, index) => (
                <div key={axis.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{axis.label}</span>
                      <span className="text-xs text-gray-500">({axis.position})</span>
                    </div>
                    {pendingConfig.xAxes.length > 1 && (
                      <button
                        onClick={() => handleRemoveAxis(axis.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={axis.position}
                      onChange={(e) => handleUpdateAxis(axis.id, { position: e.target.value as 'top' | 'bottom' })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="bottom">Bottom</option>
                      <option value="top">Top</option>
                    </select>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={axis.display}
                        onChange={(e) => handleUpdateAxis(axis.id, { display: e.target.checked })}
                        className="text-xs"
                      />
                      <span className="text-xs text-gray-600">Show</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Datasets Configuration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Datasets
              </label>
              <select
                onChange={(e) => e.target.value && handleAddDataset(e.target.value)}
                value=""
                className="text-sm text-blue-600 hover:text-blue-800 border-none bg-transparent cursor-pointer"
              >
                <option value="">+ Add Dataset</option>
                {data.columns
                  .filter(col => col.type === 'numeric')
                  .map(column => (
                    <option key={column.name} value={column.name}>
                      {column.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              {pendingConfig.datasets.map((dataset, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{dataset.label}</span>
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: dataset.color }}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveDataset(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={dataset.yAxisID || ''}
                      onChange={(e) => handleUpdateDataset(index, { yAxisID: e.target.value })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select Y-Axis</option>
                      {pendingConfig.yAxes.map(axis => (
                        <option key={axis.id} value={axis.id}>
                          {axis.label} ({axis.position})
                        </option>
                      ))}
                    </select>
                    <select
                      value={dataset.xAxisID || ''}
                      onChange={(e) => handleUpdateDataset(index, { xAxisID: e.target.value })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select X-Axis</option>
                      {pendingConfig.xAxes.map(axis => (
                        <option key={axis.id} value={axis.id}>
                          {axis.label} ({axis.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Visualize Button */}
      {hasChanges && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleVisualize}
            disabled={validationErrors.length > 0}
            className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-colors ${
              validationErrors.length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover-lift'
            }`}
          >
            {validationErrors.length > 0 
              ? `Fix ${validationErrors.length} issue${validationErrors.length > 1 ? 's' : ''} to visualize`
              : 'Visualize Chart'
            }
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {validationErrors.length === 0 
              ? 'Apply your changes to update the chart'
              : 'Please fix the configuration issues above'
            }
          </p>
        </div>
      )}

      {/* Help Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowHelp(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          title="How to use multi-axis charts"
        >
          <span className="text-lg">?</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Multi-Axis Chart Guide</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 1: Upload Your Data</h3>
                  <p className="text-gray-600 text-sm">
                    Upload a CSV file with multiple numeric columns (e.g., Temperature, Rainfall, Sales). 
                    The system will automatically detect column types.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 2: Choose Chart Type</h3>
                  <p className="text-gray-600 text-sm">
                    Select bar, line, or scatter chart. Multi-axis works best with bar and line charts 
                    for comparing different metrics.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 3: Convert to Multi-Axis</h3>
                  <p className="text-gray-600 text-sm">
                    Click the blue "Convert to Multi-Axis" button to upgrade from simple single-axis 
                    to powerful multi-axis mode.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 4: Add Y-Axes</h3>
                  <p className="text-gray-600 text-sm">
                    Use "Add Y-Axis" to add more vertical axes. Each Y-axis can be positioned on the 
                    left or right side with independent scales.
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• <strong>Left Y-Axis:</strong> Primary metric (e.g., Temperature in °C)</li>
                    <li>• <strong>Right Y-Axis:</strong> Secondary metric (e.g., Rainfall in mm)</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 5: Add X-Axes (Optional)</h3>
                  <p className="text-gray-600 text-sm">
                    Use "Add X-Axis" to add horizontal axes on top or bottom. Useful for showing 
                    different time periods or categories.
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• <strong>Bottom X-Axis:</strong> Primary categories (e.g., Months)</li>
                    <li>• <strong>Top X-Axis:</strong> Secondary categories (e.g., Quarters)</li>
                  </ul>
                </div>

                {/* Step 6 */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 6: Assign Datasets</h3>
                  <p className="text-gray-600 text-sm">
                    Add datasets and assign each one to specific X and Y axes. Each dataset gets 
                    its own color and can be assigned to any axis combination.
                  </p>
                </div>

                {/* Step 7 */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 7: Visualize</h3>
                  <p className="text-gray-600 text-sm">
                    Click "Visualize Chart" to apply all changes and see your multi-axis chart. 
                    The system validates your configuration before rendering.
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Use different colors for datasets on the same axis</li>
                    <li>• Position related metrics on opposite sides (left/right)</li>
                    <li>• Hide unused axes to clean up the chart</li>
                    <li>• Use descriptive axis labels for clarity</li>
                    <li>• Combine bar and line charts for mixed data types</li>
                  </ul>
                </div>

                {/* Example */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Example: Weather Dashboard</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Create a weather chart with:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• <strong>Left Y-Axis:</strong> Temperature (°C)</li>
                    <li>• <strong>Right Y-Axis:</strong> Rainfall (mm)</li>
                    <li>• <strong>Bottom X-Axis:</strong> Months</li>
                    <li>• <strong>Datasets:</strong> Temperature line + Rainfall bars</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
