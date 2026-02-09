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
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-[240px] text-center text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
