'use client';

import { UserButton } from '@clerk/nextjs';
import { MessageCircle } from 'lucide-react';
import styles from './PortalHeader.module.css';

interface PortalHeaderProps {
  title: string;
}

export function PortalHeader({ title }: PortalHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button className={styles.helpButton} type="button" aria-label="Get help">
          <MessageCircle size={16} aria-hidden="true" />
          <span>Help</span>
        </button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 32, height: 32 },
            },
          }}
        />
      </div>
    </header>
  );
}
