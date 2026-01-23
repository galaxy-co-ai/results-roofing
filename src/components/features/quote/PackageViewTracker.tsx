'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface PackageViewTrackerProps {
  quoteId: string;
}

/**
 * Client component to track package page views
 * Used within Server Component pages
 */
export function PackageViewTracker({ quoteId }: PackageViewTrackerProps) {
  useEffect(() => {
    trackEvent('package_viewed', { quoteId });
  }, [quoteId]);

  return null;
}

export default PackageViewTracker;
