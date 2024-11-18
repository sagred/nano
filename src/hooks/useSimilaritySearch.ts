import { useState } from 'react';
import { db, PageContent } from '@/services/storage/database';
import { embeddingService } from '@/services/embeddings';

export const useSimilaritySearch = () => {
  const [results, setResults] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      const similarPages = await db.searchPagesBySimilarity(queryEmbedding, query);
      console.log('Found similar pages:', similarPages);
      setResults(similarPages);
    } catch (err) {
      setError('Failed to perform similarity search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searchContent };
}; 