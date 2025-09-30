'use client';

import { useState } from 'react';
import { ParsedData, DataPoint, SortConfig } from '@/types';
import { sortData } from '@/utils/csvParser';
import DataSearchFilter from './DataSearchFilter';

interface DataTableProps {
  data: ParsedData;
  onDataChange: (data: ParsedData) => void;
}

export default function DataTable({ data, onDataChange }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [displayData, setDisplayData] = useState<ParsedData>(data);

  const handleCellEdit = (rowIndex: number, columnName: string, value: string) => {
    setEditingCell({ row: rowIndex, col: columnName });
    setEditValue(String(value));
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const newData = [...data.data];
    const { row, col } = editingCell;
    
    // Try to convert to number if the column is numeric
    const column = data.columns.find(c => c.name === col);
    let convertedValue: string | number = editValue;
    
    if (column?.type === 'numeric') {
      const numValue = Number(editValue);
      convertedValue = isNaN(numValue) ? editValue : numValue;
    }

    newData[row] = {
      ...newData[row],
      [col]: convertedValue,
    };

    onDataChange({
      ...data,
      data: newData,
    });

    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const addRow = () => {
    const newRow: DataPoint = {};
    data.headers.forEach(header => {
      newRow[header] = '';
    });

    onDataChange({
      ...data,
      data: [...data.data, newRow],
    });
  };

  const deleteRow = (rowIndex: number) => {
    const newData = data.data.filter((_, index) => index !== rowIndex);
    onDataChange({
      ...data,
      data: newData,
    });
  };

  const handleSort = (columnName: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.column === columnName && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }
    
    const newSortConfig: SortConfig = { column: columnName, direction: newDirection };
    setSortConfig(newSortConfig);
    
    const sortedData = sortData(data, newSortConfig);
    onDataChange(sortedData);
  };

  const getSortIcon = (columnName: string) => {
    if (sortConfig?.column !== columnName) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span className="text-blue-500">↑</span> : <span className="text-blue-500">↓</span>;
  };

  const handleFilteredData = (filteredData: ParsedData) => {
    setDisplayData(filteredData);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Data Table</h3>
        <div className="flex items-center space-x-2">
          {sortConfig && (
            <div className="text-sm text-gray-600">
              Sorted by: <span className="font-medium">{sortConfig.column}</span> ({sortConfig.direction})
            </div>
          )}
          <button
            onClick={addRow}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 hover-lift"
          >
            Add Row
          </button>
        </div>
      </div>

      {/* Search and Filter Component */}
      <DataSearchFilter data={data} onFilteredData={handleFilteredData} />

      <div className="overflow-x-auto border border-gray-200 rounded-lg card-enhanced">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {displayData.headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    {getSortIcon(header)}
                  </div>
                  <span className="ml-1 text-xs text-gray-400 block">
                    ({displayData.columns.find(c => c.name === header)?.type})
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {displayData.headers.map((header) => (
                  <td key={header} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {editingCell?.row === rowIndex && editingCell?.col === header ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCellSave();
                          if (e.key === 'Escape') handleCellCancel();
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(rowIndex, header, String(row[header] || ''))}
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        {String(row[header] || '')}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {displayData.data.length} of {data.data.length} rows, {displayData.headers.length} columns
      </div>
    </div>
  );
}
