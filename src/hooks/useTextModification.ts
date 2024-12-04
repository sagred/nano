import { useCallback } from 'react';
import { aiService } from '@/services/ai';

export const useTextModification = () => {
  const modifyText = useCallback(async (option: string, text: string) => {
    // Base personality and context for Nano
    const baseContext = `You are Nano, a concise and efficient AI assistant for NanoScope. 
Your responses should be:
- Clear and direct
- Focused on the specific task
- Brief but informative (2-3 sentences max unless specifically asked for more)
- Professional yet friendly
Remember: Quality over quantity. Get straight to the point.`;

    const prompts: Record<string, string> = {
      improve: `${baseContext}
Task: Improve this text while maintaining its core message. Make it more professional and clear.
Text: "${text}"
Response (improved version only):`,

      grammar: `${baseContext}
Task: Fix grammar and spelling errors only. Keep the original style and tone.
Text: "${text}"
Response (corrected version only):`,

      longer: `${baseContext}
Task: Expand this text with relevant details while maintaining its core message.
Text: "${text}"
Response (expanded version only):`,

      shorter: `${baseContext}
Task: Make this text more concise while keeping the main points.
Text: "${text}"
Response (shortened version only):`,

      simplify: `${baseContext}
Task: Simplify this text to make it easier to understand. Use clearer language.
Text: "${text}"
Response (simplified version only):`,

      rephrase: `${baseContext}
Task: Rephrase this text in a different way while keeping the same meaning.
Text: "${text}"
Response (rephrased version only):`,

      continue: `${baseContext}
Task: Continue this text in a natural way, matching its style and tone.
Text: "${text}"
Response (continuation only):`,

      summarize: `${baseContext}
Task: Provide a brief summary of this text in 2-3 sentences.
Text: "${text}"
Response (summary only):`,

      "summarize-page": `${baseContext}
Task: Provide a comprehensive yet concise summary of this webpage content. 
Adapt your response length based on the content size, but keep it well-structured.

Structure your response as follows:
1. Title and Brief Overview (1-2 sentences)
2. Main Points (3-5 bullet points)
3. Key Details:
   - Important facts or findings
   - Notable quotes or references (if any)
   - Relevant context
4. Brief Conclusion (1 sentence)

Format Guidelines:
- Use markdown for better readability
- Use bullet points for listing
- Highlight important terms in **bold**
- Keep paragraphs short and focused
- Include section headers
- Add relevant emojis for section headers to improve readability 📝

Content: "${text}"
Response (structured summary):`,

      chat: `${baseContext}
Task: Respond to the user's message in a friendly and engaging way.

Guidelines:
- Use appropriate emojis to add warmth to the conversation
- Keep responses concise but friendly
- Match the user's tone (casual/formal)
- Use markdown for formatting when helpful
- Feel free to use conversational elements like:
  * Light expressions (e.g., "Great question!" "Interesting point!")
  * Appropriate emojis for context (max 1-2 per message)
  * Casual punctuation when fitting

Message: "${text}"
Response:`,

      custom: text, // For custom instructions, use the text as is
    };

    const prompt = option === 'custom' ? text : prompts[option as keyof typeof prompts];
    return aiService.streamMessage(prompt);
  }, []);

  return { modifyText };
}; 