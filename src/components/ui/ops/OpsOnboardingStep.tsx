'use client';

import { cn } from '@/lib/utils';
import { type OpsAccent } from './index';

interface OpsOnboardingStepProps {
  step: number;
  title: string;
  description: string;
  accent: OpsAccent;
  className?: string;
}

const accentStyles: Record<OpsAccent, { bg: string; bgSubtle: string; border: string; text: string }> = {
  crm: {
    bg: 'bg-[var(--ops-accent-crm-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-crm)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-crm)_20%,transparent)]',
    text: 'text-[var(--ops-accent-crm)]'
  },
  messaging: {
    bg: 'bg-[var(--ops-accent-messaging-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-messaging)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-messaging)_20%,transparent)]',
    text: 'text-[var(--ops-accent-messaging)]'
  },
  pipeline: {
    bg: 'bg-[var(--ops-accent-pipeline-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-pipeline)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-pipeline)_20%,transparent)]',
    text: 'text-[var(--ops-accent-pipeline)]'
  },
  analytics: {
    bg: 'bg-[var(--ops-accent-analytics-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-analytics)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-analytics)_20%,transparent)]',
    text: 'text-[var(--ops-accent-analytics)]'
  },
  support: {
    bg: 'bg-[var(--ops-accent-support-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-support)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-support)_20%,transparent)]',
    text: 'text-[var(--ops-accent-support)]'
  },
  documents: {
    bg: 'bg-[var(--ops-accent-documents-muted)]',
    bgSubtle: 'bg-[color-mix(in_srgb,var(--ops-accent-documents)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--ops-accent-documents)_20%,transparent)]',
    text: 'text-[var(--ops-accent-documents)]'
  },
};

export function OpsOnboardingStep({
  step,
  title,
  description,
  accent,
  className,
}: OpsOnboardingStepProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        styles.bgSubtle,
        styles.border,
        className
      )}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
          styles.bg,
          styles.text
        )}
      >
        {step}
      </div>
      <div>
        <p className="font-medium text-[var(--admin-text-primary)]">{title}</p>
        <p className="text-sm text-[var(--admin-text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
