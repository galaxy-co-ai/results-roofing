'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { OpsShell } from '@/components/ops/shell/OpsShell';

interface OpsLayoutClientProps {
  children: React.ReactNode;
  fontClasses?: string;
}

export function OpsLayoutClient({ children, fontClasses }: OpsLayoutClientProps) {
  return (
    <NuqsAdapter>
      <OpsShell fontClasses={fontClasses}>
        {children}
      </OpsShell>
    </NuqsAdapter>
  );
}
