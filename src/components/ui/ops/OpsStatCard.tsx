'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type OpsAccent =
  | 'crm'
  | 'messaging'
  | 'pipeline'
  | 'analytics'
  | 'support'
  | 'documents';

interface OpsStatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  accent: OpsAccent;
  loading?: boolean;
  className?: string;
}

const accentStyles: Record<OpsAccent, { bg: string; text: string }> = {
  crm: {
    bg: 'bg-[var(--ops-accent-crm-muted)]',
    text: 'text-[var(--ops-accent-crm)]'
  },
  messaging: {
    bg: 'bg-[var(--ops-accent-messaging-muted)]',
    text: 'text-[var(--ops-accent-messaging)]'
  },
  pipeline: {
    bg: 'bg-[var(--ops-accent-pipeline-muted)]',
    text: 'text-[var(--ops-accent-pipeline)]'
  },
  analytics: {
    bg: 'bg-[var(--ops-accent-analytics-muted)]',
    text: 'text-[var(--ops-accent-analytics)]'
  },
  support: {
    bg: 'bg-[var(--ops-accent-support-muted)]',
    text: 'text-[var(--ops-accent-support)]'
  },
  documents: {
    bg: 'bg-[var(--ops-accent-documents-muted)]',
    text: 'text-[var(--ops-accent-documents)]'
  },
};

export function OpsStatCard({
  label,
  value,
  change,
  icon: Icon,
  accent,
  loading = false,
  className,
}: OpsStatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        'transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)]',
        'hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-md)]',
        'active:scale-[var(--admin-scale-press)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] focus-visible:ring-offset-2',
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-[var(--admin-text-secondary)]">{label}</p>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-[var(--admin-bg-muted)]" />
            ) : (
              <p className="text-2xl font-bold tabular-nums">{value}</p>
            )}
          </div>
          <div className={cn('rounded-lg p-2', styles.bg)}>
            <Icon className={cn('size-5', styles.text)} />
          </div>
        </div>
        {change !== undefined && !loading && (
          <div className="mt-3 flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="size-4 text-[var(--admin-trend-positive)]" />
            ) : (
              <TrendingDown className="size-4 text-[var(--admin-trend-negative)]" />
            )}
            <span
              className={cn(
                'text-sm font-medium tabular-nums',
                change >= 0
                  ? 'text-[var(--admin-trend-positive)]'
                  : 'text-[var(--admin-trend-negative)]'
              )}
            >
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-[var(--admin-text-tertiary)]">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
