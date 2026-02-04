'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AriaLiveContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AriaLiveContext = createContext<AriaLiveContextType | null>(null);

/**
 * Provider for ARIA live region announcements
 * Wrap your app with this to enable screen reader announcements
 */
export function AriaLiveProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the message
    if (priority === 'assertive') {
      setAssertiveMessage(message);
    } else {
      setPoliteMessage(message);
    }

    // Clear after announcement
    timeoutRef.current = setTimeout(() => {
      setPoliteMessage('');
      setAssertiveMessage('');
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AriaLiveContext.Provider value={{ announce }}>
      {children}
      {/* Hidden live regions for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AriaLiveContext.Provider>
  );
}

/**
 * Hook to announce messages to screen readers
 * @example
 * const { announce } = useAriaLive();
 * announce('Form submitted successfully');
 * announce('Error: Please fill in all fields', 'assertive');
 */
export function useAriaLive() {
  const context = useContext(AriaLiveContext);
  if (!context) {
    // Return a no-op if not wrapped in provider
    return { announce: () => {} };
  }
  return context;
}

/**
 * Simple status indicator with ARIA live region
 */
export function LoadingStatus({
  isLoading,
  loadingText = 'Loading...',
  successText,
  errorText,
}: {
  isLoading: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}) {
  const { announce } = useAriaLive();

  useEffect(() => {
    if (isLoading) {
      announce(loadingText);
    } else if (successText) {
      announce(successText);
    } else if (errorText) {
      announce(errorText, 'assertive');
    }
  }, [isLoading, loadingText, successText, errorText, announce]);

  return null;
}
