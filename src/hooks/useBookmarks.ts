import { useState, useEffect } from 'react';
import { bookmarkService, Bookmark } from '@/services/bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const results = await bookmarkService.getBookmarks();
        setBookmarks(results);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  return { bookmarks, loading };
}; 