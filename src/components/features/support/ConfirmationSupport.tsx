'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './ConfirmationSupport.module.css';

/**
 * A support section for the confirmation page.
 */
export function ConfirmationSupport() {
  const { openChat } = useChat();

  return (
    <div className={styles.contactSection}>
      <p className={styles.contactTitle}>Questions? We&apos;re here to help.</p>
      <button 
        className={styles.chatButton}
        onClick={() => openChat()}
        aria-label="Chat with support"
      >
        <MessageCircle size={16} />
        <span>Chat with Support</span>
      </button>
    </div>
  );
}
