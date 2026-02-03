/**
 * GoHighLevel Conversations API
 * Endpoints for managing conversations and messages (SMS/Email)
 */

import { getGHLClient } from '../client';

export type MessageType = 'TYPE_SMS' | 'TYPE_EMAIL' | 'TYPE_CALL' | 'TYPE_FACEBOOK' | 'TYPE_GMB' | 'TYPE_INSTAGRAM';
export type MessageStatus = 'pending' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
export type MessageDirection = 'inbound' | 'outbound';

export interface GHLConversation {
  id: string;
  locationId: string;
  contactId: string;
  assignedTo?: string;
  lastMessageBody?: string;
  lastMessageDate?: string;
  lastMessageType?: MessageType;
  lastMessageDirection?: MessageDirection;
  unreadCount?: number;
  starred?: boolean;
  dateAdded?: string;
  dateUpdated?: string;
  inbox?: boolean;
  deleted?: boolean;
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface GHLMessage {
  id: string;
  conversationId: string;
  locationId: string;
  contactId: string;
  type: MessageType;
  direction: MessageDirection;
  status: MessageStatus;
  body?: string;
  contentType?: string;
  attachments?: Array<{
    id: string;
    url: string;
    fileName?: string;
    mimeType?: string;
  }>;
  meta?: {
    email?: {
      subject?: string;
      from?: string;
      to?: string[];
      cc?: string[];
      bcc?: string[];
      html?: string;
    };
  };
  dateAdded?: string;
  userId?: string;
}

export interface SendMessageInput {
  type: MessageType;
  contactId: string;
  message?: string;
  html?: string;
  subject?: string;
  emailFrom?: string;
  emailTo?: string;
  emailCc?: string[];
  emailBcc?: string[];
  attachments?: Array<{
    url: string;
    fileName?: string;
  }>;
  scheduledTimestamp?: number;
}

export interface ConversationSearchParams {
  limit?: number;
  startAfter?: string;
  startAfterId?: string;
  status?: 'all' | 'read' | 'unread' | 'starred';
  assignedTo?: string;
  q?: string;
}

export interface MessagesListParams {
  limit?: number;
  lastMessageId?: string;
  type?: MessageType;
}

export interface ConversationsListResponse {
  conversations: GHLConversation[];
  total?: number;
}

export interface MessagesListResponse {
  messages: {
    messages: GHLMessage[];
    lastMessageId?: string;
    nextPage?: boolean;
  };
}

/**
 * List all conversations
 */
export async function listConversations(
  params: ConversationSearchParams = {}
): Promise<ConversationsListResponse> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.get<ConversationsListResponse>('/conversations/', {
    locationId,
    limit: params.limit ?? 20,
    startAfter: params.startAfter,
    startAfterId: params.startAfterId,
    status: params.status,
    assignedTo: params.assignedTo,
    q: params.q,
  });

  return response.data;
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(conversationId: string): Promise<GHLConversation> {
  const client = getGHLClient();

  const response = await client.get<{ conversation: GHLConversation }>(
    `/conversations/${conversationId}`
  );
  return response.data.conversation;
}

/**
 * Search conversations
 */
export async function searchConversations(
  query: string,
  params: Omit<ConversationSearchParams, 'q'> = {}
): Promise<ConversationsListResponse> {
  return listConversations({ ...params, q: query });
}

/**
 * Get messages in a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  params: MessagesListParams = {}
): Promise<MessagesListResponse> {
  const client = getGHLClient();

  const response = await client.get<MessagesListResponse>(
    `/conversations/${conversationId}/messages`,
    {
      limit: params.limit ?? 50,
      lastMessageId: params.lastMessageId,
      type: params.type,
    }
  );

  return response.data;
}

/**
 * Send a message (SMS or Email)
 */
export async function sendMessage(input: SendMessageInput): Promise<GHLMessage> {
  const client = getGHLClient();

  const response = await client.post<{ message: GHLMessage; conversationId: string }>(
    '/conversations/messages',
    {
      type: input.type,
      contactId: input.contactId,
      message: input.message,
      html: input.html,
      subject: input.subject,
      emailFrom: input.emailFrom,
      emailTo: input.emailTo,
      emailCc: input.emailCc,
      emailBcc: input.emailBcc,
      attachments: input.attachments,
      scheduledTimestamp: input.scheduledTimestamp,
    }
  );

  return response.data.message;
}

/**
 * Send an SMS
 */
export async function sendSMS(
  contactId: string,
  message: string,
  options: { scheduledTimestamp?: number } = {}
): Promise<GHLMessage> {
  return sendMessage({
    type: 'TYPE_SMS',
    contactId,
    message,
    scheduledTimestamp: options.scheduledTimestamp,
  });
}

/**
 * Send an email
 */
export async function sendEmail(
  contactId: string,
  options: {
    subject: string;
    html: string;
    emailFrom?: string;
    emailTo?: string;
    emailCc?: string[];
    emailBcc?: string[];
    attachments?: Array<{ url: string; fileName?: string }>;
    scheduledTimestamp?: number;
  }
): Promise<GHLMessage> {
  return sendMessage({
    type: 'TYPE_EMAIL',
    contactId,
    subject: options.subject,
    html: options.html,
    emailFrom: options.emailFrom,
    emailTo: options.emailTo,
    emailCc: options.emailCc,
    emailBcc: options.emailBcc,
    attachments: options.attachments,
    scheduledTimestamp: options.scheduledTimestamp,
  });
}

/**
 * Mark conversation as read
 */
export async function markConversationRead(conversationId: string): Promise<void> {
  const client = getGHLClient();
  await client.put(`/conversations/${conversationId}/read`);
}

/**
 * Mark conversation as unread
 */
export async function markConversationUnread(conversationId: string): Promise<void> {
  const client = getGHLClient();
  await client.put(`/conversations/${conversationId}/unread`);
}

/**
 * Star/unstar a conversation
 */
export async function toggleConversationStar(
  conversationId: string,
  starred: boolean
): Promise<void> {
  const client = getGHLClient();
  await client.put(`/conversations/${conversationId}`, { starred });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const client = getGHLClient();
  await client.delete(`/conversations/${conversationId}`);
}

/**
 * Get or create a conversation for a contact
 */
export async function getOrCreateConversation(contactId: string): Promise<GHLConversation> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  // Try to find existing conversation
  const response = await client.get<ConversationsListResponse>('/conversations/', {
    locationId,
    contactId,
    limit: 1,
  });

  if (response.data.conversations.length > 0) {
    return response.data.conversations[0];
  }

  // Create new conversation
  const createResponse = await client.post<{ conversation: GHLConversation }>(
    '/conversations/',
    { locationId, contactId }
  );

  return createResponse.data.conversation;
}

/**
 * Upload attachment for messages
 */
export async function uploadAttachment(
  file: {
    fileName: string;
    fileUrl: string;
    mimeType?: string;
  }
): Promise<{ attachmentId: string; url: string }> {
  const client = getGHLClient();
  const locationId = client.getLocationId();

  const response = await client.post<{ attachmentId: string; url: string }>(
    '/conversations/messages/upload',
    {
      locationId,
      ...file,
    }
  );

  return response.data;
}
