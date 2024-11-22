import { aiService } from '@/services/ai';

console.log('Background script loaded')

export {}

chrome.commands.onCommand.addListener((command) => {
  if (command === "show-text-options") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { type: "SHOW_TEXT_OPTIONS" });
    });
  }
});

// Handle text modification requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "MODIFY_TEXT") {
    const { option, text } = message.payload;
    
    (async () => {
      try {
        const stream = aiService.streamMessage(getPromptForOption(option, text));
        let fullResponse = '';
        
        for await (const chunk of stream) {
          fullResponse += chunk;
          // Send each chunk back to content script
          chrome.tabs.sendMessage(sender.tab!.id!, {
            type: "STREAM_CHUNK",
            payload: chunk
          });
        }
        
        sendResponse({ success: true, modifiedText: fullResponse });
      } catch (error) {
        sendResponse({ success: false, error: 'Failed to modify text' });
      }
    })();
    
    return true; // Keep the message channel open for async response
  }
});

function getPromptForOption(option: string, text: string): string {
  const prompts: Record<string, string> = {
    improve: `Improve this text. Only provide the improved version, no explanations: "${text}"`,
    grammar: `Fix grammar and spelling. Only provide the corrected version, no explanations: "${text}"`,
    longer: `Make this text longer. Only provide the expanded version, no explanations: "${text}"`,
    shorter: `Make this text shorter. Only provide the shortened version, no explanations: "${text}"`,
    simplify: `Simplify this text. Only provide the simplified version, no explanations: "${text}"`,
    rephrase: `Rephrase this text. Only provide the rephrased version, no explanations: "${text}"`,
    continue: `Continue this text. Only provide the continuation, no explanations: "${text}"`,
    summarize: `Summarize this text. Only provide the summary, no explanations: "${text}"`,
  };
  return prompts[option] || prompts.improve;
}