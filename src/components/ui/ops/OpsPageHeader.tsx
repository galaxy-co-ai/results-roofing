'use client';

import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { type OpsAccent } from './OpsStatCard';

interface OpsPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: OpsAccent;
  actions?: ReactNode;
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

export function OpsPageHeader({
  title,
  description,
  icon: Icon,
  accent = 'crm',
  actions,
  className,
}: OpsPageHeaderProps) {
  const styles = accentStyles[accent];

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('rounded-lg p-2.5', styles.bg)}>
            <Icon className={cn('size-5', styles.text)} />
          </div>
        )}
        <div>
          <h1
            className="font-bold tracking-tight text-[var(--admin-text-primary)]"
            style={{ fontSize: 'var(--admin-text-page-title)', textWrap: 'balance' }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="text-[var(--admin-text-secondary)]"
              style={{ textWrap: 'balance' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
