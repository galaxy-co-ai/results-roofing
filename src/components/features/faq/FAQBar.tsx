'use client';

import { HelpCircle, ChevronRight } from 'lucide-react';
import { useFAQ } from './FAQContext';
import styles from './FAQBar.module.css';

export function FAQBar() {
  const { openFAQ } = useFAQ();

  return (
    <button className={styles.faqBar} onClick={openFAQ} aria-label="Open FAQ">
      <div className={styles.iconWrapper}>
        <HelpCircle size={24} />
      </div>
      <div className={styles.content}>
        <span className={styles.title}>Questions & Help</span>
        <span className={styles.subtitle}>Find answers to common questions</span>
      </div>
      <ChevronRight size={20} className={styles.arrow} />
    </button>
  );
}
