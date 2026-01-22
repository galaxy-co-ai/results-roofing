'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './SidebarSupport.module.css';

/**
 * A compact support section for sidebars.
 * Opens the chat widget when clicked.
 */
export function SidebarSupport() {
  const { openChat } = useChat();

  return (
    <div className={styles.supportSection}>
      <button 
        className={styles.supportButton}
        onClick={() => openChat()}
        aria-label="Open support chat"
      >
        <MessageCircle size={18} />
        <span>Chat with Support</span>
      </button>
      <p className={styles.responseTime}>Usually replies in minutes</p>
    </div>
  );
}
