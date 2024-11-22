import { useCallback } from 'react';
import { aiService } from '@/services/ai';

export const useTextModification = () => {
  const modifyText = useCallback(async (option: string, text: string) => {
    const prompts = {
      improve: `Improve this text. Only provide the improved version, no explanations: "${text}"`,
      grammar: `Fix grammar and spelling. Only provide the corrected version, no explanations: "${text}"`,
      longer: `Make this text longer. Only provide the expanded version, no explanations: "${text}"`,
      shorter: `Make this text shorter. Only provide the shortened version, no explanations: "${text}"`,
      simplify: `Simplify this text. Only provide the simplified version, no explanations: "${text}"`,
      rephrase: `Rephrase this text. Only provide the rephrased version, no explanations: "${text}"`,
      continue: `Continue this text. Only provide the continuation, no explanations: "${text}"`,
      summarize: `Summarize this text. Only provide the summary, no explanations: "${text}"`,
      chat: text
    };

    const prompt = prompts[option as keyof typeof prompts];
    return aiService.streamMessage(prompt);
  }, []);

  return { modifyText };
}; 