import { Suspense } from 'react';
import { Header } from '@/components/layout';
import { QuoteWizardProvider, Stage1Container } from '@/components/features/quote';
import { TrustBar } from '@/components/ui';
import styles from './page.module.css';

/**
 * /quote/new - Start a new quote
 * Shows the Stage1Container which handles:
 * 1. Address entry (if no prefilled address)
 * 2. Property confirmation with satellite image
 */
export default function NewQuotePage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <QuoteWizardProvider>
          <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <Stage1Container />
          </Suspense>
        </QuoteWizardProvider>
        <TrustBar variant="light" />
      </main>
    </>
  );
}
