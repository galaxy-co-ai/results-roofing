import { Skeleton } from '@/components/ui/skeleton';

interface OpsCardGridSkeletonProps {
  cards?: number;
  cols?: number;
}

export function OpsCardGridSkeleton({ cards = 4, cols = 4 }: OpsCardGridSkeletonProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--admin-border)] p-4 space-y-3"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
