// src/hooks/useAI.ts
import { useState, useEffect } from 'react';

export const useAI = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAI = async () => {
      try {
        if (!window.ai) {
          setIsAvailable(false);
          return;
        }
        const capabilities = await window.ai.languageModel.capabilities();
        setIsAvailable(capabilities.available === "readily");
        console.log('AI capabilities:', capabilities);
      } catch (error) {
        console.error('AI not available:', error);
        setIsAvailable(false);
      }
    };

    checkAI();
  }, []);

  return { isAvailable };
};