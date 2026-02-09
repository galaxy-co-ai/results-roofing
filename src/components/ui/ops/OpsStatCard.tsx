'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OpsStatCardProps {
  label: string;
  value: string;
  change?: number;
  loading?: boolean;
  className?: string;
}

export function OpsStatCard({
  label,
  value,
  change,
  loading = false,
  className,
}: OpsStatCardProps) {
  return (
    <Card className={cn('rounded-lg border border-border', className)}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
        )}
        {change !== undefined && !loading && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                change >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
