// src/services/storage/database.ts
import Dexie, { Table } from 'dexie';

// Define types
export interface PageContent {
  id?: number;
  url: string;
  title: string;
  content: string;
  timestamp: number;
  isBookmark: boolean;
  summary?: string;
}

export class KnowledgeDB extends Dexie {
  pages!: Table<PageContent>;

  constructor() {
    super('KnowledgeDB');
    this.version(1).stores({
      pages: '++id, url, title, timestamp, isBookmark'
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
}

export const db = new KnowledgeDB();