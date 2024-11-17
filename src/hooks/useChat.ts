// src/hooks/useChat.ts
import { useState } from 'react';
import { aiService, AIMessage } from '@/services/ai';

export const useChat = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: AIMessage = {
      content,
      role: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Create AI message with empty content
    const aiMessage: AIMessage = {
      content: '',
      role: 'assistant',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMessage]);

    try {
      const stream = aiService.streamMessage(content);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        // Add new chunk to full response
        fullResponse += chunk;
        
        // Update the AI message with the current complete response
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
    sendMessage
  };
};