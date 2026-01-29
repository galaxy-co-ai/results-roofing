'use client';

import { ChevronRight } from 'lucide-react';
import styles from './ScrollToTopCTA.module.css';

interface ScrollToTopCTAProps {
  className?: string;
}

/**
 * Premium smooth scroll CTA button
 * Uses custom easing for a luxurious feel
 */
export function ScrollToTopCTA({ className }: ScrollToTopCTAProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const startPosition = window.scrollY;
    const distance = -startPosition; // Scroll to top (position 0)
    const duration = 1200; // ms - longer for premium feel
    let startTime: number | null = null;

    // Easing function: easeOutQuint - starts fast, decelerates elegantly
    const easeOutQuint = (t: number): number => {
      return 1 - Math.pow(1 - t, 5);
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <a
      href="#quote-form"
      className={`${styles.ctaButton} ${className || ''}`}
      onClick={handleClick}
    >
      Get My Quote
      <ChevronRight size={20} />
    </a>
  );
}

export default ScrollToTopCTA;
