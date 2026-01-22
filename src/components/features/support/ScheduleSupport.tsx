'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './ScheduleSupport.module.css';

/**
 * A support section for the schedule page.
 */
export function ScheduleSupport() {
  const { openChat } = useChat();

  return (
    <section className={styles.contactCard}>
      <h2 className={styles.contactTitle}>Questions About Your Schedule?</h2>
      <p className={styles.contactText}>
        Our project coordinators are available to help with any scheduling concerns.
      </p>
      <button 
        className={styles.chatButton}
        onClick={() => openChat('Scheduling help')}
        aria-label="Chat with us about scheduling"
      >
        <MessageCircle size={18} />
        <span>Chat with Us</span>
      </button>
    </section>
  );
}
