import { cn } from "@/lib/utils"

interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center text-muted-foreground", className)}>
      <p>{message}</p>
    </div>
  )
} 