'use client';

import { useEffect } from 'react';

interface FileTypePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileTypePopup({ isOpen, onClose }: FileTypePopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in-up">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">😊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sorry, only CSVs are allowed! 😊
          </h3>
          <p className="text-gray-600 mb-4">
            Please upload a CSV file to create beautiful data visualizations.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
