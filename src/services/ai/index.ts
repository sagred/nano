export interface AIMessage {
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
  }
  
  export class AIService {
    private session: any = null;
  
    async initialize() {
      if (!this.session) {
        try {
          if (!window.ai) {
            throw new Error('AI service not available');
          }
          const capabilities = await window.ai.languageModel.capabilities();
          if (capabilities.available === "readily") {
            this.session = await window.ai.languageModel.create({
              systemPrompt: `You are a bookmark organization assistant. When organizing bookmarks:
              1. Create clear, logical categories using ## headers (e.g., ## Development, ## AI & Machine Learning)
              2. Keep categories focused and specific
              3. Format each bookmark as a markdown link: - [Title](URL)
              4. Group similar items together
              5. Keep the response clean and well-formatted
              6. Limit to 5-7 main categories
              7. Sort items within categories alphabetically`
            });
          }
        } catch (error) {
          console.error('Error initializing AI:', error);
          throw error;
        }
      }
    }
  
    async* streamMessage(message: string): AsyncGenerator<string> {
      await this.initialize();
      if (!this.session) {
        throw new Error('AI service not available');
      }
      try {
        const stream = await this.session.promptStreaming(message);
        let previousContent = '';
        
        for await (const chunk of stream) {
          // Get only the new content by removing the previous content
          const newContent = chunk.replace(previousContent, '');
          previousContent = chunk;
          
          // Only yield if there's new content
          if (newContent.trim()) {
            yield newContent;
          }
        }
      } catch (error) {
        console.error('Error streaming AI response:', error);
        throw error;
      }
    }
  }
  
  export const aiService = new AIService();