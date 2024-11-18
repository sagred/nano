// src/components/Chat/index.tsx
import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { BookmarkList } from './BookmarkList';
import { useChat } from '@/hooks/useChat';

export const Chat: React.FC = () => {
  const { messages, isLoading, error, bookmarks, analyzeBookmark, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          <MessageList messages={messages} isLoading={isLoading} />
          {messages.length === 1 && (
            <BookmarkList bookmarks={bookmarks} onSelect={analyzeBookmark} />
          )}
          {error && (
            <div className="p-4 mx-4 my-2 text-red-400 text-sm bg-red-900/50 rounded-lg border border-red-700">
              Error: {error}
            </div>
          )}
        </div>
      </div>
      {messages.length > 1 && (
        <div className="border-t border-slate-700">
          <div className="max-w-3xl mx-auto w-full">
            <MessageInput 
              onSendMessage={sendMessage} 
              disabled={isLoading} 
            />
          </div>
        </div>
      )}
    </div>
  );
};