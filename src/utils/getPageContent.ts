export const getPageContent = () => {
  // Get the main content element
  const mainContent = document.querySelector('main, article, [role="main"], .main-content, #main-content') || document.body;
  
  // Create a clone to avoid modifying the original DOM
  const contentClone = mainContent.cloneNode(true) as HTMLElement;
  
  // Remove unwanted elements from the clone
  const elementsToRemove = contentClone.querySelectorAll(
    'script, style, nav, header, footer, iframe, noscript, [hidden], ' +
    '[aria-hidden="true"], .nav, .header, .footer, .menu, .sidebar, ' +
    '.advertisement, .ad, .social-share, .comments'
  );
  
  elementsToRemove.forEach(el => el.remove());
  
  // Get text content and clean it up
  const content = contentClone.textContent || '';
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
    .slice(0, 12000);

  return {
    content: cleanContent,
    title: document.title,
    url: window.location.href
  };
}; 