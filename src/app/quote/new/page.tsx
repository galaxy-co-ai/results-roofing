import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NewQuoteForm from './NewQuoteForm';
import styles from './page.module.css';

function FormLoading() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    </main>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<FormLoading />}>
      <NewQuoteForm />
    </Suspense>
  );
}
