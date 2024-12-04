// src/components/Chat/index.tsx
import React, { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { BookmarkList } from './BookmarkList';
import { useChat } from '@/hooks/useChat';
import { SearchBar } from '@/components/SearchBar';
import { useSimilaritySearch } from '@/hooks/useSimilaritySearch';
import { useBookmarkProcessor } from '@/hooks/useBookmarkProcessor';
import { ResultCard } from '../ResultCard';
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PageContent } from "@/services/storage/database";

export const Chat: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { messages, isLoading, error, bookmarks, analyzeBookmark, sendMessage } = useChat();
  const { results, loading: searchLoading, searchContent } = useSimilaritySearch();
  const { isProcessing, progress } = useBookmarkProcessor();

  const handleResultSelect = (result: PageContent) => {
    analyzeBookmark({
      id: result.id?.toString() || '',
      title: result.title,
      url: result.url,
      dateAdded: result.timestamp
    });
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-4 border-b border-[#27272a] bg-black">
        <SearchBar 
          value={searchQuery} 
          onChange={(value) => {
            setSearchQuery(value);
            searchContent(value);
          }}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto relative bg-black" id="chat-scroll-container">
          <div className="max-w-3xl mx-auto p-4 relative">
            {isProcessing && (
              <Progress value={progress} className="w-full mb-4" />
            )}
            {searchLoading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner className="h-6 w-6 text-[#22c55e]" />
              </div>
            ) : searchQuery && results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => (
                  <ResultCard 
                    key={result.id} 
                    result={result} 
                    onSelect={handleResultSelect}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState message="No results found" className="text-[#71717a]" />
            ) : (
              <div className="space-y-6">
                <MessageList messages={messages} isLoading={isLoading} />
                {messages.length === 1 && (
                  <div className="bg-black rounded-lg border border-[#27272a]">
                    <BookmarkList bookmarks={bookmarks} onSelect={analyzeBookmark} />
                  </div>
                )}
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4 bg-black border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
      {!searchQuery && <MessageInput onSendMessage={sendMessage} disabled={isLoading} />}
    </div>
  );
};