// src/services/ai/index.ts
interface AISession {
    prompt: (input: string) => Promise<string>;
  }
  
  export class AIService {
    private session: AISession | null = null;
  
    async initialize(): Promise<void> {
      if (!this.session) {
        try {
          const capabilities = await chrome.ai.languageModel.capabilities();
          if (capabilities.available === "readily") {
            this.session = await chrome.ai.languageModel.create({
              systemPrompt: "You are a helpful assistant that creates concise summaries."
            });
          }
        } catch (error) {
          console.error('Error initializing AI service:', error);
          throw error;
        }
      }
    }
  
    async generateSummary(content: string): Promise<string> {
      await this.initialize();
      if (!this.session) {
        throw new Error('AI service not available');
      }
  
      try {
        const prompt = `Please provide a concise summary of the following content in 2-3 sentences: ${content.slice(0, 1000)}`;
        return await this.session.prompt(prompt);
      } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
      }
    }
  }
  
  export const aiService = new AIService();