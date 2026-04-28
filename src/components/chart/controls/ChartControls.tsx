'use client';

import { useState, useEffect } from 'react';
import { ChartConfig, ChartType, ParsedData } from '@/types';
import { createDefaultChartConfig, validateChartConfig } from '@/utils/chartUtils';
import ChartTypeSelector from './ChartTypeSelector';
import SeriesConfigPanel from './SeriesConfigPanel';
import ReferenceRangePanel from './ReferenceRangePanel';
import FilterPanel from './FilterPanel';
import ColorCustomizer from './ColorCustomizer';

interface ChartControlsProps {
  data: ParsedData;
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
}

export default function ChartControls({ data, config, onConfigChange }: ChartControlsProps) {
  const [pending, setPending] = useState<ChartConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Sync when parent config changes (e.g. after rebuild from mapper)
  useEffect(() => {
    setPending(config);
    setHasChanges(false);
  }, [config]);

  useEffect(() => {
    const v = validateChartConfig(pending, data.columns);
    setErrors(v.errors);
  }, [pending, data.columns]);

  const update = (patch: Partial<ChartConfig>) => {
    setPending((prev) => ({ ...prev, ...patch }));
    setHasChanges(true);
  };

  const handleTypeChange = (type: ChartType) => {
    const newConfig = createDefaultChartConfig(data.data, data.columns, type);
    setPending(newConfig);
    setHasChanges(true);
  };

  const apply = () => {
    onConfigChange(pending);
    setHasChanges(false);
  };

  return (
    <div className="space-y-5">
      {/* Chart Type */}
      <ChartTypeSelector value={pending.type} onChange={handleTypeChange} />

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
          Chart Title
        </label>
        <input
          type="text"
          value={pending.title}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <hr className="border-gray-100" />

      {/* Series / Axes */}
      <SeriesConfigPanel
        config={pending}
        columns={data.columns}
        onChange={(c) => { setPending(c); setHasChanges(true); }}
      />

      <hr className="border-gray-100" />

      {/* Reference Ranges */}
      <ReferenceRangePanel
        ranges={pending.referenceRanges}
        columns={data.columns}
        onChange={(referenceRanges) => update({ referenceRanges })}
      />

      <hr className="border-gray-100" />

      {/* Filters */}
      <FilterPanel
        filters={pending.filters}
        columns={data.columns}
        allData={data.data}
        onChange={(filters) => update({ filters })}
      />

      <hr className="border-gray-100" />

      {/* Colors */}
      <ColorCustomizer
        colors={pending.colors}
        onChange={(colors) => update({ colors })}
      />

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-semibold text-red-700 mb-1">Configuration issues:</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {errors.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        </div>
      )}

      {/* Apply button */}
      {hasChanges && (
        <button
          onClick={apply}
          disabled={errors.length > 0}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
            errors.length > 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {errors.length > 0 ? `Fix ${errors.length} issue${errors.length > 1 ? 's' : ''} first` : 'Apply Changes'}
        </button>
      )}
    </div>
  );
}
