import { TextOptions } from '@/components/ContextMenu/TextOptions';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { PageContent } from '@/types/pageContent';

console.log('Content script loaded');

const container = document.createElement('div');
container.id = 'text-modifier-extension-root';
// Create a shadow root for style isolation
const shadowRoot = container.attachShadow({ mode: 'open' });

// Add isolated styles
const style = document.createElement('style');
style.textContent = `
  .modal-container {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    isolation: isolate;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
  }
  .modal-content {
    position: relative;
    width: 700px;
    min-height: 400px;
    max-height: 600px;
    background: #18181B;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    line-height: 1.5;
    color: #f4f4f5;
    border: 1px solid rgba(255, 255, 255, 0.2);

  }
  * {
    font-family: inherit;
  }
  input, button {
    font-family: inherit;
    font-size: inherit;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes iconPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .option-button:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .action-button:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    height: 20px;
  }

  .loading-dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #22c55e;
    display: inline-block;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 
    40% { 
      transform: scale(1);
    }
  }
`;

shadowRoot.appendChild(style);
const rootContainer = document.createElement('div');
shadowRoot.appendChild(rootContainer);
document.body.appendChild(container);

const root = createRoot(rootContainer);

const showTextOptions = () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  
  root.render(
    React.createElement(TextOptions, {
      selectedText: text || undefined,
      onClose: () => root.render(null)
    })
  );
};

// Listen for keyboard shortcut
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
    console.log('Keyboard shortcut detected');
    e.preventDefault();
    showTextOptions();
  }
});

const handleOptionSelect = async (option: string, text: string) => {
  const response = await chrome.runtime.sendMessage({
    type: "MODIFY_TEXT",
    payload: { option, text }
  });
  
  if (response.success) {
    return response.modifiedText;
  } else {
    throw new Error('Failed to modify text');
  }
};

// Update the getMainPageContent function with proper type handling
const getMainPageContent = (): PageContent => {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const element = node.parentElement;
        if (!element) return NodeFilter.FILTER_REJECT;
        
        // Skip if element or any parent is hidden
        let current: HTMLElement | null = element;
        while (current) {
          const style = window.getComputedStyle(current);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          current = current.parentElement;
        }

        // Skip common non-content elements
        const tagName = element.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip elements with specific classes/ids
        const classAndId = `${element.className} ${element.id}`.toLowerCase();
        if (classAndId.match(/menu|nav|footer|header|sidebar|comment|ad/)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Accept if text content is meaningful
        const text = node.textContent?.trim() || '';
        return text.length > 20 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const textNodes: string[] = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node.textContent?.trim() || '');
  }

  return {
    content: textNodes
      .join('\n')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .slice(0, 12000),
    title: document.title,
    url: window.location.href
  };
};

// Consolidate all message listeners into one
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message.type);
  
  switch (message.type) {
    case "SHOW_TEXT_OPTIONS":
      showTextOptions();
      return false; // No response needed
      
    case "GET_PAGE_CONTENT":
      try {
        // Execute and respond synchronously
        const pageContent = getMainPageContent();
        console.log('Extracted page content:', pageContent);
        sendResponse({
          success: true,
          data: pageContent
        });
      } catch (error) {
        console.error('Error extracting content:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to extract content'
        });
      }
      return true; // Keep channel open for async response
      
    default:
      return false;
  }
});