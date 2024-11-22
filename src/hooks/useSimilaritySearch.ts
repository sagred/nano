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
      
      // Boost scores for exact matches in title or content
      const boostedResults = similarPages.map(page => {
        let score = page.relevanceScore || 0;
        
        // Boost for exact matches in title
        if (page.title.toLowerCase().includes(query.toLowerCase())) {
          score += 0.3; // 30% boost for title matches
        }
        
        // Boost for exact matches in content
        if (page.content.toLowerCase().includes(query.toLowerCase())) {
          score += 0.2; // 20% boost for content matches
        }

        return {
          ...page,
          relevanceScore: Math.min(score, 1) // Cap at 100%
        };
      });

      // Sort by boosted scores
      boostedResults.sort((a, b) => 
        (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );

      setResults(boostedResults);
    } catch (err) {
      setError('Failed to perform similarity search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searchContent };
}; 