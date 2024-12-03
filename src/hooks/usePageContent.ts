import { useState } from 'react';

export const usePageContent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getPageContent = () => {
    // Get all text nodes from the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip hidden elements
          const element = node.parentElement;
          if (!element) return NodeFilter.FILTER_REJECT;
          
          // Skip if element or any parent is hidden
          let current = element;
          while (current) {
            const style = window.getComputedStyle(current);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            current = current.parentElement;
            if (!current) break;
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

    // Join all text nodes and clean up
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

  return {
    getPageContent,
    isLoading
  };
}; 