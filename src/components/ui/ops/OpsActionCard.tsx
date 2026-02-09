'use client';

import Link from 'next/link';
import { type LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type OpsAccent } from './index';

interface OpsActionCardProps {
  href: string;
  icon: LucideIcon;
  accent: OpsAccent;
  title: string;
  description: string;
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

export function OpsActionCard({
  href,
  icon: Icon,
  accent,
  title,
  description,
  className,
}: OpsActionCardProps) {
  const styles = accentStyles[accent];

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-[var(--admin-border-default)] p-3',
        'transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)]',
        'hover:-translate-y-0.5 hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-bg-hover)] hover:shadow-[var(--admin-shadow-sm)]',
        'active:scale-[var(--admin-scale-press)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] focus-visible:ring-offset-2',
        className
      )}
    >
      <div className={cn('rounded-lg p-2', styles.bg)}>
        <Icon className={cn('size-4', styles.text)} />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium text-[var(--admin-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--admin-text-tertiary)]">{description}</p>
      </div>
      <ArrowRight
        className={cn(
          'size-4 text-[var(--admin-text-tertiary)]',
          'transition-transform duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)]',
          'group-hover:translate-x-0.5 group-hover:text-[var(--admin-text-secondary)]'
        )}
      />
    </Link>
  );
}
