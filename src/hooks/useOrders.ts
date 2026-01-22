'use client';

import { useQuery } from '@tanstack/react-query';

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

async function fetchOrders(email: string): Promise<{ orders: Order[] }> {
  const res = await fetch(`/api/portal/orders?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

async function fetchOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
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
