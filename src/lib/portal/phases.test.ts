import { describe, it, expect } from 'vitest';
import { detectPhase, PortalPhase } from './phases';

describe('detectPhase', () => {
  it('returns PRE_QUOTE when no orders or quotes exist', () => {
    const result = detectPhase([], [], []);
    expect(result.phase).toBe(PortalPhase.PRE_QUOTE);
    expect(result.checklistStep).toBe(1);
  });

  it('returns QUOTED when a pending quote exists', () => {
    const quote = { id: 'q1', status: 'measured', address: '123 Main', city: 'Austin', state: 'TX', zip: '78701', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, scheduledDate: null, createdAt: '', updatedAt: '' };
    const result = detectPhase([], [quote as any], []);
    expect(result.phase).toBe(PortalPhase.QUOTED);
    expect(result.checklistStep).toBe(2);
  });

  it('returns QUOTED when order exists but no signed contract', () => {
    const order = { id: 'o1', status: 'pending', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: null, createdAt: '', updatedAt: '' };
    const result = detectPhase([order as any], [], []);
    expect(result.phase).toBe(PortalPhase.QUOTED);
  });

  it('returns CONTRACTED when deposit paid and contract signed', () => {
    const order = { id: 'o1', status: 'deposit_paid', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: null, createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order as any], [], [contract as any]);
    expect(result.phase).toBe(PortalPhase.CONTRACTED);
    expect(result.checklistStep).toBe(5);
  });

  it('returns IN_PROGRESS for active installation', () => {
    const order = { id: 'o1', status: 'in_progress', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 12000, scheduledStartDate: '2026-03-15', createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order as any], [], [contract as any]);
    expect(result.phase).toBe(PortalPhase.IN_PROGRESS);
  });

  it('returns COMPLETE for finished project', () => {
    const order = { id: 'o1', status: 'completed', confirmationNumber: 'RR-001', propertyAddress: '123 Main', propertyCity: 'Austin', propertyState: 'TX', selectedTier: 'better', totalPrice: 15000, depositAmount: 3000, balanceDue: 0, scheduledStartDate: '2026-03-15', createdAt: '', updatedAt: '' };
    const contract = { id: 'c1', status: 'signed', signedAt: '2026-01-01' };
    const result = detectPhase([order as any], [], [contract as any]);
    expect(result.phase).toBe(PortalPhase.COMPLETE);
  });
});
