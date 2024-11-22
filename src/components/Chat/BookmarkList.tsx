import React from 'react';
import { Bookmark } from '@/services/bookmarks';
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Calendar } from "lucide-react";
import { Favicon } from "@/components/ui/favicon";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect: (bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onSelect }) => {
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-6">
        <BookmarkIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Your Bookmarks</h2>
        <Badge variant="secondary" className="ml-auto">
          {bookmarks.length} bookmarks
        </Badge>
      </div>
      <div className="grid gap-3">
        {bookmarks.map((bookmark) => (
          <Card
            key={bookmark.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect(bookmark)}
          >
            <CardHeader className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {bookmark.title}
                  </h3>
                  <BookmarkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Favicon url={bookmark.url} className="h-4 w-4" />
                  <span className="truncate">{new URL(bookmark.url).hostname}</span>
                </div>
                {bookmark.dateAdded && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Added {formatDate(bookmark.dateAdded)}</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}; 