declare global {
  interface Window {
    ai?: {
      languageModel: {
        capabilities: () => Promise<{ 
          available: string;
          defaultTemperature?: number;
          defaultTopK?: number;
          maxTopK?: number;
        }>;
        create: (options: { systemPrompt: string }) => Promise<{
          prompt: (input: string) => Promise<string>;
          promptStreaming: (input: string) => AsyncGenerator<string>;
        }>;
      };
    };
  }
}

export {}; 