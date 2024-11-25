import { useState, useEffect } from 'react';
import { CustomInstruction } from '@/types/instructions';
import { instructionsDb } from '@/services/storage/instructions';

export const useCustomInstructions = () => {
  const [customInstructions, setCustomInstructions] = useState<CustomInstruction[]>([]);

  const loadInstructions = async () => {
    const instructions = await instructionsDb.getAllInstructions();
    setCustomInstructions(instructions);
  };

  useEffect(() => {
    loadInstructions();
    
    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.instructions) {
        setCustomInstructions(changes.instructions.newValue || []);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.local.onChanged.removeListener(handleStorageChange);
  }, []);

  return {
    customInstructions,
    refreshInstructions: loadInstructions
  };
}; 