'use client';

interface ErrorWithSuggestionsProps {
  error: string;
  onRetry?: () => void;
  suggestions?: string[];
}

export default function ErrorWithSuggestions({ 
  error, 
  onRetry, 
  suggestions = [] 
}: ErrorWithSuggestionsProps) {
  const defaultSuggestions = [
    'Check your CSV format and ensure it has headers',
    'Ensure file size is under 5MB',
    'Verify the file contains valid data (no empty rows)',
    'Try using a different browser or clearing cache',
    'Make sure you\'re uploading a .csv file'
  ];

  const finalSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 animate-fade-in-up">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-lg">⚠️</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          
          <div className="bg-red-100 rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Try these solutions:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {finalSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <div className="flex space-x-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors hover-lift"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
