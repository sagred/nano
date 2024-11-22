import { TextOptions } from '@/components/ContextMenu/TextOptions';
import React from 'react';
import { createRoot } from 'react-dom/client';

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
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  .modal-content {
    position: relative;
    width: 600px;
    height: 400px;
    background: #18181B;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  });
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
`;

shadowRoot.appendChild(style);
const rootContainer = document.createElement('div');
shadowRoot.appendChild(rootContainer);
document.body.appendChild(container);

const root = createRoot(rootContainer);

const showTextOptions = () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  
  if (text) {
    console.log('Showing text options menu');
    
    root.render(
      React.createElement(TextOptions, {
        selectedText: text,
        onClose: () => root.render(null)
      })
    );
  }
};

// Listen for keyboard shortcut
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
    console.log('Keyboard shortcut detected');
    e.preventDefault();
    showTextOptions();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received:', message);
  if (message.type === "SHOW_TEXT_OPTIONS") {
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