import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, eq, desc, and } from '@/db';
import { tickets, ticketMessages, type NewSupportTicket } from '@/db/schema';
import { isOpsAuthenticated } from '@/lib/ops/auth';

const createTicketSchema = z.object({
  subject: z.string().min(1).max(500),
  message: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  channel: z.enum(['sms', 'email', 'phone', 'web']).optional(),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    id: z.string().optional(),
  }),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/ops/support/tickets
 * List support tickets with optional filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const q = searchParams.get('q');

    // Build where conditions
    const conditions = [];
    if (status && status !== 'all') {
      conditions.push(
        eq(tickets.status, status as typeof tickets.status.enumValues[number])
      );
    }
    if (priority) {
      conditions.push(
        eq(tickets.priority, priority as typeof tickets.priority.enumValues[number])
      );
    }

    const results = await db
      .select()
      .from(tickets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tickets.lastMessageAt), desc(tickets.createdAt));

    // Client-side search filter (text search across multiple fields)
    let filtered = results;
    if (q) {
      const query = q.toLowerCase();
      filtered = results.filter(
        (t) =>
          t.subject.toLowerCase().includes(query) ||
          t.preview?.toLowerCase().includes(query) ||
          t.contactName.toLowerCase().includes(query) ||
          t.contactEmail?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Map to API shape (contact as nested object)
    const mapped = filtered.map((t) => ({
      id: t.id,
      subject: t.subject,
      preview: t.preview,
      status: t.status,
      priority: t.priority,
      channel: t.channel,
      contact: {
        id: t.contactId || t.id,
        name: t.contactName,
        email: t.contactEmail,
        phone: t.contactPhone,
      },
      assignedTo: t.assignedTo,
      tags: t.tags,
      messageCount: t.messageCount,
      unreadCount: t.unreadCount,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      lastMessageAt: t.lastMessageAt?.toISOString(),
    }));

    return NextResponse.json({
      tickets: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/support/tickets
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    const now = new Date();

    const newTicket: NewSupportTicket = {
      subject: validated.subject,
      preview: validated.message.substring(0, 200),
      priority: validated.priority || 'medium',
      channel: validated.channel || 'web',
      contactName: validated.contact.name,
      contactEmail: validated.contact.email || null,
      contactPhone: validated.contact.phone || null,
      contactId: validated.contact.id || null,
      tags: validated.tags || [],
      messageCount: 1,
      unreadCount: 0,
      lastMessageAt: now,
    };

    const [created] = await db.insert(tickets).values(newTicket).returning();

    // Create the initial message
    // Message channel maps from ticket channel ('web' -> 'email' since web submissions arrive as email)
    const messageChannel = (validated.channel === 'web' ? 'email' : validated.channel) || 'email';
    await db.insert(ticketMessages).values({
      ticketId: created.id,
      body: validated.message,
      direction: 'inbound',
      channel: messageChannel,
      authorId: validated.contact.id || null,
      authorName: validated.contact.name,
      authorType: 'contact',
    });

    // Map to API shape
    const ticket = {
      id: created.id,
      subject: created.subject,
      preview: created.preview,
      status: created.status,
      priority: created.priority,
      channel: created.channel,
      contact: {
        id: created.contactId || created.id,
        name: created.contactName,
        email: created.contactEmail,
        phone: created.contactPhone,
      },
      assignedTo: created.assignedTo,
      tags: created.tags,
      messageCount: created.messageCount,
      unreadCount: created.unreadCount,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      lastMessageAt: created.lastMessageAt?.toISOString(),
    };

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid ticket data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to create ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
