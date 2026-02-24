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
// Estimates (Quotes)
// -----------------------------------------------------------------------------

export type QuoteStatus =
  | 'preliminary'
  | 'measured'
  | 'selected'
  | 'financed'
  | 'scheduled'
  | 'signed'
  | 'converted';

export interface OpsEstimate {
  id: string;
  customer: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  sqftTotal: number | null;
  selectedTier: string | null;
  totalPrice: number | null;
  depositAmount: number | null;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string | null;
}

// -----------------------------------------------------------------------------
// Calendar (Appointments)
// -----------------------------------------------------------------------------

export type AppointmentType = 'installation' | 'inspection' | 'follow_up';
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface OpsAppointment {
  id: string;
  orderId: string;
  type: AppointmentType;
  scheduledStart: string;
  scheduledEnd: string;
  attendeeName: string | null;
  attendeeEmail: string | null;
  status: AppointmentStatus;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------

export type PaymentType = 'deposit' | 'balance' | 'refund';
export type PaymentStatusType =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export interface OpsPayment {
  id: string;
  orderId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatusType;
  paymentMethod: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  customerName: string | null;
  confirmationNumber: string | null;
  processedAt: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Invoices (Orders)
// -----------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'deposit_paid'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OpsInvoice {
  id: string;
  confirmationNumber: string;
  customerName: string | null;
  customerEmail: string;
  propertyAddress: string;
  selectedTier: string;
  totalPrice: number;
  depositAmount: number;
  balanceDue: number;
  paidAmount: number;
  status: OrderStatus;
  financingUsed: string | null;
  scheduledStartDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------

export interface OpsAnalyticsDay {
  date: string;
  revenue: number;
  orders: number;
  quotes: number;
}

export interface OpsAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalQuotes: number;
  avgOrderValue: number;
}

export interface OpsAnalyticsPipelineStage {
  stage: string;
  count: number;
  value: number;
}

export interface OpsAnalyticsResponse {
  daily: OpsAnalyticsDay[];
  summary: OpsAnalyticsSummary;
  pipeline: OpsAnalyticsPipelineStage[];
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Materials
// -----------------------------------------------------------------------------
export type MaterialOrderStatus = 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';

export interface MaterialOrder {
  id: string;
  job: string;
  supplier: string;
  total: string; // decimal comes as string from Drizzle
  status: MaterialOrderStatus;
  notes?: string | null;
  orderedAt?: string | null;
  deliveryAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Automations
// -----------------------------------------------------------------------------
export type AutomationStatus = 'active' | 'paused';

export interface OpsAutomation {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  status: AutomationStatus;
  lastTriggeredAt?: string | null;
  runs: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Team
// -----------------------------------------------------------------------------
export type TeamMemberRole = 'admin' | 'manager' | 'member';

export interface OpsTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamMemberRole;
  activeJobs: number;
  revenue: string;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------
export interface CompanySettings {
  id: string;
  companyName: string;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  updatedAt: string;
}

export interface OpsPipelineStage {
  id: string;
  name: string;
  position: number;
  color?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  eventType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  updatedAt: string;
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

export interface PipelineStageStat {
  stageId: string;
  stageName: string;
  count: number;
  value: number;
}

export interface DashboardStats {
  contacts: number;
  conversations: number;
  pipelineValue: number;
  pipelineByStage: PipelineStageStat[];
  mock: boolean;
}
