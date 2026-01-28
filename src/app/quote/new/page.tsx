import { Suspense } from 'react';
import { QuoteWizardProvider } from '@/components/features/quote/QuoteWizardProvider';
import { StageIndicator } from '@/components/features/quote/StageIndicator';
import { Stage1Container, Stage1Skeleton } from '@/components/features/quote/stages/Stage1';
import { TrustSignals } from '@/components/features/quote/TrustSignals';
import styles from './page.module.css';

interface PageProps {
  searchParams: Promise<{ address?: string }>;
}

function FormLoading() {
  return (
    <>
      <StageIndicator currentStage={1} />
      <TrustSignals variant="compact" showCounter className={styles.trustSignals} />
      <Stage1Skeleton />
    </>
  );
}

async function NewQuoteContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialAddress = params.address || '';

  return (
    <QuoteWizardProvider>
      <StageIndicator currentStage={1} />
      <TrustSignals variant="compact" showCounter className={styles.trustSignals} />
      <Stage1Container initialAddress={initialAddress} />
    </QuoteWizardProvider>
  );
}

export default function NewQuotePage(props: PageProps) {
  return (
    <Suspense fallback={<FormLoading />}>
      <NewQuoteContent {...props} />
    </Suspense>
  );
}
