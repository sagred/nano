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
              systemPrompt: `You are a bookmark analysis assistant. When analyzing bookmarks:
              1. Provide clear, concise summaries of webpage content
              2. Highlight key points and main topics
              3. Explain why the content might be valuable
              4. Use markdown formatting for better readability
              5. If technical content, explain key concepts
              6. Include relevant quotes if available`
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