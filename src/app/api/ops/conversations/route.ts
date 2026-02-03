import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  listConversations,
  sendMessage,
  type SendMessageInput,
} from '@/lib/ghl/api/conversations';

const SendMessageSchema = z.object({
  type: z.enum(['TYPE_SMS', 'TYPE_EMAIL']),
  contactId: z.string().min(1),
  message: z.string().optional(),
  html: z.string().optional(),
  subject: z.string().optional(),
  emailFrom: z.string().optional(),
  emailTo: z.string().optional(),
  emailCc: z.array(z.string()).optional(),
  emailBcc: z.array(z.string()).optional(),
  scheduledTimestamp: z.number().optional(),
});

// Mock data for when GHL is not configured
const mockConversations = [
  {
    id: 'conv-1',
    locationId: 'loc-1',
    contactId: 'contact-1',
    contact: {
      id: 'contact-1',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
    },
    lastMessageBody: 'Thanks for the quote! When can you start the work?',
    lastMessageDate: new Date(Date.now() - 15 * 60000).toISOString(),
    lastMessageType: 'TYPE_SMS' as const,
    lastMessageDirection: 'inbound' as const,
    unreadCount: 2,
    starred: true,
  },
  {
    id: 'conv-2',
    locationId: 'loc-1',
    contactId: 'contact-2',
    contact: {
      id: 'contact-2',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      email: 'sarah.j@email.com',
    },
    lastMessageBody: 'Your appointment is confirmed for tomorrow at 10am.',
    lastMessageDate: new Date(Date.now() - 60 * 60000).toISOString(),
    lastMessageType: 'TYPE_SMS' as const,
    lastMessageDirection: 'outbound' as const,
    unreadCount: 0,
    starred: false,
  },
  {
    id: 'conv-3',
    locationId: 'loc-1',
    contactId: 'contact-3',
    contact: {
      id: 'contact-3',
      name: 'Mike Brown',
      phone: '+1 (555) 345-6789',
      email: 'mike.brown@email.com',
    },
    lastMessageBody: 'Re: Roof Inspection Quote',
    lastMessageDate: new Date(Date.now() - 3 * 3600000).toISOString(),
    lastMessageType: 'TYPE_EMAIL' as const,
    lastMessageDirection: 'inbound' as const,
    unreadCount: 1,
    starred: false,
  },
  {
    id: 'conv-4',
    locationId: 'loc-1',
    contactId: 'contact-4',
    contact: {
      id: 'contact-4',
      name: 'Emily Davis',
      phone: '+1 (555) 456-7890',
      email: 'emily.d@email.com',
    },
    lastMessageBody: 'We completed the inspection. Here are the findings...',
    lastMessageDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    lastMessageType: 'TYPE_EMAIL' as const,
    lastMessageDirection: 'outbound' as const,
    unreadCount: 0,
    starred: true,
  },
  {
    id: 'conv-5',
    locationId: 'loc-1',
    contactId: 'contact-5',
    contact: {
      id: 'contact-5',
      name: 'Robert Wilson',
      phone: '+1 (555) 567-8901',
      email: 'r.wilson@email.com',
    },
    lastMessageBody: 'Can I get a callback about the estimate?',
    lastMessageDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    lastMessageType: 'TYPE_SMS' as const,
    lastMessageDirection: 'inbound' as const,
    unreadCount: 1,
    starred: false,
  },
];

/**
 * GET /api/ops/conversations
 * List conversations with optional filtering
 */
export async function GET(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as 'all' | 'read' | 'unread' | 'starred' | null;
  const q = searchParams.get('q') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const type = searchParams.get('type') as 'TYPE_SMS' | 'TYPE_EMAIL' | null;

  // Check if GHL is configured
  const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

  if (!ghlConfigured) {
    // Return filtered mock data
    let filtered = [...mockConversations];

    // Filter by type
    if (type) {
      filtered = filtered.filter((c) => c.lastMessageType === type);
    }

    // Filter by status
    if (status === 'unread') {
      filtered = filtered.filter((c) => (c.unreadCount ?? 0) > 0);
    } else if (status === 'starred') {
      filtered = filtered.filter((c) => c.starred);
    }

    // Filter by search query
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contact?.name?.toLowerCase().includes(query) ||
          c.contact?.phone?.includes(query) ||
          c.contact?.email?.toLowerCase().includes(query) ||
          c.lastMessageBody?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      conversations: filtered.slice(0, limit),
      total: filtered.length,
      mock: true,
    });
  }

  try {
    const response = await listConversations({
      status: status || undefined,
      q,
      limit,
    });

    // If filtering by type, do it client-side since GHL might not support it directly
    let conversations = response.conversations;
    if (type) {
      conversations = conversations.filter((c) => c.lastMessageType === type);
    }

    return NextResponse.json({
      conversations,
      total: response.total,
    });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/conversations
 * Send a new message (SMS or Email)
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);

    // Check if GHL is configured
    const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

    if (!ghlConfigured) {
      // Return mock response
      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          conversationId: `conv-${validatedData.contactId}`,
          locationId: 'loc-1',
          contactId: validatedData.contactId,
          type: validatedData.type,
          direction: 'outbound',
          status: 'sent',
          body: validatedData.message,
          dateAdded: new Date().toISOString(),
        },
        mock: true,
      });
    }

    const message = await sendMessage(validatedData as SendMessageInput);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
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
