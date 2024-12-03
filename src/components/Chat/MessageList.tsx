// src/components/Chat/MessageList.tsx
import React, { useRef, useEffect, useState } from 'react';
import { AIMessage } from '@/services/ai';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ChevronDown, Copy, RefreshCw } from 'lucide-react';

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
      <div className="message-container">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`message-block ${message.role}`}
          >
            <div className="message-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {isLoading && index === messages.length - 1 && 
               message.role === 'assistant' && (
                <span className="inline-flex gap-1 mt-2 text-primary/70">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse delay-100">●</span>
                  <span className="animate-pulse delay-200">●</span>
                </span>
              )}
            </div>
            {message.role === 'assistant' && !isLoading && (
              <div className="action-buttons">
                <button className="action-button">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button 
                  className="action-button"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-24 right-6 rounded-full shadow-lg 
                   bg-background/80 backdrop-blur-sm border border-border/20"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

