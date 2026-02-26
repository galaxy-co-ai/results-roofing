'use client';

import { useUser } from '@clerk/nextjs';
import { MessageCircle } from 'lucide-react';
import styles from './PortalHeader.module.css';

interface PortalHeaderProps {
  title: string;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? '';
  const last = lastName?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '?';
}

export function PortalHeader({ title }: PortalHeaderProps) {
  const { user } = useUser();
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button className={styles.helpButton} type="button" aria-label="Get help">
          <MessageCircle size={16} aria-hidden="true" />
          <span>Help</span>
        </button>

        <div className={styles.avatar} aria-label={`User avatar: ${initials}`}>
          {initials}
        </div>
      </div>
    </header>
  );
}
