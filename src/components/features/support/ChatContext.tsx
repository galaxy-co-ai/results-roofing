'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  initialMessage: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openChat = useCallback((message?: string) => {
    setInitialMessage(message || null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setInitialMessage(null);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setInitialMessage(null);
    }
  }, [isOpen]);

  return (
    <ChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat, initialMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
