
// src/components/ResultCard.tsx
import React from 'react';
import { PageContent } from '@/services/storage/database';
import { BookmarkIcon } from '@heroicons/react/24/solid';

interface ResultCardProps {
  result: PageContent;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <a 
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-blue-600 hover:underline"
          >
            {result.title}
          </a>
          <p className="text-sm text-gray-500 mt-1">
            {new URL(result.url).hostname}
          </p>
        </div>
        {result.isBookmark && (
          <BookmarkIcon className="h-5 w-5 text-blue-500" />
        )}
      </div>
      {result.summary && (
        <p className="mt-3 text-gray-700">
          {result.summary}
        </p>
      )}
      <div className="mt-3 text-sm text-gray-500">
        {new Date(result.timestamp).toLocaleDateString()}
      </div>
    </div>
  );
};