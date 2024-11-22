// src/components/ResultCard.tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Calendar } from "lucide-react";
import { PageContent } from "@/services/storage/database";
import { Favicon } from "@/components/ui/favicon";

interface ResultCardProps {
  result: PageContent;
  onSelect?: (result: PageContent) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onSelect }) => {
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className={`hover:bg-accent border-border transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(result)}
    >
      <CardHeader className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>
                <a 
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.title}
                </a>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Favicon url={result.url} className="h-4 w-4" />
                <span className="truncate">{new URL(result.url).hostname}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {result.relevanceScore && (
                <Badge variant="secondary">
                  {Math.round(result.relevanceScore * 100)}% match
                </Badge>
              )}
              <BookmarkIcon className="h-4 w-4 text-primary flex-shrink-0" />
            </div>
          </div>
          {result.timestamp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Added {formatDate(result.timestamp)}</span>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};