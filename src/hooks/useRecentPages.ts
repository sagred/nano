
// src/hooks/useRecentPages.ts
import { useState, useEffect } from 'react';
import { db, PageContent } from '@/services/storage/database';

export const useRecentPages = (limit: number = 10) => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentPages = async () => {
      try {
        const recentPages = await db.getRecentPages(limit);
        setPages(recentPages);
      } catch (error) {
        console.error('Error loading recent pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentPages();
  }, [limit]);

  return { pages, loading };
};