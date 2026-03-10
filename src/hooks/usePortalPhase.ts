'use client';

import { useMemo } from 'react';
import { useOrders, useOrderDetails } from './useOrders';
import { detectPhase, type PhaseContext } from '@/lib/portal/phases';

export function usePortalPhase(email: string | null) {
  const { data: ordersData, isLoading: ordersLoading } = useOrders(email);
  const currentOrderId = ordersData?.orders[0]?.id ?? null;
  const { data: details, isLoading: detailsLoading } = useOrderDetails(currentOrderId);

  const phaseContext = useMemo<PhaseContext | null>(() => {
    if (!ordersData) return null;
    // Merge contracts from both sources: order details and pending quotes
    const orderContracts = details?.contracts ?? [];
    const quoteContracts = ordersData.contracts ?? [];
    const allContracts = [...orderContracts, ...quoteContracts];
    return detectPhase(
      ordersData.orders,
      ordersData.pendingQuotes,
      allContracts,
    );
  }, [ordersData, details]);

  return {
    phase: phaseContext,
    isLoading: ordersLoading || detailsLoading,
    order: phaseContext?.order ?? null,
    quote: phaseContext?.quote ?? null,
    details,
  };
}
