'use client';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'chart' | 'button';
  lines?: number;
}

export default function LoadingSkeleton({ type = 'card', lines = 3 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return (
          <div className="animate-pulse">
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              {/* Rows skeleton */}
              {[...Array(lines)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        );

      default: // card
        return (
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                {[...Array(lines)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      {renderSkeleton()}
    </div>
  );
}
