import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema, eq } from '@/db';

interface RouteParams { params: Promise<{ id: string }> }

/**
 * PATCH /api/ops/calendar/[id]
 * Update an appointment (edit details or cancel)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.type) updateData.type = body.type;
    if (body.scheduledStart) updateData.scheduledStart = new Date(body.scheduledStart);
    if (body.scheduledEnd) updateData.scheduledEnd = new Date(body.scheduledEnd);
    if (body.attendeeName !== undefined) updateData.attendeeName = body.attendeeName;
    if (body.attendeeEmail !== undefined) updateData.attendeeEmail = body.attendeeEmail;
    if (body.attendeePhone !== undefined) updateData.attendeePhone = body.attendeePhone;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'cancelled') {
        updateData.cancelledAt = new Date();
        if (body.cancellationReason) updateData.cancellationReason = body.cancellationReason;
      }
    }

    const [updated] = await db
      .update(schema.appointments)
      .set(updateData)
      .where(eq(schema.appointments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: updated.id,
        status: updated.status,
        scheduledStart: updated.scheduledStart.toISOString(),
        scheduledEnd: updated.scheduledEnd.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
