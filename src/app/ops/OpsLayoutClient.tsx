'use client';

import { OpsShell } from '@/components/ops/shell/OpsShell';

interface OpsLayoutClientProps {
  children: React.ReactNode;
  fontClasses?: string;
}

export function OpsLayoutClient({ children, fontClasses }: OpsLayoutClientProps) {
  return (
    <OpsShell fontClasses={fontClasses}>
      {children}
    </OpsShell>
  );
}
