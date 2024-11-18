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

  async searchPagesBySimilarity(queryEmbedding: Float32Array, searchQuery: string): Promise<PageContent[]> {
    const allPages = await this.pages.toArray();
    console.log('Total pages in DB:', allPages.length);
    
    const queryTerms = searchQuery.toLowerCase().split(' ');
    
    // Calculate similarity scores and keyword matches
    const pagesWithScores = allPages.map(page => {
      // Semantic similarity score
      const semanticScore = page.embedding ? 
        embeddingService.calculateSimilarity(queryEmbedding, page.embedding) : 0;
      
      // Keyword match score
      const titleAndContent = (page.title + ' ' + page.content).toLowerCase();
      const keywordScore = queryTerms.reduce((score, term) => {
        return score + (titleAndContent.includes(term) ? 0.5 : 0);
      }, 0);
      
      // Combined score (weighted average)
      const combinedScore = (semanticScore * 0.6) + (keywordScore * 0.4);
      
      console.log(`Scores for ${page.title}:`, {
        semantic: semanticScore,
        keyword: keywordScore,
        combined: combinedScore
      });

      return {
        ...page,
        relevanceScore: combinedScore
      };
    });

    // Sort by combined score
    const results = pagesWithScores
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 10); // Top 10 results
    
    console.log('Filtered results:', results);
    return results;
  }
}

export const db = new KnowledgeDB();