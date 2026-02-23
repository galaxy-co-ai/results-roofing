import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, eq } from '@/db';
import { tickets } from '@/db/schema';
import { isOpsAuthenticated } from '@/lib/ops/auth';

const updateTicketSchema = z.object({
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  assignedTo: z.string().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/ops/support/tickets/[id]
 * Update ticket status, priority, tags, or assignment
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateTicketSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.priority !== undefined) updateData.priority = validated.priority;
    if (validated.tags !== undefined) updateData.tags = validated.tags;
    if (validated.assignedTo !== undefined) updateData.assignedTo = validated.assignedTo;

    const [updated] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = {
      id: updated.id,
      subject: updated.subject,
      status: updated.status,
      priority: updated.priority,
      tags: updated.tags,
      assignedTo: updated.assignedTo,
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json({ ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to update ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/support/tickets/[id]
 * Delete a support ticket (cascade deletes messages)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
