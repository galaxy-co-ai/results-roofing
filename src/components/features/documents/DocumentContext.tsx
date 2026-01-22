'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type DocumentType = 
  | 'contract'
  | 'warranty'
  | 'receipt'
  | 'permit'
  | 'materials'
  | 'scope';

export interface DocumentData {
  id: string;
  type: DocumentType;
  title: string;
  status: 'signed' | 'active' | 'paid' | 'pending' | 'approved';
  date: string;
  // Additional data for document rendering
  projectData?: {
    address: string;
    customerName: string;
    email: string;
    phone: string;
    packageName: string;
    totalPrice: number;
    depositAmount: number;
    installationDate: string;
    contractDate: string;
    materials: string;
    warrantyYears: number;
    permitNumber?: string;
  };
}

interface DocumentContextType {
  isOpen: boolean;
  currentDocument: DocumentData | null;
  openDocument: (doc: DocumentData) => void;
  closeDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);

  const openDocument = useCallback((doc: DocumentData) => {
    setCurrentDocument(doc);
    setIsOpen(true);
  }, []);

  const closeDocument = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setCurrentDocument(null), 300); // Clear after animation
  }, []);

  return (
    <DocumentContext.Provider value={{ isOpen, currentDocument, openDocument, closeDocument }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
