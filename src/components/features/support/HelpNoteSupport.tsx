'use client';

import { AlertCircle, MessageCircle } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './HelpNoteSupport.module.css';

interface HelpNoteSupportProps {
  title: string;
  message: string;
  chatPrompt?: string;
}

/**
 * A help note that triggers the chat when clicked.
 */
export function HelpNoteSupport({ title, message, chatPrompt }: HelpNoteSupportProps) {
  const { openChat } = useChat();

  return (
    <div className={styles.helpNote}>
      <AlertCircle size={18} className={styles.helpIcon} />
      <div className={styles.helpContent}>
        <p className={styles.helpTitle}>{title}</p>
        <p className={styles.helpText}>
          {message}{' '}
          <button 
            className={styles.chatLink}
            onClick={() => openChat(chatPrompt)}
            type="button"
          >
            <MessageCircle size={14} />
            Chat with support
          </button>
        </p>
      </div>
    </div>
  );
}
