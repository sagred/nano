import { aiService } from '@/services/ai';

console.log('Background script loaded');

// Function to check if side panel API is available
const isSidePanelAvailable = () => {
  return chrome?.sidePanel && typeof chrome.sidePanel.open === 'function';
};

// Initialize side panel when extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  if (!isSidePanelAvailable()) {
    console.error('Side Panel API not available');
    return;
  }

  try {
    await chrome.sidePanel.setOptions({
      path: 'src/sidepanel.html',
      enabled: true
    });
    console.log('Side panel initialized successfully');
  } catch (error) {
    console.error('Failed to initialize side panel:', error);
  }
});

// Handle clicking the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !isSidePanelAvailable()) return;
  
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    console.log('Side panel opened successfully');
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});

// Existing code remains the same
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
Task: Provide a concise summary of this webpage content. Structure it as follows:
1. One-sentence overview
2. 3-4 key points in bullet form
3. Brief conclusion

Content: "${text}"
Response (structured summary only):`,

    chat: `${baseContext}
Task: Respond to the user's message directly and concisely.
Message: "${text}"
Response:`,

    custom: text, // For custom instructions, use the text as is
  };

  return prompts[option] || prompts.improve;
}