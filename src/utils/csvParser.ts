import Papa from 'papaparse';
import { DataPoint, ParsedData, ColumnInfo, SortConfig } from '@/types';

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }

        const data = results.data as DataPoint[];
        const headers = results.meta.fields || [];
        const columns = inferColumnTypes(data, headers);

        resolve({
          data,
          columns,
          headers,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

function inferColumnTypes(data: DataPoint[], headers: string[]): ColumnInfo[] {
  return headers.map((header, index) => {
    const sampleValues = data
      .slice(0, Math.min(10, data.length))
      .map((row) => row[header])
      .filter((value) => value !== null && value !== undefined && value !== '');

    let type: 'numeric' | 'categorical' | 'date' = 'categorical';

    if (sampleValues.length > 0) {
      // Check if all values are numbers
      const allNumeric = sampleValues.every((value) => {
        const num = Number(value);
        return !isNaN(num) && isFinite(num);
      });

      if (allNumeric) {
        type = 'numeric';
      } else {
        // Check if all values are dates
        const allDates = sampleValues.every((value) => {
          const date = new Date(value as string);
          return !isNaN(date.getTime());
        });

        if (allDates) {
          type = 'date';
        }
      }
    }

    return {
      name: header,
      type,
      index,
    };
  });
}

export function validateCSV(data: ParsedData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.data.length === 0) {
    errors.push('CSV file is empty or contains no valid data');
  }

  if (data.headers.length === 0) {
    errors.push('CSV file has no headers');
  }

  // Check for completely empty columns
  const emptyColumns = data.columns.filter((col) => {
    const values = data.data.map((row) => row[col.name]);
    return values.every((value) => value === null || value === undefined || value === '');
  });

  if (emptyColumns.length > 0) {
    errors.push(`Empty columns detected: ${emptyColumns.map((col) => col.name).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sortData(data: ParsedData, sortConfig: SortConfig): ParsedData {
  const { column, direction } = sortConfig;
  const columnInfo = data.columns.find(col => col.name === column);
  
  if (!columnInfo) {
    return data; // Return original data if column not found
  }

  const sortedData = [...data.data].sort((a, b) => {
    const aValue = a[column];
    const bValue = b[column];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined || aValue === '') {
      return direction === 'asc' ? -1 : 1;
    }
    if (bValue === null || bValue === undefined || bValue === '') {
      return direction === 'asc' ? 1 : -1;
    }

    // Sort based on column type
    if (columnInfo.type === 'numeric') {
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    } else if (columnInfo.type === 'date') {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    } else {
      // Categorical (string) sorting
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    }
  });

  return {
    ...data,
    data: sortedData,
  };
}
