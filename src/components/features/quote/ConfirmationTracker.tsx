'use client';

import { useEffect } from 'react';
import { trackConversion, trackEvent } from '@/lib/analytics';

interface ConfirmationTrackerProps {
  quoteId: string;
  orderId: string | null;
  confirmationNumber: string;
  depositAmount: number;
  totalPrice: number;
  tier: 'good' | 'better' | 'best';
}

/**
 * Client component to track confirmation page views and conversions
 * Used within Server Component pages
 */
export function ConfirmationTracker({
  quoteId,
  orderId,
  confirmationNumber,
  depositAmount,
  totalPrice,
  tier,
}: ConfirmationTrackerProps) {
  useEffect(() => {
    // Track confirmation view
    trackEvent('confirmation_viewed', {
      quoteId,
      orderId: orderId || '',
    });

    // Track conversion if we have an order
    if (orderId && confirmationNumber !== 'Pending') {
      trackConversion({
        quoteId,
        orderId,
        confirmationNumber,
        depositAmount,
        totalPrice,
        tier,
      });
    }
  }, [quoteId, orderId, confirmationNumber, depositAmount, totalPrice, tier]);

  return null;
}

export default ConfirmationTracker;
