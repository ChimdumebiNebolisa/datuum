'use client';

import { DEFAULT_COLORS } from '@/utils/chartUtils';

interface ColorCustomizerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorCustomizer({ colors, onChange }: ColorCustomizerProps) {
  const addColor = () => {
    const next = DEFAULT_COLORS[colors.length % DEFAULT_COLORS.length];
    onChange([...colors, next]);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, color: string) => {
    const updated = [...colors];
    updated[index] = color;
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Colors</label>
        <button onClick={addColor} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(i, e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-gray-200"
              title={color}
            />
            {colors.length > 1 && (
              <button
                onClick={() => removeColor(i)}
                className="text-gray-400 hover:text-red-500 text-xs leading-none"
                title="Remove color"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
