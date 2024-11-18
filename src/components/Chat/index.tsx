// src/components/Chat/index.tsx
import React, { useState } from 'react';
import { MessageList } from './MessageList';
//import { MessageInput } from './MessageInput';
import { BookmarkList } from './BookmarkList';
import { useChat } from '@/hooks/useChat';
import { SearchBar } from '@/components/SearchBar';
import { useSimilaritySearch } from '@/hooks/useSimilaritySearch';
import { useBookmarkProcessor } from '@/hooks/useBookmarkProcessor';
import { ResultCard } from '../ResultCard';

export const Chat: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { messages, isLoading, error, bookmarks, analyzeBookmark } = useChat();
  const { results, loading: searchLoading, searchContent } = useSimilaritySearch();
  const { isProcessing, progress } = useBookmarkProcessor();

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <SearchBar 
          value={searchQuery} 
          onChange={(value) => {
            setSearchQuery(value);
            searchContent(value);
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          {isProcessing && (
            <div className="p-4 text-slate-300">
              Processing bookmarks... {Math.round(progress)}%
            </div>
          )}
          {searchLoading ? (
            <div className="p-4 text-slate-300">Searching...</div>
          ) : searchQuery && results.length > 0 ? (
            <div className="grid gap-4 p-4">
              {results.map(result => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-slate-300">No results found</div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              {messages.length === 1 && (
                <BookmarkList bookmarks={bookmarks} onSelect={analyzeBookmark} />
              )}
            </>
          )}
          {error && (
            <div className="p-4 mx-4 my-2 text-red-400 text-sm bg-red-900/50 rounded-lg border border-red-700">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};