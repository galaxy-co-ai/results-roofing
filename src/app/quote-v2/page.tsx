'use client';

import { WizardProvider, WizardShell } from '@/components/features/quote-v2';

/**
 * Quote Wizard V2 - Entry page
 *
 * This page creates a fresh wizard session. For resuming existing quotes,
 * users should navigate to /quote-v2/[id] directly.
 */
export default function QuoteV2Page() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}
