'use client';

import { ChartType } from '@/types';
import { CHART_TYPES } from '@/utils/chartUtils';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
}

export default function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Chart Type
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {CHART_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
              value === t.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
