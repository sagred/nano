// src/services/storage/database.ts
import Dexie, { Table } from 'dexie';
import { embeddingService } from '../embeddings/index';

// Define types
export interface PageContent {
  id?: number;
  url: string;
  title: string;
  content: string;
  embedding?: Float32Array;
  timestamp: number;
  isBookmark: boolean;
  summary?: string;
  relevanceScore?: number;
}

export class KnowledgeDB extends Dexie {
  pages!: Table<PageContent>;

  constructor() {
    super('KnowledgeDB');
    this.version(1).stores({
      pages: '++id, url, title, timestamp, isBookmark, *embedding'
    });
  }

  async addPage(page: PageContent): Promise<number> {
    try {
      // Update if exists, add if new
      const existingPage = await this.pages.where('url').equals(page.url).first();
      if (existingPage) {
        await this.pages.update(existingPage.id!, {
          ...page,
          timestamp: Date.now()
        });
        return existingPage.id!;
      }
      return await this.pages.add(page);
    } catch (error) {
      console.error('Error adding page:', error);
      throw error;
    }
  }

  async searchPages(query: string): Promise<PageContent[]> {
    return await this.pages
      .filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.content.toLowerCase().includes(query.toLowerCase())
      )
      .toArray();
  }

  async getRecentPages(limit: number = 10): Promise<PageContent[]> {
    return await this.pages
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async searchPagesBySimilarity(queryEmbedding: Float32Array): Promise<PageContent[]> {
    const allPages = await this.pages.toArray();
    console.log('Total pages in DB:', allPages.length);
    
    // Calculate similarity scores
    const pagesWithScores = allPages.map(page => {
      const score = page.embedding ? 
        embeddingService.calculateSimilarity(queryEmbedding, page.embedding) : 0;
      console.log(`Score for ${page.title}:`, score);
      return {
        ...page,
        relevanceScore: score
      };
    });

    // Sort by relevance score and filter with a lower threshold
    const results = pagesWithScores
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .filter(page => (page.relevanceScore || 0) > 0.1); // Lower threshold to 0.1
    
    // Limit to top 10 results
    const topResults = results.slice(0, 10);
    
    console.log('Filtered results:', topResults);
    return topResults;
  }
}

export const db = new KnowledgeDB();