// =============================================================================
// Ops Dashboard — Centralized Types
// =============================================================================

// -----------------------------------------------------------------------------
// Common
// -----------------------------------------------------------------------------

export interface OpsContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  tags?: string[];
  source?: string;
  dateAdded?: string;
}

// -----------------------------------------------------------------------------
// CRM
// -----------------------------------------------------------------------------

export interface PipelineStage {
  id: string;
  name: string;
  position?: number;
}

export interface Opportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue?: number;
  contactId: string;
  createdAt?: string;
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PipelineStats {
  totalDeals: number;
  totalValue: number;
  averageValue: number;
}

// -----------------------------------------------------------------------------
// Messaging
// -----------------------------------------------------------------------------

export type MessageType = 'TYPE_SMS' | 'TYPE_EMAIL' | 'TYPE_CALL';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';

export interface MessageAttachment {
  id: string;
  url: string;
  fileName?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  direction: MessageDirection;
  status: MessageStatus;
  body?: string;
  contentType?: string;
  attachments?: MessageAttachment[];
  meta?: {
    email?: {
      subject?: string;
      from?: string;
      to?: string[];
      html?: string;
    };
  };
  dateAdded?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contact?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  lastMessageBody?: string;
  lastMessageDate?: string;
  lastMessageType?: MessageType;
  lastMessageDirection?: MessageDirection;
  unreadCount?: number;
  starred?: boolean;
}

// -----------------------------------------------------------------------------
// Blog
// -----------------------------------------------------------------------------

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  gradient?: string | null;
  icon?: string | null;
  status: PostStatus;
  authorName: string;
  authorRole?: string | null;
  category?: string | null;
  tags?: string[] | null;
  readTime?: number | null;
  featured?: boolean | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
}

// -----------------------------------------------------------------------------
// Support
// -----------------------------------------------------------------------------

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketChannel = 'sms' | 'email' | 'phone' | 'web';

export interface Ticket {
  id: string;
  subject: string;
  preview: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  contact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  assignedTo?: string;
  tags?: string[];
  messageCount: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

// -----------------------------------------------------------------------------
// Documents
// -----------------------------------------------------------------------------

export interface OpsDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  folder: string;
  customerName: string | null;
  customerEmail: string | null;
  propertyAddress: string | null;
  quoteId: string | null;
  docusealDocumentUrl: string | null;
  signedAt: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

export interface HealthStatus {
  ghl?: {
    connected: boolean;
    locationId?: string;
  };
}
