// src/hooks/useChat.ts
import { useState, useEffect } from 'react';
import { aiService, AIMessage } from '@/services/ai';
import { bookmarkService, Bookmark } from '@/services/bookmarks';
import { fetchPageContent } from '@/utils/fetchContent';

export const useChat = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);
      try {
        const results = await bookmarkService.getBookmarks();
        setBookmarks(results.filter(b => b.title && b.url));
        
        const aiMessage: AIMessage = {
          content: "Here are your bookmarks. Click on one to learn more about it:",
          role: 'assistant',
          timestamp: Date.now()
        };
        
        setMessages([aiMessage]);
      } catch (err) {
        setError('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const analyzeBookmark = async (bookmark: Bookmark) => {
    setIsLoading(true);
    
    const userMessage: AIMessage = {
      content: `Tell me about: ${bookmark.title}`,
      role: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const pageContent = await fetchPageContent(bookmark.url);
      
      const prompt = `
        Analyze this bookmark and provide useful information about it.
        
        Title: ${bookmark.title}
        URL: ${bookmark.url}
        
        Page Content:
        ${pageContent}
        
        Please provide:
        1. A brief summary of what this page is about
        2. Key points or main topics covered
        3. Why this might be useful or interesting
      `;

      const stream = aiService.streamMessage(prompt);
      
      const aiMessage: AIMessage = {
        content: '',
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = {
      content,
      role: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const stream = aiService.streamMessage(content);
      const aiMessage: AIMessage = {
        content: '',
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    bookmarks,
    analyzeBookmark,
    sendMessage
  };
};