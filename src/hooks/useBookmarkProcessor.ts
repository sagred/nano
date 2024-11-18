import { useState, useEffect } from 'react';
import { db } from '@/services/storage/database';
import { bookmarkService } from '@/services/bookmarks';
import { fetchPageContent } from '@/utils/fetchContent';

export const useBookmarkProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processBookmarks = async () => {
      setIsProcessing(true);
      try {
        const bookmarks = await bookmarkService.getBookmarks();
        const total = bookmarks.length;
        let processed = 0;

        for (const bookmark of bookmarks) {
          // Check if bookmark already exists in database
          const existingPage = await db.pages.where('url').equals(bookmark.url).first();
          
          if (!existingPage || !existingPage.embedding) {
            try {
              const { content, embedding } = await fetchPageContent(bookmark.url);
              await db.addPage({
                url: bookmark.url,
                title: bookmark.title,
                content,
                embedding,
                timestamp: bookmark.dateAdded || Date.now(),
                isBookmark: true
              });
            } catch (error) {
              console.error(`Error processing bookmark ${bookmark.url}:`, error);
            }
          }
          
          processed++;
          console.log('Bookmark processing complete. Total processed:', processed);
          setProgress((processed / total) * 100);
        }
      } catch (error) {
        console.error('Error processing bookmarks:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processBookmarks();
  }, []);

  return { isProcessing, progress };
}; 