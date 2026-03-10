import type { Order, PendingQuote, Contract } from '@/hooks/useOrders';

export enum PortalPhase {
  PRE_QUOTE = 1,
  QUOTED = 2,
  CONTRACTED = 3,
  IN_PROGRESS = 4,
  COMPLETE = 5,
}

export interface PhaseContext {
  phase: PortalPhase;
  order: Order | null;
  quote: PendingQuote | null;
  hasSignedContract: boolean;
  hasDeposit: boolean;
  checklistStep: number;
}

export function detectPhase(
  orders: Order[],
  pendingQuotes: PendingQuote[],
  contracts: Contract[],
): PhaseContext {
  const order = orders[0] ?? null;
  const quote = pendingQuotes[0] ?? null;
  const hasSignedContract = contracts.some(c => c.status === 'signed');
  const hasDeposit = order?.status === 'deposit_paid'
    || order?.status === 'scheduled'
    || order?.status === 'in_progress'
    || order?.status === 'completed';

  if (order?.status === 'completed') {
    return { phase: PortalPhase.COMPLETE, order, quote, hasSignedContract, hasDeposit, checklistStep: 5 };
  }

  if (order?.status === 'in_progress') {
    return { phase: PortalPhase.IN_PROGRESS, order, quote, hasSignedContract, hasDeposit, checklistStep: 5 };
  }

  if (hasSignedContract) {
    // Contract signed — advance to step 3 (consultation) or 4 (deposit) based on deposit status
    const step = hasDeposit ? 5 : 3;
    return { phase: PortalPhase.CONTRACTED, order, quote, hasSignedContract, hasDeposit, checklistStep: step };
  }

  if (order || quote) {
    return { phase: PortalPhase.QUOTED, order, quote, hasSignedContract, hasDeposit, checklistStep: 2 };
  }

  return { phase: PortalPhase.PRE_QUOTE, order: null, quote: null, hasSignedContract: false, hasDeposit: false, checklistStep: 1 };
}
