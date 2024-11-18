// src/components/ResultCard.tsx
import React from 'react';
import { PageContent } from '@/services/storage/database';
import { BookmarkIcon } from '@heroicons/react/24/solid';

interface ResultCardProps {
  result: PageContent;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <a 
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-blue-400 hover:text-blue-300"
          >
            {result.title}
          </a>
          <p className="text-sm text-slate-400 mt-1">
            {new URL(result.url).hostname}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {result.relevanceScore && (
            <span className="text-sm text-slate-400">
              {Math.round(result.relevanceScore * 100)}% match
            </span>
          )}
          <BookmarkIcon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
    </div>
  );
};