'use client';

import { useState, useEffect } from 'react';
import { ChartConfig, ChartType, ParsedData, SortConfig } from '@/types';
import { CHART_TYPES, createDefaultChartConfig, validateChartConfig } from '@/utils/chartUtils';
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

      {/* Axis Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X-Axis ({pendingConfig.type === 'pie' ? 'Labels' : 'X-Axis'})
          </label>
          <select
            value={pendingConfig.xAxis}
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
            value={pendingConfig.yAxis}
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
    </div>
  );
}
