export async function fetchPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get main content (prioritize main content areas)
    const mainContent = doc.querySelector('main, article, .content, #content');
    const content = mainContent ? mainContent.textContent : doc.body.textContent;
    
    // Clean and truncate the content
    return content
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000) || 'Could not fetch page content';
  } catch (error) {
    console.error('Error fetching page content:', error);
    return 'Failed to fetch page content';
  }
} 