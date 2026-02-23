import { Skeleton } from '@/components/ui/skeleton';

interface OpsTableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function OpsTableSkeleton({ rows = 5, cols = 4 }: OpsTableSkeletonProps) {
  return (
    <div className="rounded-lg border border-[var(--admin-border)] overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-muted/30 border-b border-[var(--admin-border)]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-4 px-4 py-3 border-b border-[var(--admin-border)] last:border-0"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className="h-4 flex-1"
              style={{ maxWidth: col === 0 ? '40%' : '20%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
