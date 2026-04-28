'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ParsedData } from '@/types';
import { parseFile, getSheetNames } from '@/parsers';
import { validateCSV } from '@/parsers/csvParser';
import SheetSelector from './SheetSelector';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
  onError: (error: string) => void;
}

type UploadState = 'idle' | 'loading' | 'selecting-sheet';

export default function FileUpload({ onDataParsed, onError }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [showBadType, setShowBadType] = useState(false);

  const processFile = useCallback(
    async (file: File, sheetName?: string) => {
      setUploadState('loading');
      try {
        const parsed = await parseFile(file, { sheetName });
        const validation = validateCSV(parsed);
        if (!validation.isValid) {
          onError(validation.errors.join(' • '));
          setUploadState('idle');
          return;
        }
        onDataParsed(parsed);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to parse file');
        setUploadState('idle');
      }
    },
    [onDataParsed, onError]
  );

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setUploadState('loading');
      try {
        const sheetList = await getSheetNames(file);

        // CSV always returns ['Sheet1'] — skip sheet selection
        if (sheetList.length <= 1) {
          await processFile(file);
        } else {
          // Multiple XLSX sheets — ask user to pick
          setPendingFile(file);
          setSheets(sheetList);
          setUploadState('selecting-sheet');
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to read file');
        setUploadState('idle');
      }
    },
    [processFile, onError]
  );

  const handleSheetSelect = async (sheet: string) => {
    if (!pendingFile) return;
    setUploadState('loading');
    await processFile(pendingFile, sheet);
    setPendingFile(null);
    setSheets([]);
  };

  const handleSheetCancel = () => {
    setPendingFile(null);
    setSheets([]);
    setUploadState('idle');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => setShowBadType(true),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls', '.csv'],
    },
    multiple: false,
    disabled: uploadState !== 'idle',
  });

  const isLoading = uploadState === 'loading';

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
            ${isLoading ? 'opacity-60 cursor-wait pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="text-5xl">{isLoading ? '⏳' : '📂'}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {isLoading ? 'Processing...' : isDragActive ? 'Drop it here' : 'Upload a file'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isLoading
                  ? 'Parsing your file, please wait'
                  : 'Drag & drop, or click to browse'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <span className="px-2 py-1 bg-gray-100 rounded font-mono">.csv</span>
              <span className="px-2 py-1 bg-gray-100 rounded font-mono">.xlsx</span>
              <span className="px-2 py-1 bg-gray-100 rounded font-mono">.xls</span>
              <span className="text-gray-300">•</span>
              <span>up to 10 MB</span>
            </div>
          </div>
        </div>

        {showBadType && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>
              Unsupported file type. Please upload a <strong>.csv</strong>, <strong>.xlsx</strong>, or <strong>.xls</strong> file.
              <button className="ml-2 underline" onClick={() => setShowBadType(false)}>Dismiss</button>
            </span>
          </div>
        )}
      </div>

      {uploadState === 'selecting-sheet' && pendingFile && (
        <SheetSelector
          sheets={sheets}
          filename={pendingFile.name}
          onSelect={handleSheetSelect}
          onCancel={handleSheetCancel}
        />
      )}
    </>
  );
}
