'use client';

import { motion } from 'motion/react';

/**
 * Page transition template
 * Wraps all pages with a premium fade + lift animation
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing - smooth deceleration
      }}
    >
      {children}
    </motion.div>
  );
}
