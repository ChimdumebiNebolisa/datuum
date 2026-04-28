'use client';

import { useState } from 'react';
import { ReferenceRange, ColumnInfo } from '@/types';

interface ReferenceRangePanelProps {
  ranges: ReferenceRange[];
  columns: ColumnInfo[];
  onChange: (ranges: ReferenceRange[]) => void;
}

const PRESET_COLORS = [
  'rgba(34, 197, 94, 0.15)',
  'rgba(59, 130, 246, 0.15)',
  'rgba(245, 158, 11, 0.15)',
  'rgba(239, 68, 68, 0.15)',
  'rgba(139, 92, 246, 0.15)',
];

let idCounter = 0;
function newId() { return `ref-${++idCounter}-${Date.now()}`; }

export default function ReferenceRangePanel({ ranges, columns, onChange }: ReferenceRangePanelProps) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    seriesColumn: '',
    lowerColumn: '',
    upperColumn: '',
    label: 'Reference Range',
    fillColor: PRESET_COLORS[0],
  });

  const numericCols = columns.filter((c) => c.type === 'numeric');
  const seriesCols = columns.filter((c) => c.role === 'y-series');

  const handleAdd = () => {
    if (!form.seriesColumn) return;
    const newRange: ReferenceRange = {
      id: newId(),
      seriesColumn: form.seriesColumn,
      lowerColumn: form.lowerColumn || undefined,
      upperColumn: form.upperColumn || undefined,
      label: form.label || 'Reference Range',
      fillColor: form.fillColor,
    };
    onChange([...ranges, newRange]);
    setAdding(false);
    setForm({ seriesColumn: '', lowerColumn: '', upperColumn: '', label: 'Reference Range', fillColor: PRESET_COLORS[0] });
  };

  const removeRange = (id: string) => onChange(ranges.filter((r) => r.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Reference Ranges
        </label>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Range
          </button>
        )}
      </div>

      {/* Existing ranges */}
      {ranges.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {ranges.map((r) => (
            <div key={r.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
              <div className="w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0" style={{ backgroundColor: r.fillColor }} />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-700">{r.label}</span>
                <span className="text-gray-400 ml-1">→ {r.seriesColumn}</span>
                {r.lowerColumn && <span className="text-gray-400"> ↓{r.lowerColumn}</span>}
                {r.upperColumn && <span className="text-gray-400"> ↑{r.upperColumn}</span>}
              </div>
              <button onClick={() => removeRange(r.id)} className="text-gray-400 hover:text-red-500 text-base leading-none flex-shrink-0">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {ranges.length === 0 && !adding && (
        <p className="text-xs text-gray-400 italic mb-2">
          No reference ranges. Add one to show a shaded band on the chart.
        </p>
      )}

      {/* Add form */}
      {adding && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-0.5 font-medium">For Series</label>
              <select
                value={form.seriesColumn}
                onChange={(e) => setForm({ ...form, seriesColumn: e.target.value })}
                className="border border-gray-200 rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">Select...</option>
                {(seriesCols.length > 0 ? seriesCols : numericCols).map((c) => (
                  <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-0.5 font-medium">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="border border-gray-200 rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-0.5 font-medium">Lower Bound Column</label>
              <select
                value={form.lowerColumn}
                onChange={(e) => setForm({ ...form, lowerColumn: e.target.value })}
                className="border border-gray-200 rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">(none)</option>
                {numericCols.map((c) => (
                  <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-0.5 font-medium">Upper Bound Column</label>
              <select
                value={form.upperColumn}
                onChange={(e) => setForm({ ...form, upperColumn: e.target.value })}
                className="border border-gray-200 rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">(none)</option>
                {numericCols.map((c) => (
                  <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Fill Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, fillColor: c })}
                  className={`w-6 h-6 rounded border-2 transition-all ${form.fillColor === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.replace('0.15', '0.6') }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!form.seriesColumn}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Range
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-gray-600 rounded-lg text-xs font-medium hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
