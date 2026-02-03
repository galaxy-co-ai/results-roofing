import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';

// Mock tickets for demo
const mockTickets = [
  {
    id: 'ticket-1',
    subject: 'Roof leak after recent rain',
    preview: 'Hi, we noticed water coming through the ceiling...',
    status: 'open' as const,
    priority: 'high' as const,
    channel: 'email' as const,
    contact: {
      id: 'contact-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
    },
    tags: ['urgent', 'leak'],
    messageCount: 3,
    unreadCount: 2,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'ticket-2',
    subject: 'Question about warranty',
    preview: 'I wanted to ask about the warranty coverage...',
    status: 'pending' as const,
    priority: 'medium' as const,
    channel: 'sms' as const,
    contact: {
      id: 'contact-2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
    },
    tags: ['warranty'],
    messageCount: 5,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'ticket-3',
    subject: 'Schedule inspection',
    preview: 'Can I reschedule my inspection to next week?',
    status: 'open' as const,
    priority: 'low' as const,
    channel: 'sms' as const,
    contact: {
      id: 'contact-3',
      name: 'Mike Brown',
      email: 'mike.brown@email.com',
      phone: '+1 (555) 345-6789',
    },
    tags: ['scheduling'],
    messageCount: 2,
    unreadCount: 1,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
    lastMessageAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'ticket-4',
    subject: 'Invoice discrepancy',
    preview: 'The invoice amount doesn\'t match our quote...',
    status: 'pending' as const,
    priority: 'high' as const,
    channel: 'email' as const,
    contact: {
      id: 'contact-4',
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      phone: '+1 (555) 456-7890',
    },
    tags: ['billing', 'urgent'],
    messageCount: 7,
    unreadCount: 1,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'ticket-5',
    subject: 'Great work on the roof!',
    preview: 'Just wanted to say thank you for the excellent...',
    status: 'resolved' as const,
    priority: 'low' as const,
    channel: 'email' as const,
    contact: {
      id: 'contact-5',
      name: 'Robert Wilson',
      email: 'r.wilson@email.com',
      phone: '+1 (555) 567-8901',
    },
    tags: ['feedback', 'positive'],
    messageCount: 4,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'ticket-6',
    subject: 'Material question',
    preview: 'What type of shingles do you recommend for...',
    status: 'open' as const,
    priority: 'medium' as const,
    channel: 'phone' as const,
    contact: {
      id: 'contact-6',
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      phone: '+1 (555) 678-9012',
    },
    tags: ['pre-sale', 'materials'],
    messageCount: 1,
    unreadCount: 1,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    lastMessageAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

/**
 * GET /api/ops/support/tickets
 * List support tickets with optional filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const q = searchParams.get('q');

  let filtered = [...mockTickets];

  // Filter by status
  if (status && status !== 'all') {
    filtered = filtered.filter((t) => t.status === status);
  }

  // Filter by priority
  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  // Search
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.subject.toLowerCase().includes(query) ||
        t.preview.toLowerCase().includes(query) ||
        t.contact.name.toLowerCase().includes(query) ||
        t.contact.email?.toLowerCase().includes(query) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  // Sort by last message (most recent first)
  filtered.sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt).getTime() -
      new Date(a.lastMessageAt || a.updatedAt).getTime()
  );

  return NextResponse.json({
    tickets: filtered,
    total: filtered.length,
    mock: true,
  });
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

    // Create mock ticket
    const newTicket = {
      id: `ticket-${Date.now()}`,
      subject: body.subject,
      preview: body.message?.substring(0, 100) || '',
      status: 'open' as const,
      priority: body.priority || 'medium',
      channel: body.channel || 'web',
      contact: body.contact,
      tags: body.tags || [],
      messageCount: 1,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };

    return NextResponse.json({ ticket: newTicket, mock: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
