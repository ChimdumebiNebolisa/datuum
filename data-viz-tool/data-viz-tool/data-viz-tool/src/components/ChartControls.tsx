'use client';

import { ChartConfig, ChartType, ParsedData } from '@/types';
import { CHART_TYPES, createDefaultChartConfig } from '@/utils/chartUtils';

interface ChartControlsProps {
  data: ParsedData;
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
}

export default function ChartControls({ data, config, onConfigChange }: ChartControlsProps) {
  const handleChartTypeChange = (type: ChartType) => {
    const newConfig = createDefaultChartConfig(data.data, data.columns, type);
    onConfigChange(newConfig);
  };

  const handleTitleChange = (title: string) => {
    onConfigChange({ ...config, title });
  };

  const handleAxisChange = (axis: 'xAxis' | 'yAxis', value: string) => {
    onConfigChange({ ...config, [axis]: value });
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...config.colors];
    newColors[index] = color;
    onConfigChange({ ...config, colors: newColors });
  };

  const addColor = () => {
    const defaultColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
    const newColor = defaultColors[config.colors.length % defaultColors.length];
    onConfigChange({ ...config, colors: [...config.colors, newColor] });
  };

  const removeColor = (index: number) => {
    if (config.colors.length > 1) {
      const newColors = config.colors.filter((_, i) => i !== index);
      onConfigChange({ ...config, colors: newColors });
    }
  };

  return (
    <div className="space-y-6">
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
                config.type === type.value
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
          value={config.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Axis Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X-Axis ({config.type === 'pie' ? 'Labels' : 'X-Axis'})
          </label>
          <select
            value={config.xAxis}
            onChange={(e) => handleAxisChange('xAxis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {data.columns.map((column) => (
              <option key={column.name} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Y-Axis ({config.type === 'pie' ? 'Values' : 'Y-Axis'})
          </label>
          <select
            value={config.yAxis}
            onChange={(e) => handleAxisChange('yAxis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {data.columns.map((column) => (
              <option key={column.name} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>
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
          {config.colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-1">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              {config.colors.length > 1 && (
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
    </div>
  );
}
