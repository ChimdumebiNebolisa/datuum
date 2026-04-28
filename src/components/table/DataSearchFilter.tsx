'use client';

import { useState } from 'react';
import { ParsedData } from '@/types';

interface DataSearchFilterProps {
  data: ParsedData;
  onFilteredData: (filteredData: ParsedData) => void;
}

export default function DataSearchFilter({ data, onFilteredData }: DataSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterData(term, selectedColumn, sortBy);
  };

  const handleColumnFilter = (column: string) => {
    setSelectedColumn(column);
    filterData(searchTerm, column, sortBy);
  };

  const handleSort = (column: string) => {
    setSortBy(column);
    filterData(searchTerm, selectedColumn, column);
  };

  const filterData = (search: string, column: string, sort: string) => {
    let filteredData = [...data.data];

    // Apply search filter
    if (search.trim()) {
      filteredData = filteredData.filter(row => {
        if (column === 'all') {
          return Object.values(row).some(value => 
            String(value).toLowerCase().includes(search.toLowerCase())
          );
        } else {
          return String(row[column] || '').toLowerCase().includes(search.toLowerCase());
        }
      });
    }

    // Apply sorting
    if (sort) {
      const columnInfo = data.columns.find(col => col.name === sort);
      filteredData.sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];

        if (columnInfo?.type === 'numeric') {
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          return aNum - bNum;
        } else {
          return String(aValue || '').localeCompare(String(bValue || ''));
        }
      });
    }

    onFilteredData({
      ...data,
      data: filteredData
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedColumn('all');
    setSortBy('');
    onFilteredData(data);
  };

  const hasActiveFilters = searchTerm || selectedColumn !== 'all' || sortBy;

  return (
    <div className="bg-white p-4 rounded-lg border mb-4 card-enhanced">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Data
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search in data..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Column Filter */}
        <div className="sm:w-48">
          <label htmlFor="column" className="block text-sm font-medium text-gray-700 mb-1">
            Search in Column
          </label>
          <select
            id="column"
            value={selectedColumn}
            onChange={(e) => handleColumnFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Columns</option>
            {data.headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="sm:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No sorting</option>
            {data.headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Search: &quot;{searchTerm}&quot;
            </span>
          )}
          {selectedColumn !== 'all' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Column: {selectedColumn}
            </span>
          )}
          {sortBy && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Sorted by: {sortBy}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
