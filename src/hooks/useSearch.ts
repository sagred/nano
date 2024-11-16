// src/hooks/useSearch.ts
import { useState, useEffect } from 'react';
import { db, PageContent } from '@/services/storage/database';
import { aiService } from '@/services/ai';

export const useSearch = (query: string) => {
  const [results, setResults] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchPages = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await db.searchPages(query);
        const resultsWithSummaries = await Promise.all(
          searchResults.map(async (result) => ({
            ...result,
            summary: result.summary || await aiService.generateSummary(result.content)
          }))
        );
        setResults(resultsWithSummaries);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPages, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
};
