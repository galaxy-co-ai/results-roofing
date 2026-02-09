'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OpsPageHeaderProps {
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function OpsPageHeader({
  title,
  actions,
  className,
}: OpsPageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
