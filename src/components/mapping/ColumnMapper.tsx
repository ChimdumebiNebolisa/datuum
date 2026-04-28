'use client';

import { useState } from 'react';
import { ColumnInfo, ColumnRole, ColumnType, DataPoint } from '@/types';

interface ColumnMapperProps {
  columns: ColumnInfo[];
  sampleData: DataPoint[]; // first ~5 rows
  onChange: (columns: ColumnInfo[]) => void;
  onBuildChart: () => void;
}

const ROLE_OPTIONS: { value: ColumnRole; label: string; description: string }[] = [
  { value: 'x-axis', label: 'X-Axis', description: 'Time or category axis' },
  { value: 'y-series', label: 'Value Series', description: 'Plot as a line or bar' },
  { value: 'ref-lower', label: 'Ref Lower', description: 'Lower reference bound' },
  { value: 'ref-upper', label: 'Ref Upper', description: 'Upper reference bound' },
  { value: 'label', label: 'Label', description: 'Show in tooltip only' },
  { value: 'ignore', label: 'Ignore', description: 'Exclude from chart' },
];

const TYPE_OPTIONS: { value: ColumnType; label: string }[] = [
  { value: 'numeric', label: 'Numeric' },
  { value: 'date', label: 'Date' },
  { value: 'categorical', label: 'Categorical' },
];

const ROLE_COLORS: Record<ColumnRole, string> = {
  'x-axis': 'bg-blue-100 text-blue-700 border-blue-200',
  'y-series': 'bg-green-100 text-green-700 border-green-200',
  'ref-lower': 'bg-amber-100 text-amber-700 border-amber-200',
  'ref-upper': 'bg-orange-100 text-orange-700 border-orange-200',
  'label': 'bg-purple-100 text-purple-700 border-purple-200',
  'ignore': 'bg-gray-100 text-gray-500 border-gray-200',
};

function getSampleValues(col: ColumnInfo, data: DataPoint[]): string {
  const vals = data
    .slice(0, 4)
    .map((row) => row[col.name])
    .filter((v) => v !== null && v !== undefined && v !== '');
  if (vals.length === 0) return '—';
  return vals.map(String).join(', ');
}

export default function ColumnMapper({ columns, sampleData, onChange, onBuildChart }: ColumnMapperProps) {
  const [cols, setCols] = useState<ColumnInfo[]>(columns);

  const update = (index: number, patch: Partial<ColumnInfo>) => {
    const updated = cols.map((c, i) => (i === index ? { ...c, ...patch } : c));
    setCols(updated);
    onChange(updated);
  };

  const hasXAxis = cols.some((c) => c.role === 'x-axis');
  const hasYSeries = cols.some((c) => c.role === 'y-series');
  const canBuild = hasXAxis && hasYSeries;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Map Columns</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign a role to each column. Smart defaults have been applied — adjust as needed.
          </p>
        </div>
        <button
          onClick={onBuildChart}
          disabled={!canBuild}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            canBuild
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Build Chart →
        </button>
      </div>

      {!canBuild && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {!hasXAxis && !hasYSeries
            ? 'Assign at least one X-Axis and one Value Series column to build a chart.'
            : !hasXAxis
            ? 'Assign at least one column as X-Axis.'
            : 'Assign at least one column as Value Series.'}
        </p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
        {ROLE_OPTIONS.map((r) => (
          <span key={r.value} className={`text-xs px-2 py-0.5 rounded border font-medium ${ROLE_COLORS[r.value]}`}>
            {r.label}
          </span>
        ))}
      </div>

      {/* Column rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
              <th className="pb-2 pr-4 font-medium w-40">Column</th>
              <th className="pb-2 pr-4 font-medium w-48">Sample Values</th>
              <th className="pb-2 pr-4 font-medium w-28">Type</th>
              <th className="pb-2 pr-4 font-medium w-36">Role</th>
              <th className="pb-2 pr-4 font-medium w-24">Unit</th>
              <th className="pb-2 font-medium w-36">Display Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cols.map((col, i) => (
              <tr key={col.name} className={`${col.role === 'ignore' ? 'opacity-50' : ''} transition-opacity`}>
                {/* Column name */}
                <td className="py-2 pr-4">
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate block max-w-[140px]" title={col.name}>
                    {col.name}
                  </span>
                </td>

                {/* Sample values */}
                <td className="py-2 pr-4">
                  <span className="text-xs text-gray-500 truncate block max-w-[180px]" title={getSampleValues(col, sampleData)}>
                    {getSampleValues(col, sampleData)}
                  </span>
                </td>

                {/* Type dropdown */}
                <td className="py-2 pr-4">
                  <select
                    value={col.type}
                    onChange={(e) => update(i, { type: e.target.value as ColumnType })}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </td>

                {/* Role dropdown */}
                <td className="py-2 pr-4">
                  <select
                    value={col.role}
                    onChange={(e) => update(i, { role: e.target.value as ColumnRole })}
                    className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full font-medium ${ROLE_COLORS[col.role]}`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
                    ))}
                  </select>
                </td>

                {/* Unit input */}
                <td className="py-2 pr-4">
                  <input
                    type="text"
                    value={col.unit ?? ''}
                    onChange={(e) => update(i, { unit: e.target.value || undefined })}
                    placeholder="e.g. ng/dL"
                    className="text-xs border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300"
                    disabled={col.role === 'ignore'}
                  />
                </td>

                {/* Display name input */}
                <td className="py-2">
                  <input
                    type="text"
                    value={col.displayName ?? ''}
                    onChange={(e) => update(i, { displayName: e.target.value || undefined })}
                    placeholder={col.name}
                    className="text-xs border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300"
                    disabled={col.role === 'ignore'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 italic pt-1">
        This tool visualizes uploaded data and does not provide medical advice.
      </p>
    </div>
  );
}
