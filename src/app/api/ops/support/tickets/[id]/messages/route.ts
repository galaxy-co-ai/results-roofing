import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, eq, asc, rawSql } from '@/db';
import { tickets, ticketMessages } from '@/db/schema';
import { isOpsAuthenticated } from '@/lib/ops/auth';

const sendMessageSchema = z.object({
  body: z.string().min(1),
  channel: z.enum(['sms', 'email']),
  html: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ops/support/tickets/[id]/messages
 * Get messages for a specific ticket
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const messages = await db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, id))
      .orderBy(asc(ticketMessages.createdAt));

    // Map to API shape
    const mapped = messages.map((m) => ({
      id: m.id,
      ticketId: m.ticketId,
      direction: m.direction,
      channel: m.channel,
      body: m.body,
      html: m.html,
      author: m.authorName
        ? {
            id: m.authorId || m.id,
            name: m.authorName,
            type: m.authorType,
          }
        : undefined,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      messages: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error('Failed to fetch ticket messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/support/tickets/[id]/messages
 * Add a new message to a ticket
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = sendMessageSchema.parse(body);

    // Insert the message
    const [created] = await db
      .insert(ticketMessages)
      .values({
        ticketId: id,
        body: validated.body,
        html: validated.html || null,
        direction: 'outbound',
        channel: validated.channel,
        authorId: 'agent-1',
        authorName: 'Support Team',
        authorType: 'agent',
      })
      .returning();

    // Update ticket: increment message count, update lastMessageAt and updatedAt
    await db
      .update(tickets)
      .set({
        messageCount: rawSql`${tickets.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id));

    const message = {
      id: created.id,
      ticketId: created.ticketId,
      direction: created.direction,
      channel: created.channel,
      body: created.body,
      html: created.html,
      author: {
        id: created.authorId || created.id,
        name: created.authorName,
        type: created.authorType,
      },
      createdAt: created.createdAt.toISOString(),
    };

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
