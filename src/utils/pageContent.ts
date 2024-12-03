export function getPageContent(): string {
  // Try to find the main content
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.main-content',
    '#main-content',
    '.post-content',
    '.article-content',
    '.content',
    '#content'
  ];

  let content = '';
  
  // Try each selector
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Remove any hidden elements
      const hiddenElements = element.querySelectorAll('[hidden], [style*="display: none"]');
      hiddenElements.forEach(el => el.remove());
      
      content = element.textContent || '';
      break;
    }
  }

  // If no main content found, use body content
  if (!content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = document.body.innerHTML;
    
    // Remove non-content elements
    const elementsToRemove = tempDiv.querySelectorAll(
      'script, style, nav, header, footer, iframe, noscript, [hidden], ' +
      '[aria-hidden="true"], .nav, .header, .footer, .menu, .sidebar, ' +
      '.advertisement, .ad, .social-share, .comments'
    );
    elementsToRemove.forEach(el => el.remove());
    
    content = tempDiv.textContent || '';
  }

  // Clean up the content
  return content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .replace(/[^\S\n]+/g, ' ') // Replace multiple spaces (but not newlines) with single space
    .trim()
    .slice(0, 12000); // Increased limit for better context
} 