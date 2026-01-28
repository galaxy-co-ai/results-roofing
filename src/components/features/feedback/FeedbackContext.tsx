'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

export type FeedbackReason = 'bug' | 'suggestion' | 'general';

export interface UserContext {
  viewportWidth: number;
  viewportHeight: number;
  scrollPosition: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName: string;
  browserVersion: string;
  osName: string;
  referrer: string;
  timeOnPage: number;
  interactionCount: number;
  lastAction: string;
}

export interface TargetElementInfo {
  selector: string;
  tagName: string;
  className: string;
  id: string;
  text: string;
  rect: { x: number; y: number; width: number; height: number };
}

export interface FeedbackData {
  reason: FeedbackReason | null;
  subOption: string | null;
  customReason: string;
  notes: string;
  timestamp: Date;
  currentPage: string;
  userAgent: string;
  // Enhanced context
  targetElement: string | null;
  targetElementInfo: TargetElementInfo | null;
  sessionId: string;
  quoteId: string | null;
  userId: string | null;
  userContext: UserContext | null;
}

interface FeedbackContextType {
  isOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
  toggleFeedback: () => void;
  step: number;
  setStep: (step: number) => void;
  feedbackData: FeedbackData;
  setReason: (reason: FeedbackReason) => void;
  setSubOption: (option: string) => void;
  setCustomReason: (reason: string) => void;
  setNotes: (notes: string) => void;
  submitFeedback: () => Promise<void>;
  resetFeedback: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  // Element selector
  isSelectingElement: boolean;
  startElementSelection: () => void;
  cancelElementSelection: () => void;
  selectedElement: TargetElementInfo | null;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Utility functions
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getBrowserInfo(): { name: string; version: string } {
  if (typeof navigator === 'undefined') return { name: 'Unknown', version: '' };
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return { name: 'Firefox', version: match?.[1] || '' };
  }
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { name: 'Chrome', version: match?.[1] || '' };
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/(\d+)/);
    return { name: 'Safari', version: match?.[1] || '' };
  }
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/(\d+)/);
    return { name: 'Edge', version: match?.[1] || '' };
  }
  return { name: 'Unknown', version: '' };
}

function getOSName(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let sessionId = sessionStorage.getItem('feedback_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('feedback_session_id', sessionId);
  }
  return sessionId;
}

function generateElementSelector(element: HTMLElement): string {
  // Generate a unique CSS selector for the element
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      parts.unshift(selector);
      break; // ID is unique enough
    }
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (classes) selector += `.${classes}`;
    }
    
    // Add nth-child if needed
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }
    
    parts.unshift(selector);
    current = current.parentElement;
  }
  
  return parts.slice(-4).join(' > '); // Keep last 4 levels
}

function getElementInfo(element: HTMLElement): TargetElementInfo {
  const rect = element.getBoundingClientRect();
  const text = element.textContent?.slice(0, 100) || '';
  
  return {
    selector: generateElementSelector(element),
    tagName: element.tagName.toLowerCase(),
    className: typeof element.className === 'string' ? element.className.slice(0, 200) : '',
    id: element.id || '',
    text: text.trim(),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  };
}

