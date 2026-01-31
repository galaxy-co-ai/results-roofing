'use client';

import { type ReactNode, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWizardData } from './WizardContext';

interface StepAnimatorProps {
  children: ReactNode;
}

/**
 * Animation variants for step transitions
 */
const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -20 : 20,
    opacity: 0,
  }),
};

/**
 * Reduced motion variants (instant transitions)
 */
const reducedMotionVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Transition configuration
 */
const transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth easing
};

const reducedMotionTransition = {
  duration: 0.01,
};

/**
 * Wraps step content with animated transitions
 * Slides left/right based on navigation direction
 */
export function StepAnimator({ children }: StepAnimatorProps) {
  const { state, direction, stepInfo } = useWizardData();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef<string | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Move focus to the step container when state changes (for screen readers)
  useEffect(() => {
    if (prevStateRef.current !== null && prevStateRef.current !== state) {
      // Small delay to let animation start
      const timer = setTimeout(() => {
        containerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    prevStateRef.current = state;
  }, [state]);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={state}
        ref={containerRef}
        custom={direction}
        variants={prefersReducedMotion ? reducedMotionVariants : variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={prefersReducedMotion ? reducedMotionTransition : transition}
        className="w-full"
        tabIndex={-1}
        role="region"
        aria-label={`Step: ${stepInfo.label}`}
        aria-live="polite"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Simplified animator for content that doesn't need directional awareness
 */
export function FadeAnimator({ children, keyProp }: { children: ReactNode; keyProp: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default StepAnimator;
