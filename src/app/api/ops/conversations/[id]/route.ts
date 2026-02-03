import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import {
  getConversation,
  getConversationMessages,
  markConversationRead,
  markConversationUnread,
  toggleConversationStar,
  deleteConversation,
} from '@/lib/ghl/api/conversations';

// Mock messages for demo
const mockMessages: Record<string, Array<{
  id: string;
  conversationId: string;
  locationId: string;
  contactId: string;
  type: 'TYPE_SMS' | 'TYPE_EMAIL';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read';
  body: string;
  dateAdded: string;
  meta?: { email?: { subject?: string; html?: string } };
}>> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'Hi John, this is Results Roofing. We wanted to follow up on your roof inspection request.',
      dateAdded: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'inbound',
      status: 'read',
      body: 'Hi! Yes, I\'m still interested. What are your available times this week?',
      dateAdded: new Date(Date.now() - 3 * 24 * 3600000 + 3600000).toISOString(),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'We can come by Thursday at 2pm or Friday at 10am. Which works better for you?',
      dateAdded: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'inbound',
      status: 'read',
      body: 'Friday at 10am works great!',
      dateAdded: new Date(Date.now() - 2 * 24 * 3600000 + 7200000).toISOString(),
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'Perfect! You\'re confirmed for Friday at 10am. We\'ll send a reminder the day before. See you then!',
      dateAdded: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-1-6',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'Here\'s the quote for the roof repair work we discussed: $4,500 for shingle replacement on the east side.',
      dateAdded: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    {
      id: 'msg-1-7',
      conversationId: 'conv-1',
      locationId: 'loc-1',
      contactId: 'contact-1',
      type: 'TYPE_SMS',
      direction: 'inbound',
      status: 'read',
      body: 'Thanks for the quote! When can you start the work?',
      dateAdded: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      locationId: 'loc-1',
      contactId: 'contact-2',
      type: 'TYPE_SMS',
      direction: 'inbound',
      status: 'read',
      body: 'Hi, I\'d like to schedule a roof inspection please.',
      dateAdded: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      locationId: 'loc-1',
      contactId: 'contact-2',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'Hi Sarah! We\'d be happy to help. Is tomorrow at 10am good for you?',
      dateAdded: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      locationId: 'loc-1',
      contactId: 'contact-2',
      type: 'TYPE_SMS',
      direction: 'inbound',
      status: 'read',
      body: 'That works perfectly!',
      dateAdded: new Date(Date.now() - 24 * 3600000 + 3600000).toISOString(),
    },
    {
      id: 'msg-2-4',
      conversationId: 'conv-2',
      locationId: 'loc-1',
      contactId: 'contact-2',
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'delivered',
      body: 'Your appointment is confirmed for tomorrow at 10am.',
      dateAdded: new Date(Date.now() - 60 * 60000).toISOString(),
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      locationId: 'loc-1',
      contactId: 'contact-3',
      type: 'TYPE_EMAIL',
      direction: 'outbound',
      status: 'delivered',
      body: '',
      dateAdded: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
      meta: {
        email: {
          subject: 'Roof Inspection Quote - Results Roofing',
          html: '<p>Dear Mr. Brown,</p><p>Thank you for your interest in our roofing services. Based on our initial assessment, we\'d like to schedule a detailed inspection of your property.</p><p>Please let us know your availability.</p><p>Best regards,<br/>Results Roofing Team</p>',
        },
      },
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      locationId: 'loc-1',
      contactId: 'contact-3',
      type: 'TYPE_EMAIL',
      direction: 'inbound',
      status: 'read',
      body: '',
      dateAdded: new Date(Date.now() - 3 * 3600000).toISOString(),
      meta: {
        email: {
          subject: 'Re: Roof Inspection Quote',
          html: '<p>Hello,</p><p>I\'m available next Tuesday or Wednesday afternoon. Would either of those work?</p><p>Thanks,<br/>Mike</p>',
        },
      },
    },
  ],
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ops/conversations/[id]
 * Get conversation details and messages
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const includeMessages = searchParams.get('messages') !== 'false';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // Check if GHL is configured
  const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

  if (!ghlConfigured) {
    // Return mock data
    const messages = mockMessages[id] || [];
    return NextResponse.json({
      conversation: { id },
      messages: includeMessages ? messages.slice(-limit) : undefined,
      mock: true,
    });
  }

  try {
    const conversation = await getConversation(id);

    let messages;
    if (includeMessages) {
      const messagesResponse = await getConversationMessages(id, { limit });
      messages = messagesResponse.messages?.messages || [];
    }

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ops/conversations/[id]
 * Update conversation (mark read/unread, star/unstar)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { read, starred } = body;

    // Check if GHL is configured
    const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

    if (!ghlConfigured) {
      return NextResponse.json({ success: true, mock: true });
    }

    if (typeof read === 'boolean') {
      if (read) {
        await markConversationRead(id);
      } else {
        await markConversationUnread(id);
      }
    }

    if (typeof starred === 'boolean') {
      await toggleConversationStar(id, starred);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ops/conversations/[id]
 * Delete a conversation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Check if GHL is configured
  const ghlConfigured = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

  if (!ghlConfigured) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    await deleteConversation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
