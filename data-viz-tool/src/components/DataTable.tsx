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
    
    const sortedData = sortData(displayData, newSortConfig);
    setDisplayData(sortedData);
  };

  const getSortIcon = (columnName: string) => {
    if (sortConfig?.column !== columnName) {
      return <span className="text-gray-400 ">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span className="text-blue-500 ">↑</span> : <span className="text-blue-500 ">↓</span>;
  };

  const clearSort = () => {
    setSortConfig(null);
    setDisplayData(data);
  };

  const handleFilteredData = (filteredData: ParsedData) => {
    setDisplayData(filteredData);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 ">Data Table</h3>
        <div className="flex items-center space-x-3">
          {sortConfig && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600 ">
                Sorted by: <span className="font-medium text-gray-900 ">{sortConfig.column}</span> ({sortConfig.direction})
              </div>
              <button
                onClick={clearSort}
                className="px-2 py-1 text-xs text-gray-500  hover:text-gray-700  border border-gray-300  rounded hover:bg-gray-50  transition-colors"
                title="Clear sorting"
              >
                Clear
              </button>
            </div>
          )}
          <button
            onClick={addRow}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 hover-lift transition-colors"
          >
            Add Row
          </button>
        </div>
      </div>

      {/* Search and Filter Component */}
      <DataSearchFilter data={data} onFilteredData={handleFilteredData} />

      {/* Sort Controls */}
      <div className="mb-4 p-4 bg-gray-50  rounded-lg border border-gray-200 ">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 ">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {displayData.headers.map((header) => (
              <div key={header} className="flex items-center gap-1">
                <span className="text-xs text-gray-600 ">{header}:</span>
                <button
                  onClick={() => handleSort(header)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortConfig?.column === header && sortConfig?.direction === 'asc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200  text-gray-700  hover:bg-gray-300 '
                  }`}
                  title={`Sort ${header} ascending`}
                >
                  ↑ Asc
                </button>
                <button
                  onClick={() => {
                    if (sortConfig?.column === header && sortConfig?.direction === 'asc') {
                      handleSort(header); // This will toggle to desc
                    } else {
                      const newSortConfig = { column: header, direction: 'desc' as const };
                      setSortConfig(newSortConfig);
                      const sortedData = sortData(displayData, newSortConfig);
                      setDisplayData(sortedData);
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortConfig?.column === header && sortConfig?.direction === 'desc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200  text-gray-700  hover:bg-gray-300 '
                  }`}
                  title={`Sort ${header} descending`}
                >
                  ↓ Desc
                </button>
              </div>
            ))}
            {sortConfig && (
              <button
                onClick={clearSort}
                className="px-3 py-1 text-xs bg-red-100  text-red-700  rounded hover:bg-red-200  transition-colors"
                title="Clear all sorting"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        {sortConfig && (
          <div className="mt-2 text-xs text-gray-600 ">
            Currently sorted by: <span className="font-medium text-gray-900 ">{sortConfig.column}</span> ({sortConfig.direction})
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200  rounded-lg card-enhanced">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-100 ">
            <tr>
              {displayData.headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider cursor-pointer hover:bg-gray-200  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  onClick={() => handleSort(header)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(header);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    {getSortIcon(header)}
                  </div>
                  <span className="ml-1 text-xs text-gray-400  block">
                    ({displayData.columns.find(c => c.name === header)?.type})
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white  divide-y divide-gray-200 ">
            {displayData.data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50  transition-colors">
                {displayData.headers.map((header) => (
                  <td key={header} className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 ">
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
                        className="w-full px-2 py-1 border border-gray-300  rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white  text-gray-800 "
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(rowIndex, header, String(row[header] || ''))}
                        className="cursor-pointer hover:bg-gray-100  px-2 py-1 rounded"
                      >
                        {String(row[header] || '')}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 ">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="text-red-600 hover:text-red-800   font-medium transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-sm text-gray-500 ">
        {displayData.data.length} of {data.data.length} rows, {displayData.headers.length} columns
      </div>
    </div>
  );
}
