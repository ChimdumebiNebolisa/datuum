'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ParsedData } from '@/types';
import { parseCSV, validateCSV } from '@/utils/csvParser';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onDataParsed, onError }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      try {
        const parsedData = await parseCSV(file);
        const validation = validateCSV(parsedData);

        if (!validation.isValid) {
          onError(validation.errors.join(', '));
          return;
        }

        onDataParsed(parsedData);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to parse CSV file');
      } finally {
        setIsLoading(false);
      }
    },
    [onDataParsed, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">📊</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isLoading ? 'Processing...' : 'Upload your CSV file'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a CSV file here, or click to select'}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Supports files up to 5MB
          </div>
        </div>
      </div>
    </div>
  );
}
