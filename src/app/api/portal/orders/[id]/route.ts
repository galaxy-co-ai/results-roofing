import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getOrder, 
  getPaymentsByOrderId, 
  getAppointmentsByOrderId, 
  getContractsByOrderId,
  getTotalPaidForOrder 
} from '@/db/queries';
import { logger } from '@/lib/utils';

/**
 * GET /api/portal/orders/[id]
 * Get order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get related data
    const [payments, appointments, contracts, totalPaid] = await Promise.all([
      getPaymentsByOrderId(id),
      getAppointmentsByOrderId(id),
      getContractsByOrderId(id),
      getTotalPaidForOrder(id),
    ]);

    const balance = parseFloat(order.totalPrice) - totalPaid;

    // Build timeline based on order status
    const timeline = buildTimeline(order);

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        confirmationNumber: order.confirmationNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        propertyAddress: order.propertyAddress,
        propertyCity: order.propertyCity,
        propertyState: order.propertyState,
        propertyZip: order.propertyZip,
        selectedTier: order.selectedTier,
        totalPrice: parseFloat(order.totalPrice),
        depositAmount: parseFloat(order.depositAmount),
        totalPaid,
        balance,
        scheduledStartDate: order.scheduledStartDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      timeline,
      payments: payments.map((p) => ({
        id: p.id,
        amount: parseFloat(p.amount),
        status: p.status,
        type: p.type,
        processedAt: p.processedAt,
      })),
      appointments: appointments.map((a) => ({
        id: a.id,
        status: a.status,
        scheduledStart: a.scheduledStart,
        scheduledEnd: a.scheduledEnd,
      })),
      contracts: contracts.map((c) => ({
        id: c.id,
        status: c.status,
        signedAt: c.signedAt,
      })),
    });
  } catch (error) {
    logger.error('Error fetching order details', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

function buildTimeline(order: { status: string; createdAt: Date }): TimelineStep[] {
  const statusOrder = ['pending', 'deposit_paid', 'scheduled', 'in_progress', 'completed'];
  const currentIndex = statusOrder.indexOf(order.status);

  const steps: TimelineStep[] = [
    { id: 'contract', label: 'Contract Signed', status: 'upcoming' },
    { id: 'deposit', label: 'Deposit Paid', status: 'upcoming' },
    { id: 'materials', label: 'Materials Ordered', status: 'upcoming' },
    { id: 'installation', label: 'Installation', status: 'upcoming' },
    { id: 'complete', label: 'Project Complete', status: 'upcoming' },
  ];

  // Mark steps based on status
  if (currentIndex >= 0) {
    steps[0].status = 'completed';
    steps[0].date = order.createdAt.toISOString();
  }
  if (currentIndex >= 1) {
    steps[1].status = 'completed';
  }
  if (currentIndex >= 2) {
    steps[2].status = 'completed';
    steps[3].status = 'current';
  }
  if (currentIndex >= 3) {
    steps[3].status = 'completed';
    steps[4].status = 'current';
  }
  if (currentIndex >= 4) {
    steps[4].status = 'completed';
  }

  // Set current if in early stages
  if (currentIndex === 0) {
    steps[1].status = 'current';
  } else if (currentIndex === 1) {
    steps[2].status = 'current';
  }

  return steps;
}
