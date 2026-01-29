'use client';

import { motion } from 'motion/react';

/**
 * Quote flow page transitions
 * Slower, smoother transitions for step-by-step UX
 */
export default function QuoteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing - very smooth, Apple-like
      }}
    >
      {children}
    </motion.div>
  );
}
