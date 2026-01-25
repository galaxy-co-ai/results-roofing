'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './SidebarSupport.module.css';

/**
 * A compact support button for the sidebar.
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
        <MessageCircle size={20} />
        <span>Support</span>
      </button>
    </div>
  );
}
