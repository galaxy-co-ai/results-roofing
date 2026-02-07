'use client';

import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OpsEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function OpsEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: OpsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--admin-border-default)] p-8',
        className
      )}
    >
      <div className="rounded-lg bg-[var(--admin-bg-muted)] p-3">
        <Icon className="size-6 text-[var(--admin-text-tertiary)]" />
      </div>
      <div className="text-center">
        <p
          className="font-medium text-[var(--admin-text-primary)]"
          style={{ textWrap: 'balance' }}
        >
          {title}
        </p>
        {description && (
          <p
            className="mt-1 text-sm text-[var(--admin-text-secondary)]"
            style={{ textWrap: 'balance' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