const initialFeedbackData: FeedbackData = {
  reason: null,
  subOption: null,
  customReason: '',
  notes: '',
  timestamp: new Date(),
  currentPage: '',
  userAgent: '',
  targetElement: null,
  targetElementInfo: null,
  sessionId: '',
  quoteId: null,
  userId: null,
  userContext: null,
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(initialFeedbackData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSelectingElement, setIsSelectingElement] = useState(false);
  const [selectedElement, setSelectedElement] = useState<TargetElementInfo | null>(null);
  
  // Track user interactions and time on page
  const pageLoadTime = useRef(Date.now());
  const interactionCount = useRef(0);
  const lastAction = useRef('page_load');

  // Track interactions
  useEffect(() => {
    const trackInteraction = (e: MouseEvent | KeyboardEvent) => {
      interactionCount.current++;
      if (e.type === 'click') {
        const target = e.target as HTMLElement;
        lastAction.current = `clicked_${target.tagName.toLowerCase()}`;
      } else if (e.type === 'keydown') {
        lastAction.current = 'keyboard_input';
      }
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
    };
  }, []);

  // Element selection mode
  useEffect(() => {
    if (!isSelectingElement) return;

    let highlightOverlay: HTMLDivElement | null = null;
    let lastHoveredElement: HTMLElement | null = null;

    const createOverlay = () => {
      highlightOverlay = document.createElement('div');
      highlightOverlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        border: 2px solid #8B5CF6;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 4px;
        z-index: 999999;
        transition: all 0.1s ease;
      `;
      document.body.appendChild(highlightOverlay);
    };

    const updateOverlay = (element: HTMLElement) => {
      if (!highlightOverlay) return;
      const rect = element.getBoundingClientRect();
      highlightOverlay.style.left = `${rect.left}px`;
      highlightOverlay.style.top = `${rect.top}px`;
      highlightOverlay.style.width = `${rect.width}px`;
      highlightOverlay.style.height = `${rect.height}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore feedback widget elements
      if (target.closest('[data-feedback-widget]')) return;
      
      if (target !== lastHoveredElement) {
        lastHoveredElement = target;
        if (!highlightOverlay) createOverlay();
        updateOverlay(target);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      
      // Ignore feedback widget elements
      if (target.closest('[data-feedback-widget]')) return;
      
      const elementInfo = getElementInfo(target);
      setSelectedElement(elementInfo);
      setFeedbackData((prev) => ({
        ...prev,
        targetElement: elementInfo.selector,
        targetElementInfo: elementInfo,
      }));
      setIsSelectingElement(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelectingElement(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleEscape);
    document.body.style.cursor = 'crosshair';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.cursor = '';
      if (highlightOverlay) {
        highlightOverlay.remove();
      }
    };
  }, [isSelectingElement]);

  const captureUserContext = useCallback((): UserContext => {
    const browserInfo = getBrowserInfo();
    
    return {
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      scrollPosition: typeof window !== 'undefined' ? window.scrollY : 0,
      deviceType: getDeviceType(),
      browserName: browserInfo.name,
      browserVersion: browserInfo.version,
      osName: getOSName(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timeOnPage: Math.round((Date.now() - pageLoadTime.current) / 1000),
      interactionCount: interactionCount.current,
      lastAction: lastAction.current,
    };
  }, []);

  const openFeedback = useCallback(() => {
    // Check if we're in a quote flow
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const quoteMatch = pathname.match(/\/quote\/([a-f0-9-]+)/);
    const quoteId = quoteMatch ? quoteMatch[1] : null;

    // Capture all context when opening
    setFeedbackData((prev) => ({
      ...prev,
      timestamp: new Date(),
      currentPage: pathname,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sessionId: getOrCreateSessionId(),
      quoteId,
      userContext: captureUserContext(),
    }));
    setIsOpen(true);
  }, [captureUserContext]);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
    setIsSelectingElement(false);
    // Reset feedback state after close animation completes
    setTimeout(() => {
      setFeedbackData(initialFeedbackData);
      setStep(1);
      setIsSubmitted(false);
      setSelectedElement(null);
    }, 300);
  }, []);

  const toggleFeedback = useCallback(() => {
    if (isOpen) {
      closeFeedback();
    } else {
      openFeedback();
    }
  }, [isOpen, closeFeedback, openFeedback]);

  const setReason = useCallback((reason: FeedbackReason) => {
    setFeedbackData((prev) => ({ ...prev, reason, subOption: null }));
  }, []);

  const setSubOption = useCallback((option: string) => {
    setFeedbackData((prev) => ({ ...prev, subOption: option }));
  }, []);

  const setCustomReason = useCallback((customReason: string) => {
    setFeedbackData((prev) => ({ ...prev, customReason }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setFeedbackData((prev) => ({ ...prev, notes }));
  }, []);

  const resetFeedback = useCallback(() => {
    setFeedbackData(initialFeedbackData);
    setStep(1);
    setIsSubmitted(false);
    setSelectedElement(null);
  }, []);

  const startElementSelection = useCallback(() => {
    setIsSelectingElement(true);
    setIsOpen(false); // Temporarily close to allow selection
  }, []);

  const cancelElementSelection = useCallback(() => {
    setIsSelectingElement(false);
    setIsOpen(true);
  }, []);

  const submitFeedback = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to API with enhanced context
      const response = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: feedbackData.reason,
          subOption: feedbackData.subOption,
          customReason: feedbackData.customReason || undefined,
          notes: feedbackData.notes || undefined,
          page: feedbackData.currentPage || '/',
          userAgent: feedbackData.userAgent || undefined,
          timestamp: feedbackData.timestamp.toISOString(),
          // Enhanced context
          targetElement: feedbackData.targetElement || undefined,
          targetElementInfo: feedbackData.targetElementInfo || undefined,
          sessionId: feedbackData.sessionId || undefined,
          quoteId: feedbackData.quoteId || undefined,
          userId: feedbackData.userId || undefined,
          userContext: feedbackData.userContext || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        closeFeedback();
        setTimeout(resetFeedback, 300);
      }, 2000);
    } catch {
      // Handle error - in production, show toast
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackData, closeFeedback, resetFeedback]);

  return (
    <FeedbackContext.Provider
      value={{
        isOpen,
        openFeedback,
        closeFeedback,
        toggleFeedback,
        step,
        setStep,
        feedbackData,
        setReason,
        setSubOption,
        setCustomReason,
        setNotes,
        submitFeedback,
        resetFeedback,
        isSubmitting,
        isSubmitted,
        // Element selector
        isSelectingElement,
        startElementSelection,
        cancelElementSelection,
        selectedElement,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
