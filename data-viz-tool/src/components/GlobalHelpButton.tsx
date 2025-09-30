'use client';

import { useState } from 'react';

export default function GlobalHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Global Help Button - Fixed to screen */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setShowHelp(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center hover:scale-105"
          title="How to use multi-axis charts - Step by step guide"
        >
          <span className="text-xl font-bold">?</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Multi-Axis Chart Guide</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 1: Upload Your Data</h3>
                  <p className="text-gray-600 text-sm">
                    Upload a CSV file with multiple numeric columns (e.g., Temperature, Rainfall, Sales). 
                    The system will automatically detect column types.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 2: Choose Chart Type</h3>
                  <p className="text-gray-600 text-sm">
                    Select bar, line, or scatter chart. Multi-axis works best with bar and line charts 
                    for comparing different metrics.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 3: Convert to Multi-Axis</h3>
                  <p className="text-gray-600 text-sm">
                    Click the blue "Convert to Multi-Axis" button to upgrade from simple single-axis 
                    to powerful multi-axis mode.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 4: Add Y-Axes</h3>
                  <p className="text-gray-600 text-sm">
                    Use "Add Y-Axis" to add more vertical axes. Each Y-axis can be positioned on the 
                    left or right side with independent scales.
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• <strong>Left Y-Axis:</strong> Primary metric (e.g., Temperature in °C)</li>
                    <li>• <strong>Right Y-Axis:</strong> Secondary metric (e.g., Rainfall in mm)</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 5: Add X-Axes (Optional)</h3>
                  <p className="text-gray-600 text-sm">
                    Use "Add X-Axis" to add horizontal axes on top or bottom. Useful for showing 
                    different time periods or categories.
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• <strong>Bottom X-Axis:</strong> Primary categories (e.g., Months)</li>
                    <li>• <strong>Top X-Axis:</strong> Secondary categories (e.g., Quarters)</li>
                  </ul>
                </div>

                {/* Step 6 */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 6: Assign Datasets</h3>
                  <p className="text-gray-600 text-sm">
                    Add datasets and assign each one to specific X and Y axes. Each dataset gets 
                    its own color and can be assigned to any axis combination.
                  </p>
                </div>

                {/* Step 7 */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Step 7: Visualize</h3>
                  <p className="text-gray-600 text-sm">
                    Click "Visualize Chart" to apply all changes and see your multi-axis chart. 
                    The system validates your configuration before rendering.
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Use different colors for datasets on the same axis</li>
                    <li>• Position related metrics on opposite sides (left/right)</li>
                    <li>• Hide unused axes to clean up the chart</li>
                    <li>• Use descriptive axis labels for clarity</li>
                    <li>• Combine bar and line charts for mixed data types</li>
                  </ul>
                </div>

                {/* Example */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Example: Weather Dashboard</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Create a weather chart with:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• <strong>Left Y-Axis:</strong> Temperature (°C)</li>
                    <li>• <strong>Right Y-Axis:</strong> Rainfall (mm)</li>
                    <li>• <strong>Bottom X-Axis:</strong> Months</li>
                    <li>• <strong>Datasets:</strong> Temperature line + Rainfall bars</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
