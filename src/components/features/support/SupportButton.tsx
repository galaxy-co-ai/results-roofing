'use client';

import { ReactNode } from 'react';
import { useChat } from './ChatContext';
import styles from './SupportButton.module.css';

interface SupportButtonProps {
  children: ReactNode;
  initialMessage?: string;
  variant?: 'text' | 'button' | 'link';
  className?: string;
}

/**
 * A button that opens the support chat.
 * Use this anywhere you want to give users a way to contact support.
 * 
 * @example
 * <SupportButton>Need help?</SupportButton>
 * <SupportButton initialMessage="Help with payment">Payment Support</SupportButton>
 * <SupportButton variant="link">Contact us</SupportButton>
 */
export function SupportButton({ 
  children, 
  initialMessage, 
  variant = 'button',
  className = '' 
}: SupportButtonProps) {
  const { openChat } = useChat();

  const handleClick = () => {
    openChat(initialMessage);
  };

  return (
    <button
      className={`${styles.supportButton} ${styles[variant]} ${className}`}
      onClick={handleClick}
      type="button"
      aria-label={typeof children === 'string' ? children : 'Open support chat'}
    >
      {children}
    </button>
  );
}
