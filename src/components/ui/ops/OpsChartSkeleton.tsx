import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OpsChartSkeletonProps {
  className?: string;
}

export function OpsChartSkeleton({ className }: OpsChartSkeletonProps) {
  return (
    <div className={cn('flex items-end gap-2 px-4', className)}>
      {[40, 65, 45, 80, 55, 70].map((h, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
