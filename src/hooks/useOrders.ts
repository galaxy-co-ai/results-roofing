'use client';

import { useQuery } from '@tanstack/react-query';
import { DEV_BYPASS_ENABLED } from '@/lib/auth/dev-bypass';

interface Order {
  id: string;
  status: string;
  confirmationNumber: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  balanceDue: number;
  scheduledStartDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetails extends Order {
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  propertyZip: string;
  totalPaid: number;
  balance: number;
}

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  processedAt: string | null;
}

interface Appointment {
  id: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
}

interface Contract {
  id: string;
  status: string;
  signedAt: string | null;
}

interface OrderDetailsResponse {
  order: OrderDetails;
  timeline: TimelineStep[];
  payments: Payment[];
  appointments: Appointment[];
  contracts: Contract[];
}

/**
 * Mock order data for development
 */
const MOCK_ORDER: Order = {
  id: 'dev-order-123',
  status: 'scheduled',
  confirmationNumber: 'RR-DEV-2026-001',
  propertyAddress: '123 Development St',
  propertyCity: 'Austin',
  propertyState: 'TX',
  selectedTier: 'better',
  totalPrice: 15500,
  depositAmount: 3100,
  balanceDue: 12400,
  scheduledStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_ORDER_DETAILS: OrderDetailsResponse = {
  order: {
    ...MOCK_ORDER,
    customerName: 'Dev User',
    customerEmail: 'dev@example.com',
    customerPhone: '(555) 123-4567',
    propertyZip: '78701',
    totalPaid: 3100,
    balance: 12400,
  },
  timeline: [
    { id: '1', label: 'Quote Received', status: 'completed', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', label: 'Deposit Paid', status: 'completed', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', label: 'Materials Ordered', status: 'completed', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '4', label: 'Installation', status: 'current', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '5', label: 'Final Inspection', status: 'upcoming' },
  ],
  payments: [
    { id: 'pay-1', amount: 3100, status: 'succeeded', type: 'deposit', processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  appointments: [],
  contracts: [
    { id: 'contract-1', status: 'signed', signedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

async function fetchOrders(email: string): Promise<{ orders: Order[] }> {
  // Return mock data in dev bypass mode
  if (DEV_BYPASS_ENABLED) {
    return { orders: [MOCK_ORDER] };
  }
  
  const res = await fetch(`/api/portal/orders?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

async function fetchOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
  // Return mock data in dev bypass mode
  if (DEV_BYPASS_ENABLED) {
    return MOCK_ORDER_DETAILS;
  }
  
  const res = await fetch(`/api/portal/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch order details');
  }
  return res.json();
}

/**
 * Hook to fetch user's orders
 */
export function useOrders(email: string | null) {
  return useQuery({
    queryKey: ['orders', email],
    queryFn: () => fetchOrders(email!),
    enabled: !!email,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch order details
 */
export function useOrderDetails(orderId: string | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails(orderId!),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export type { Order, OrderDetails, TimelineStep, Payment, Appointment, Contract };
