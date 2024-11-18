import React from 'react';
import { Bookmark } from '@/services/bookmarks';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect: (bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onSelect }) => {
  return (
    <div className="grid gap-2 p-4">
      {bookmarks.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => onSelect(bookmark)}
          className="text-left p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          <div className="font-medium text-white">{bookmark.title}</div>
          <div className="text-sm text-slate-300 truncate">{bookmark.url}</div>
        </button>
      ))}
    </div>
  );
}; 