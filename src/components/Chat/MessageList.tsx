// src/components/Chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { AIMessage } from '@/services/ai';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: AIMessage[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <div
          key={`${message.timestamp}-${index}`}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-100'
            }`}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {isLoading && index === messages.length - 1 && message.role === 'assistant' && (
              <span className="inline-flex ml-1">
                <span className="animate-pulse text-indigo-400">●</span>
                <span className="animate-pulse text-indigo-400 delay-100">●</span>
                <span className="animate-pulse text-indigo-400 delay-200">●</span>
              </span>
            )}
            <span className="text-[10px] opacity-70 mt-1 block text-slate-300">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

