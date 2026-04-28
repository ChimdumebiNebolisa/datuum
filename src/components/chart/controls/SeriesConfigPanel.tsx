'use client';

import { ChartConfig, ColumnInfo, AxisConfig, DatasetConfig } from '@/types';
import { addYAxis, addXAxis, removeAxis, addDataset, removeDataset } from '@/utils/chartUtils';

interface SeriesConfigPanelProps {
  config: ChartConfig;
  columns: ColumnInfo[];
  onChange: (config: ChartConfig) => void;
}

function AxisCard({
  axis,
  canRemove,
  positions,
  onPositionChange,
  onDisplayChange,
  onRemove,
}: {
  axis: AxisConfig;
  canRemove: boolean;
  positions: string[];
  onPositionChange: (pos: string) => void;
  onDisplayChange: (show: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700 truncate max-w-[120px]" title={axis.label}>
          {axis.label}
          {axis.unit && <span className="text-gray-400 ml-1">({axis.unit})</span>}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 text-base leading-none ml-1">
            ×
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={axis.position}
          onChange={(e) => onPositionChange(e.target.value)}
          className="border border-gray-200 rounded px-1.5 py-1 flex-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {positions.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={axis.display}
            onChange={(e) => onDisplayChange(e.target.checked)}
            className="rounded"
          />
          Show
        </label>
      </div>
    </div>
  );
}

export default function SeriesConfigPanel({ config, columns, onChange }: SeriesConfigPanelProps) {
  const updateAxis = (axisId: string, patch: Partial<AxisConfig>) => {
    onChange({
      ...config,
      xAxes: config.xAxes.map((a) => (a.id === axisId ? { ...a, ...patch } : a)),
      yAxes: config.yAxes.map((a) => (a.id === axisId ? { ...a, ...patch } : a)),
    });
  };

  const updateDataset = (index: number, patch: Partial<DatasetConfig>) => {
    onChange({
      ...config,
      datasets: config.datasets.map((ds, i) => (i === index ? { ...ds, ...patch } : ds)),
    });
  };

  const numericCols = columns.filter((c) => c.type === 'numeric');
  const axisCols = columns.filter((c) => c.type === 'categorical' || c.type === 'date');
  const isPolar = config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea';

  return (
    <div className="space-y-4">
      {/* Y-Axes */}
      {!isPolar && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Y-Axes</label>
            <select
              value=""
              onChange={(e) => e.target.value && onChange(addYAxis(config, e.target.value, columns))}
              className="text-xs text-blue-600 border-none bg-transparent cursor-pointer focus:outline-none"
            >
              <option value="">+ Add</option>
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            {config.yAxes.map((axis) => (
              <AxisCard
                key={axis.id}
                axis={axis}
                canRemove={config.yAxes.length > 1}
                positions={['left', 'right']}
                onPositionChange={(pos) => updateAxis(axis.id, { position: pos as 'left' | 'right' })}
                onDisplayChange={(display) => updateAxis(axis.id, { display })}
                onRemove={() => onChange(removeAxis(config, axis.id))}
              />
            ))}
            {config.yAxes.length === 0 && (
              <p className="text-xs text-gray-400 italic">No Y-axes configured</p>
            )}
          </div>
        </div>
      )}

      {/* X-Axes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">X-Axis</label>
          <select
            value=""
            onChange={(e) => e.target.value && onChange(addXAxis(config, e.target.value, columns))}
            className="text-xs text-blue-600 border-none bg-transparent cursor-pointer focus:outline-none"
          >
            <option value="">+ Add</option>
            {axisCols.map((c) => (
              <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          {config.xAxes.map((axis) => (
            <AxisCard
              key={axis.id}
              axis={axis}
              canRemove={config.xAxes.length > 1}
              positions={['bottom', 'top']}
              onPositionChange={(pos) => updateAxis(axis.id, { position: pos as 'top' | 'bottom' })}
              onDisplayChange={(display) => updateAxis(axis.id, { display })}
              onRemove={() => onChange(removeAxis(config, axis.id))}
            />
          ))}
          {config.xAxes.length === 0 && (
            <p className="text-xs text-gray-400 italic">No X-axes configured</p>
          )}
        </div>
      </div>

      {/* Datasets */}
      {!isPolar && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Datasets</label>
            <select
              value=""
              onChange={(e) => e.target.value && onChange(addDataset(config, e.target.value, columns))}
              className="text-xs text-blue-600 border-none bg-transparent cursor-pointer focus:outline-none"
            >
              <option value="">+ Add</option>
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>{c.displayName || c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            {config.datasets.map((ds, i) => (
              <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm border border-gray-300" style={{ backgroundColor: ds.color }} />
                    <span className="font-medium text-gray-700 truncate max-w-[100px]">{ds.label}</span>
                  </div>
                  <button
                    onClick={() => onChange(removeDataset(config, i))}
                    className="text-gray-400 hover:text-red-500 text-base leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <div className="text-gray-500 mb-0.5">Color</div>
                    <input
                      type="color"
                      value={ds.color}
                      onChange={(e) => updateDataset(i, { color: e.target.value })}
                      className="w-full h-6 rounded cursor-pointer border border-gray-200"
                    />
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Y-Axis</div>
                    <select
                      value={ds.yAxisID ?? ''}
                      onChange={(e) => updateDataset(i, { yAxisID: e.target.value })}
                      className="border border-gray-200 rounded px-1.5 py-0.5 w-full text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {config.yAxes.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {config.datasets.length === 0 && (
              <p className="text-xs text-gray-400 italic">No datasets configured</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
