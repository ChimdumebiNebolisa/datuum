'use client';

import { useState } from 'react';
import { ActiveFilter, ColumnInfo, DateRangeFilter, ValueRangeFilter, CategoryFilter } from '@/types';

interface FilterPanelProps {
  filters: ActiveFilter[];
  columns: ColumnInfo[];
  allData: import('@/types').DataPoint[];
  onChange: (filters: ActiveFilter[]) => void;
}

let idCounter = 0;
function newId() { return `filter-${++idCounter}-${Date.now()}`; }

export default function FilterPanel({ filters, columns, allData, onChange }: FilterPanelProps) {
  const [adding, setAdding] = useState(false);

  const dateCols = columns.filter((c) => c.type === 'date');
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const categoryCols = columns.filter((c) => c.type === 'categorical');

  const removeFilter = (id: string) => onChange(filters.filter((f) => f.id !== id));

  const addDateFilter = (column: string) => {
    const filter: ActiveFilter = {
      id: newId(),
      column,
      type: 'date-range',
      value: { from: '', to: '' } as DateRangeFilter,
    };
    onChange([...filters, filter]);
    setAdding(false);
  };

  const addValueFilter = (column: string) => {
    const filter: ActiveFilter = {
      id: newId(),
      column,
      type: 'value-range',
      value: { min: undefined, max: undefined } as ValueRangeFilter,
    };
    onChange([...filters, filter]);
    setAdding(false);
  };

  const addCategoryFilter = (column: string) => {
    const values = [...new Set(allData.map((r) => String(r[column] ?? '')).filter(Boolean))];
    const filter: ActiveFilter = {
      id: newId(),
      column,
      type: 'category',
      value: { include: values } as CategoryFilter,
    };
    onChange([...filters, filter]);
    setAdding(false);
  };

  const updateFilterValue = (id: string, patch: Partial<DateRangeFilter | ValueRangeFilter>) => {
    onChange(
      filters.map((f) =>
        f.id === id ? { ...f, value: { ...f.value, ...patch } } : f
      )
    );
  };

  const toggleCategory = (id: string, val: string) => {
    onChange(
      filters.map((f) => {
        if (f.id !== id || f.type !== 'category') return f;
        const current = (f.value as CategoryFilter).include;
        const updated = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
        return { ...f, value: { include: updated } };
      })
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filters</label>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            + Add Filter
          </button>
        )}
      </div>

      {/* Existing filters */}
      {filters.length > 0 && (
        <div className="space-y-2 mb-2">
          {filters.map((f) => {
            const col = columns.find((c) => c.name === f.column);
            const displayName = col?.displayName || f.column;

            return (
              <div key={f.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-gray-700">{displayName}</span>
                  <button onClick={() => removeFilter(f.id)} className="text-gray-400 hover:text-red-500 text-base leading-none">×</button>
                </div>

                {f.type === 'date-range' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-gray-500">From</span>
                      <input
                        type="date"
                        value={(f.value as DateRangeFilter).from ?? ''}
                        onChange={(e) => updateFilterValue(f.id, { from: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-0.5 w-full mt-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500">To</span>
                      <input
                        type="date"
                        value={(f.value as DateRangeFilter).to ?? ''}
                        onChange={(e) => updateFilterValue(f.id, { to: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-0.5 w-full mt-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                )}

                {f.type === 'value-range' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-gray-500">Min</span>
                      <input
                        type="number"
                        value={(f.value as ValueRangeFilter).min ?? ''}
                        onChange={(e) => updateFilterValue(f.id, { min: e.target.value ? Number(e.target.value) : undefined })}
                        className="border border-gray-200 rounded px-2 py-0.5 w-full mt-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="No min"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500">Max</span>
                      <input
                        type="number"
                        value={(f.value as ValueRangeFilter).max ?? ''}
                        onChange={(e) => updateFilterValue(f.id, { max: e.target.value ? Number(e.target.value) : undefined })}
                        className="border border-gray-200 rounded px-2 py-0.5 w-full mt-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="No max"
                      />
                    </div>
                  </div>
                )}

                {f.type === 'category' && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[...new Set(allData.map((r) => String(r[f.column] ?? '')).filter(Boolean))].map((val) => {
                      const included = (f.value as CategoryFilter).include.includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => toggleCategory(f.id, val)}
                          className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                            included
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filters.length === 0 && !adding && (
        <p className="text-xs text-gray-400 italic mb-2">No filters active.</p>
      )}

      {/* Add filter picker */}
      {adding && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
          <p className="font-medium text-gray-700">Filter by column:</p>
          {dateCols.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Date columns</p>
              <div className="flex flex-wrap gap-1.5">
                {dateCols.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => addDateFilter(c.name)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
                  >
                    {c.displayName || c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {numericCols.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Numeric columns</p>
              <div className="flex flex-wrap gap-1.5">
                {numericCols.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => addValueFilter(c.name)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
                  >
                    {c.displayName || c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {categoryCols.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Category columns</p>
              <div className="flex flex-wrap gap-1.5">
                {categoryCols.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => addCategoryFilter(c.name)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
                  >
                    {c.displayName || c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setAdding(false)} className="text-gray-500 hover:text-gray-700 transition-colors mt-1">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
