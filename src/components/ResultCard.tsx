// src/components/ResultCard.tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Calendar, ExternalLink } from "lucide-react";
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
      className={`group hover:bg-[rgba(255,255,255,0.03)] border-[#27272a] bg-black/50 backdrop-blur-sm transition-all duration-200 ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(result)}
    >
      <CardHeader className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <CardTitle className="group-hover:text-[#22c55e] transition-colors">
                <div className="flex items-center gap-2">
                  <Favicon url={result.url} className="h-4 w-4" />
                  <a 
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline line-clamp-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {result.title}
                  </a>
                </div>
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-[#71717a]">
                <span className="truncate">{new URL(result.url).hostname}</span>
                {result.timestamp && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[#71717a]" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Added {formatDate(result.timestamp)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {result.relevanceScore && (
                <Badge 
                  variant="secondary" 
                  className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                >
                  {Math.round(result.relevanceScore * 100)}% match
                </Badge>
              )}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.1)] text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          {result.excerpt && (
            <p className="text-sm text-[#a1a1aa] line-clamp-2 leading-relaxed">
              {result.excerpt}
            </p>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};