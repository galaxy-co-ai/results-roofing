'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

/**
 * Fires a single POST to increment view count on mount.
 * No UI — purely a side-effect component.
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Debounce: only fire once per slug per session
    const key = `blog-view-${slug}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, '1');
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silent failure — view tracking is non-critical
    });
  }, [slug]);

  return null;
}
