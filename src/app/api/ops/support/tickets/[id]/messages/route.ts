import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';

// Mock messages for demo tickets
const mockMessages: Record<string, Array<{
  id: string;
  ticketId: string;
  direction: 'inbound' | 'outbound' | 'note';
  channel: 'sms' | 'email' | 'phone' | 'note';
  body: string;
  html?: string;
  author?: {
    id: string;
    name: string;
    type: 'contact' | 'agent';
  };
  createdAt: string;
}>> = {
  'ticket-1': [
    {
      id: 'msg-1-1',
      ticketId: 'ticket-1',
      direction: 'inbound',
      channel: 'email',
      body: 'Hi, we noticed water coming through the ceiling in our living room after the recent heavy rain. We had you install our roof about 2 years ago and this is the first time we\'ve had any issues. Can someone come take a look?',
      author: { id: 'contact-1', name: 'John Smith', type: 'contact' },
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'msg-1-2',
      ticketId: 'ticket-1',
      direction: 'outbound',
      channel: 'email',
      body: 'Hi John, thank you for reaching out. We\'re sorry to hear about the leak. Since your roof is still under our workmanship warranty, we\'ll send someone out to inspect and fix this at no charge. Can you share some photos of the affected area?',
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' },
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    {
      id: 'msg-1-3',
      ticketId: 'ticket-1',
      direction: 'inbound',
      channel: 'email',
      body: 'Thank you for the quick response! I\'ve attached some photos showing the water stain on the ceiling. It seems to be getting worse with each rain. What times are available for the inspection?',
      author: { id: 'contact-1', name: 'John Smith', type: 'contact' },
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
  ],
  'ticket-2': [
    {
      id: 'msg-2-1',
      ticketId: 'ticket-2',
      direction: 'inbound',
      channel: 'sms',
      body: 'Hi, I wanted to ask about the warranty coverage for my roof. Does it cover storm damage?',
      author: { id: 'contact-2', name: 'Sarah Johnson', type: 'contact' },
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-2',
      ticketId: 'ticket-2',
      direction: 'outbound',
      channel: 'sms',
      body: 'Hi Sarah! Great question. Your warranty covers workmanship for 10 years. Storm damage is typically covered by homeowner\'s insurance. What specific issue are you experiencing?',
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' },
      createdAt: new Date(Date.now() - 23 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-3',
      ticketId: 'ticket-2',
      direction: 'inbound',
      channel: 'sms',
      body: 'We had some hail last week and noticed a few damaged shingles. Should I file an insurance claim?',
      author: { id: 'contact-2', name: 'Sarah Johnson', type: 'contact' },
      createdAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-4',
      ticketId: 'ticket-2',
      direction: 'outbound',
      channel: 'sms',
      body: 'Yes, I\'d recommend filing a claim. We can provide documentation of the damage and work with your insurance adjuster. Want me to schedule an inspection?',
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' },
      createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-5',
      ticketId: 'ticket-2',
      direction: 'inbound',
      channel: 'sms',
      body: 'That would be great. I\'ll contact my insurance and get back to you with a date.',
      author: { id: 'contact-2', name: 'Sarah Johnson', type: 'contact' },
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
  'ticket-3': [
    {
      id: 'msg-3-1',
      ticketId: 'ticket-3',
      direction: 'inbound',
      channel: 'sms',
      body: 'Hi, I have an inspection scheduled for tomorrow but something came up. Can I reschedule to next week?',
      author: { id: 'contact-3', name: 'Mike Brown', type: 'contact' },
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 'msg-3-2',
      ticketId: 'ticket-3',
      direction: 'outbound',
      channel: 'sms',
      body: 'Of course, Mike! Let me check our availability. We have openings on Monday at 10am or Wednesday at 2pm. Which works better for you?',
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' },
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ],
  'ticket-4': [
    {
      id: 'msg-4-1',
      ticketId: 'ticket-4',
      direction: 'inbound',
      channel: 'email',
      body: 'Hello, I received the invoice for my recent roof repair but the amount doesn\'t match the quote I was given. The quote was for $3,200 but the invoice shows $3,850. Can you explain the difference?',
      author: { id: 'contact-4', name: 'Emily Davis', type: 'contact' },
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 'msg-4-2',
      ticketId: 'ticket-4',
      direction: 'note',
      channel: 'note',
      body: 'Checked with field team - additional work was needed due to hidden water damage found during repair. Customer wasn\'t notified before proceeding.',
      author: { id: 'agent-2', name: 'Tom (Manager)', type: 'agent' },
      createdAt: new Date(Date.now() - 46 * 3600000).toISOString(),
    },
    {
      id: 'msg-4-3',
      ticketId: 'ticket-4',
      direction: 'outbound',
      channel: 'email',
      body: 'Hi Emily, thank you for bringing this to our attention. I\'ve reviewed your account and see that there was additional work required due to water damage discovered during the repair. We apologize for not communicating this before proceeding. Let me review with my manager and get back to you with a resolution.',
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' },
      createdAt: new Date(Date.now() - 45 * 3600000).toISOString(),
    },
  ],
};

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
  const messages = mockMessages[id] || [];

  return NextResponse.json({
    messages,
    total: messages.length,
    mock: true,
  });
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

    const newMessage = {
      id: `msg-${id}-${Date.now()}`,
      ticketId: id,
      direction: 'outbound' as const,
      channel: body.channel || 'sms',
      body: body.body,
      html: body.html,
      author: { id: 'agent-1', name: 'Support Team', type: 'agent' as const },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ message: newMessage, mock: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
