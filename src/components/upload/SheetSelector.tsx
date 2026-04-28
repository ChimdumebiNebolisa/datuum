'use client';

interface SheetSelectorProps {
  sheets: string[];
  filename: string;
  onSelect: (sheet: string) => void;
  onCancel: () => void;
}

export default function SheetSelector({ sheets, filename, onSelect, onCancel }: SheetSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a Sheet</h2>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{filename}</span> has multiple sheets.
          Choose which one to import.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sheets.map((sheet) => (
            <button
              key={sheet}
              onClick={() => onSelect(sheet)}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-800"
            >
              {sheet}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
