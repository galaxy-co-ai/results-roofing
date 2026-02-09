'use client';

import { useState, useEffect } from 'react';

/**
 * Detects user's prefers-reduced-motion system setting.
 * Returns true if reduced motion is preferred, false otherwise.
 * Subscribes to changes so it reacts to runtime toggling.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
