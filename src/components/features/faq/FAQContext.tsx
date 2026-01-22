'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface FAQContextType {
  isOpen: boolean;
  openFAQ: () => void;
  closeFAQ: () => void;
}

const FAQContext = createContext<FAQContextType | undefined>(undefined);

export function FAQProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openFAQ = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeFAQ = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <FAQContext.Provider value={{ isOpen, openFAQ, closeFAQ }}>
      {children}
    </FAQContext.Provider>
  );
}

export function useFAQ() {
  const context = useContext(FAQContext);
  if (context === undefined) {
    throw new Error('useFAQ must be used within a FAQProvider');
  }
  return context;
}
