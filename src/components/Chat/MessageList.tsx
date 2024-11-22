// src/components/Chat/MessageList.tsx
import React, { useRef, useEffect, useState } from 'react';
import { AIMessage } from '@/services/ai';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface MessageListProps {
  messages: AIMessage[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const scrollContainer = document.getElementById('chat-scroll-container');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setShowScrollButton(!isAtBottom);
      setScrollPosition(scrollTop + clientHeight - 100);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
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
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <div 
          style={{ 
            position: 'absolute',
            top: `${scrollPosition}px`,
            right: '1.5rem',
          }}
        >
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg opacity-90 hover:opacity-100"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

