import { embeddingService } from '@/services/embeddings';

export async function fetchPageContent(url: string): Promise<{content: string, embedding: Float32Array}> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const mainContent = doc.querySelector('main, article, .content, #content');
    const content = mainContent ? mainContent.textContent : doc.body.textContent;
    
    const cleanContent = content
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000) || 'Could not fetch page content';

    const embedding = await embeddingService.generateEmbedding(cleanContent);
    
    return {
      content: cleanContent,
      embedding
    };
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
} 