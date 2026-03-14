'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  toggle: () => void;
  hasRoofData: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({
  expanded: false,
  setExpanded: () => {},
  toggle: () => {},
  hasRoofData: false,
});

interface SidebarProviderProps {
  children: ReactNode;
  hasRoofData?: boolean;
}

export function SidebarProvider({ children, hasRoofData = false }: SidebarProviderProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle: () => setExpanded((v) => !v), hasRoofData }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
