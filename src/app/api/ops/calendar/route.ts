import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, desc } from '@/db';
import { logger } from '@/lib/utils';

/**
 * GET /api/ops/calendar
 * List appointments with optional status/month filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const month = searchParams.get('month') || undefined; // YYYY-MM format

  const allAppointments = await db.query.appointments.findMany({
    with: { order: true },
    orderBy: [desc(schema.appointments.scheduledStart)],
  });

  // Filter in JS for status and month
  let filtered = allAppointments;

  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }

  if (month) {
    const [year, mon] = month.split('-').map(Number);
    filtered = filtered.filter((a) => {
      const d = new Date(a.scheduledStart);
      return d.getFullYear() === year && d.getMonth() + 1 === mon;
    });
  }

  // Map to API shape
  const appointments = filtered.map((a) => ({
    id: a.id,
    orderId: a.orderId,
    type: a.type,
    scheduledStart: a.scheduledStart.toISOString(),
    scheduledEnd: a.scheduledEnd.toISOString(),
    attendeeName: a.attendeeName || a.order?.customerName || null,
    attendeeEmail: a.attendeeEmail || a.order?.customerEmail || null,
    status: a.status,
    address: a.order?.propertyAddress || null,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
  }));

  return NextResponse.json({ appointments, total: appointments.length });
}

/**
 * POST /api/ops/calendar
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.orderId || !body.scheduledStart || !body.scheduledEnd) {
      return NextResponse.json(
        { error: 'orderId, scheduledStart, and scheduledEnd are required' },
        { status: 400 }
      );
    }

    const [appointment] = await db
      .insert(schema.appointments)
      .values({
        orderId: body.orderId,
        type: body.type || 'installation',
        scheduledStart: new Date(body.scheduledStart),
        scheduledEnd: new Date(body.scheduledEnd),
        attendeeName: body.attendeeName || null,
        attendeeEmail: body.attendeeEmail || null,
        attendeePhone: body.attendeePhone || null,
        notes: body.notes || null,
        status: 'scheduled',
      })
      .returning();

    logger.info('Appointment created', { appointmentId: appointment.id, type: appointment.type });

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        orderId: appointment.orderId,
        type: appointment.type,
        scheduledStart: appointment.scheduledStart.toISOString(),
        scheduledEnd: appointment.scheduledEnd.toISOString(),
        attendeeName: appointment.attendeeName,
        attendeeEmail: appointment.attendeeEmail,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to create appointment', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
