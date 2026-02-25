import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  OpsContact,
  Opportunity,
  PipelineStage,
  BlogPost,
  PostStatus,
  Conversation,
  Message,
  Ticket,
  TicketStatus,
  OpsDocument,
  HealthStatus,
  DashboardStats,
  OpsEstimate,
  QuoteStatus,
  OpsAppointment,
  OpsPayment,
  OpsInvoice,
  OrderStatus,
  OpsAnalyticsResponse,
  MaterialOrder,
  OpsAutomation,
  OpsTeamMember,
  CompanySettings,
  OpsPipelineStage,
  NotificationPreference,
} from '@/types/ops';
import type { TicketMessage } from '@/components/features/ops/support';

// ---------------------------------------------------------------------------
// Key factory
// ---------------------------------------------------------------------------

export const opsKeys = {
  all: ['ops'] as const,
  health: () => [...opsKeys.all, 'health'] as const,
  dashboardStats: () => [...opsKeys.all, 'dashboard-stats'] as const,
  contacts: () => [...opsKeys.all, 'contacts'] as const,
  pipeline: () => [...opsKeys.all, 'pipeline'] as const,
  conversations: (type: string) => [...opsKeys.all, 'conversations', type] as const,
  messages: (conversationId: string) => [...opsKeys.all, 'messages', conversationId] as const,
  blogPosts: (filters?: { status?: string; search?: string }) =>
    [...opsKeys.all, 'blog-posts', filters] as const,
  documents: (folder?: string | null) => [...opsKeys.all, 'documents', folder] as const,
  estimates: (filters?: { status?: string; search?: string }) =>
    [...opsKeys.all, 'estimates', filters] as const,
  calendar: (filters?: { month?: string; status?: string }) =>
    [...opsKeys.all, 'calendar', filters] as const,
  payments: (filters?: { status?: string; method?: string; search?: string }) =>
    [...opsKeys.all, 'payments', filters] as const,
  invoices: (filters?: { status?: string; search?: string }) =>
    [...opsKeys.all, 'invoices', filters] as const,
  analytics: (filters?: { from?: string; to?: string }) =>
    [...opsKeys.all, 'analytics', filters] as const,
  tickets: (filters?: { status?: string; search?: string }) =>
    [...opsKeys.all, 'tickets', filters] as const,
  ticketMessages: (ticketId: string) => [...opsKeys.all, 'ticket-messages', ticketId] as const,
  materials: () => [...opsKeys.all, 'materials'] as const,
  automations: () => [...opsKeys.all, 'automations'] as const,
  team: () => [...opsKeys.all, 'team'] as const,
  settings: () => [...opsKeys.all, 'settings'] as const,
  pipelineStages: () => [...opsKeys.all, 'pipeline-stages'] as const,
  notifications: () => [...opsKeys.all, 'notifications'] as const,
};

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function opsFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function opsMutate<T>(url: string, opts: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${url}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export function useOpsHealth() {
  return useQuery({
    queryKey: opsKeys.health(),
    queryFn: () => opsFetch<HealthStatus>('/api/ops/health'),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export function useOpsDashboardStats() {
  return useQuery({
    queryKey: opsKeys.dashboardStats(),
    queryFn: () => opsFetch<DashboardStats>('/api/ops/dashboard/stats'),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export function useOpsContacts() {
  return useQuery({
    queryKey: opsKeys.contacts(),
    queryFn: () => opsFetch<{ contacts: OpsContact[] }>('/api/ops/contacts').then((d) => d.contacts),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: Partial<OpsContact>) =>
      opsMutate<{ contact: OpsContact }>('/api/ops/contacts', {
        method: 'POST',
        body: JSON.stringify(contact),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.contacts() }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) =>
      opsMutate<{ success: boolean }>(`/api/ops/contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.contacts() }),
  });
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

interface PipelineData {
  stages: PipelineStage[];
  opportunities: Opportunity[];
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'stage-1', name: 'New Lead', position: 0 },
  { id: 'stage-2', name: 'Contacted', position: 1 },
  { id: 'stage-3', name: 'Quote Sent', position: 2 },
  { id: 'stage-4', name: 'Negotiation', position: 3 },
  { id: 'stage-5', name: 'Won', position: 4 },
];

export function useOpsPipeline() {
  return useQuery({
    queryKey: opsKeys.pipeline(),
    queryFn: async (): Promise<PipelineData> => {
      const data = await opsFetch<{ pipelines: Array<{ stages: PipelineStage[] }>; opportunities: Opportunity[] }>(
        '/api/ops/pipelines?opportunities=true'
      );
      const pipeline = data.pipelines?.[0];
      return {
        stages: pipeline?.stages || DEFAULT_STAGES,
        opportunities: data.opportunities || [],
      };
    },
  });
}

export function useMoveOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ opportunityId, stageId }: { opportunityId: string; stageId: string }) =>
      opsMutate(`/api/ops/opportunities/${opportunityId}`, {
        method: 'PATCH',
        body: JSON.stringify({ pipelineStageId: stageId }),
      }),
    onMutate: async ({ opportunityId, stageId }) => {
      await qc.cancelQueries({ queryKey: opsKeys.pipeline() });
      const prev = qc.getQueryData<PipelineData>(opsKeys.pipeline());
      qc.setQueryData<PipelineData>(opsKeys.pipeline(), (old) =>
        old
          ? {
              ...old,
              opportunities: old.opportunities.map((o) =>
                o.id === opportunityId ? { ...o, pipelineStageId: stageId } : o
              ),
            }
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(opsKeys.pipeline(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: opsKeys.pipeline() }),
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      pipelineId: string;
      pipelineStageId: string;
      contactId: string;
      status?: string;
      monetaryValue?: number;
    }) =>
      opsMutate<{ opportunity: Opportunity }>('/api/ops/pipelines', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipeline() }),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      opportunityId,
      ...data
    }: {
      opportunityId: string;
      name?: string;
      pipelineStageId?: string;
      status?: string;
      monetaryValue?: number;
    }) =>
      opsMutate(`/api/ops/opportunities/${opportunityId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipeline() }),
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) =>
      opsMutate<{ success: boolean }>(`/api/ops/opportunities/${opportunityId}`, {
        method: 'DELETE',
      }),
    onMutate: async (opportunityId) => {
      await qc.cancelQueries({ queryKey: opsKeys.pipeline() });
      const prev = qc.getQueryData<PipelineData>(opsKeys.pipeline());
      qc.setQueryData<PipelineData>(opsKeys.pipeline(), (old) =>
        old
          ? {
              ...old,
              opportunities: old.opportunities.filter((o) => o.id !== opportunityId),
            }
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(opsKeys.pipeline(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: opsKeys.pipeline() }),
  });
}

// ---------------------------------------------------------------------------
// Conversations (SMS / Email)
// ---------------------------------------------------------------------------

export function useOpsConversations(type: 'TYPE_SMS' | 'TYPE_EMAIL', filter?: string, search?: string) {
  return useQuery({
    queryKey: opsKeys.conversations(type),
    queryFn: () => {
      const params = new URLSearchParams({ type });
      if (filter && filter !== 'all') params.set('status', filter);
      if (search) params.set('q', search);
      return opsFetch<{ conversations: Conversation[] }>(`/api/ops/conversations?${params}`).then(
        (d) => d.conversations
      );
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: opsKeys.messages(conversationId || ''),
    queryFn: () =>
      opsFetch<{ messages: Message[] }>(`/api/ops/conversations/${conversationId}?messages=true`).then(
        (d) => d.messages
      ),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string; type?: string }) =>
      opsMutate(`/api/ops/conversations/${conversationId}`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: opsKeys.messages(vars.conversationId) });
    },
  });
}

export function useMarkConversationRead() {
  return useMutation({
    mutationFn: (conversationId: string) =>
      opsMutate(`/api/ops/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      }),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: 'TYPE_SMS' | 'TYPE_EMAIL';
      contactId: string;
      message?: string;
      subject?: string;
      html?: string;
      emailTo?: string;
    }) =>
      opsMutate<{ message: Message; mock?: boolean }>('/api/ops/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: opsKeys.conversations(vars.type) });
    },
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      subject: string;
      message: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      channel?: 'sms' | 'email' | 'phone' | 'web';
      contact: {
        name: string;
        email?: string;
        phone?: string;
        id?: string;
      };
      tags?: string[];
    }) =>
      opsMutate<{ ticket: Ticket }>('/api/ops/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'tickets'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contactId,
      ...data
    }: {
      contactId: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      state?: string;
    }) =>
      opsMutate<{ contact: OpsContact }>(`/api/ops/contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.contacts() }),
  });
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export function useOpsBlogPosts(status?: PostStatus | 'all', search?: string) {
  const filters = { status: status !== 'all' ? status : undefined, search: search || undefined };
  return useQuery({
    queryKey: opsKeys.blogPosts(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      return opsFetch<{ posts: BlogPost[] }>(`/api/ops/blog/posts?${params}`).then((d) => d.posts);
    },
  });
}

export function useSaveBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<BlogPost> & { id?: string }) =>
      id
        ? opsMutate<{ post: BlogPost }>(`/api/ops/blog/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
        : opsMutate<{ post: BlogPost }>('/api/ops/blog/posts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'blog-posts'] }),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => opsMutate(`/api/ops/blog/posts/${postId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'blog-posts'] }),
  });
}

export function usePublishBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, publish }: { postId: string; publish: boolean }) =>
      opsMutate(`/api/ops/blog/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: publish ? 'published' : 'draft', publishedAt: publish ? new Date().toISOString() : null }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'blog-posts'] }),
  });
}

// ---------------------------------------------------------------------------
// Estimates (Quotes)
// ---------------------------------------------------------------------------

export function useOpsEstimates(status?: QuoteStatus | 'all', search?: string) {
  const filters = { status: status !== 'all' ? status : undefined, search: search || undefined };
  return useQuery({
    queryKey: opsKeys.estimates(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      return opsFetch<{ estimates: OpsEstimate[]; total: number }>(
        `/api/ops/estimates?${params}`
      ).then((d) => d.estimates);
    },
  });
}

export function useUpdateEstimateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ estimateId, status }: { estimateId: string; status: QuoteStatus }) =>
      opsMutate(`/api/ops/estimates/${estimateId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'estimates'] }),
  });
}

export function useDeleteEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estimateId: string) =>
      opsMutate<{ success: boolean }>(`/api/ops/estimates/${estimateId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'estimates'] }),
  });
}

// ---------------------------------------------------------------------------
// Calendar (Appointments)
// ---------------------------------------------------------------------------

export function useOpsCalendar(month?: string, status?: string) {
  const filters = { month, status: status || undefined };
  return useQuery({
    queryKey: opsKeys.calendar(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.month) params.set('month', filters.month);
      if (filters.status) params.set('status', filters.status);
      return opsFetch<{ appointments: OpsAppointment[]; total: number }>(
        `/api/ops/calendar?${params}`
      ).then((d) => d.appointments);
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      orderId: string;
      type: string;
      scheduledStart: string;
      scheduledEnd: string;
      attendeeName?: string;
      attendeeEmail?: string;
      attendeePhone?: string;
      notes?: string;
    }) =>
      opsMutate<{ appointment: OpsAppointment }>('/api/ops/calendar', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'calendar'] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      type?: string;
      scheduledStart?: string;
      scheduledEnd?: string;
      attendeeName?: string;
      attendeeEmail?: string;
      attendeePhone?: string;
      notes?: string;
      status?: string;
    }) =>
      opsMutate(`/api/ops/calendar/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'calendar'] }),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      opsMutate(`/api/ops/calendar/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'calendar'] }),
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

interface PaymentStats {
  totalReceived: number;
  pendingAmount: number;
  failedAmount: number;
}

export function useOpsPayments(status?: string, method?: string, search?: string) {
  const filters = {
    status: status || undefined,
    method: method || undefined,
    search: search || undefined,
  };
  return useQuery({
    queryKey: opsKeys.payments(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.method) params.set('method', filters.method);
      if (filters.search) params.set('search', filters.search);
      return opsFetch<{ payments: OpsPayment[]; total: number; stats: PaymentStats }>(
        `/api/ops/payments?${params}`
      );
    },
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      opsMutate(`/api/ops/payments/${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'payments'] }),
  });
}

// ---------------------------------------------------------------------------
// Invoices (Orders)
// ---------------------------------------------------------------------------

interface InvoiceStats {
  totalInvoiced: number;
  outstanding: number;
  paid: number;
}

export function useOpsInvoices(status?: OrderStatus | 'all', search?: string) {
  const filters = { status: status !== 'all' ? status : undefined, search: search || undefined };
  return useQuery({
    queryKey: opsKeys.invoices(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      return opsFetch<{ invoices: OpsInvoice[]; total: number; stats: InvoiceStats }>(
        `/api/ops/invoices?${params}`
      );
    },
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string; status: OrderStatus }) =>
      opsMutate(`/api/ops/invoices/${invoiceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'invoices'] }),
  });
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export function useOpsAnalytics(from?: string, to?: string) {
  const filters = { from, to };
  return useQuery({
    queryKey: opsKeys.analytics(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return opsFetch<OpsAnalyticsResponse>(`/api/ops/analytics${qs ? `?${qs}` : ''}`);
    },
    staleTime: 120_000,
  });
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export function useOpsDocuments(folder?: string | null) {
  return useQuery({
    queryKey: opsKeys.documents(folder),
    queryFn: () => {
      const url = folder ? `/api/ops/documents?folder=${encodeURIComponent(folder)}` : '/api/ops/documents';
      return opsFetch<{ documents: OpsDocument[]; folderStats: Array<{ folder: string; count: number }> }>(url);
    },
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type?: string;
      status?: string;
      folder?: string;
      customerName?: string;
      customerEmail?: string;
      propertyAddress?: string;
    }) =>
      opsMutate<{ document: OpsDocument }>('/api/ops/documents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'documents'] }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; folder?: string; status?: string }) =>
      opsMutate(`/api/ops/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      opsMutate<{ success: boolean }>(`/api/ops/documents/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'documents'] }),
  });
}

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export function useOpsTickets(status?: TicketStatus | 'all', search?: string) {
  const filters = { status: status !== 'all' ? status : undefined, search: search || undefined };
  return useQuery({
    queryKey: opsKeys.tickets(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('q', filters.search);
      return opsFetch<{ tickets: Ticket[] }>(`/api/ops/support/tickets?${params}`).then((d) => d.tickets);
    },
  });
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: opsKeys.ticketMessages(ticketId || ''),
    queryFn: () =>
      opsFetch<{ messages: TicketMessage[] }>(
        `/api/ops/support/tickets/${ticketId}/messages`
      ).then((d) => d.messages),
    enabled: !!ticketId,
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      ...data
    }: {
      ticketId: string;
      status?: TicketStatus;
      priority?: string;
      tags?: string[];
      assignedTo?: string | null;
    }) =>
      opsMutate<{ ticket: Partial<Ticket> }>(`/api/ops/support/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'tickets'] }),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) =>
      opsMutate<{ success: boolean }>(`/api/ops/support/tickets/${ticketId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...opsKeys.all, 'tickets'] }),
  });
}

export function useSendTicketMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      body,
      channel,
    }: {
      ticketId: string;
      body: string;
      channel: 'sms' | 'email';
    }) =>
      opsMutate<{ message: TicketMessage }>(`/api/ops/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, channel }),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: opsKeys.ticketMessages(vars.ticketId) });
      qc.invalidateQueries({ queryKey: [...opsKeys.all, 'tickets'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export function useOpsMaterials() {
  return useQuery({
    queryKey: opsKeys.materials(),
    queryFn: () => opsFetch<{ orders: MaterialOrder[] }>('/api/ops/materials').then((d) => d.orders),
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { job: string; supplier: string; total: string; notes?: string }) =>
      opsMutate<{ order: MaterialOrder }>('/api/ops/materials', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.materials() }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<MaterialOrder>) =>
      opsMutate<{ order: MaterialOrder }>(`/api/ops/materials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.materials() }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      opsMutate(`/api/ops/materials/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.materials() }),
  });
}

// ---------------------------------------------------------------------------
// Automations
// ---------------------------------------------------------------------------

export function useOpsAutomations() {
  return useQuery({
    queryKey: opsKeys.automations(),
    queryFn: () =>
      opsFetch<{ automations: OpsAutomation[] }>('/api/ops/automations').then((d) => d.automations),
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; trigger: string; actions: string; templateId?: string }) =>
      opsMutate<{ automation: OpsAutomation }>('/api/ops/automations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.automations() }),
  });
}

export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<OpsAutomation>) =>
      opsMutate<{ automation: OpsAutomation }>(`/api/ops/automations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.automations() }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      opsMutate(`/api/ops/automations/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.automations() }),
  });
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export function useOpsTeam() {
  return useQuery({
    queryKey: opsKeys.team(),
    queryFn: () => opsFetch<{ members: OpsTeamMember[] }>('/api/ops/team').then((d) => d.members),
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; phone?: string; role?: string }) =>
      opsMutate<{ member: OpsTeamMember }>('/api/ops/team', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.team() }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<OpsTeamMember>) =>
      opsMutate<{ member: OpsTeamMember }>(`/api/ops/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.team() }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      opsMutate(`/api/ops/team/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.team() }),
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function useCompanySettings() {
  return useQuery({
    queryKey: opsKeys.settings(),
    queryFn: () => opsFetch<{ settings: CompanySettings }>('/api/ops/settings').then((d) => d.settings),
  });
}

export function useSaveCompanySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) =>
      opsMutate<{ settings: CompanySettings }>('/api/ops/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.settings() }),
  });
}

export function usePipelineStages() {
  return useQuery({
    queryKey: opsKeys.pipelineStages(),
    queryFn: () =>
      opsFetch<{ stages: OpsPipelineStage[] }>('/api/ops/settings/pipeline').then((d) => d.stages),
  });
}

export function useCreatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; position?: number; color?: string }) =>
      opsMutate<{ stage: OpsPipelineStage }>('/api/ops/settings/pipeline', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipelineStages() }),
  });
}

export function useUpdatePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<OpsPipelineStage>) =>
      opsMutate<{ stage: OpsPipelineStage }>(`/api/ops/settings/pipeline/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipelineStages() }),
  });
}

export function useDeletePipelineStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      opsMutate(`/api/ops/settings/pipeline/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipelineStages() }),
  });
}

export function useReorderPipelineStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stages: { id: string; position: number }[]) =>
      opsMutate('/api/ops/settings/pipeline/reorder', {
        method: 'PUT',
        body: JSON.stringify({ stages }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.pipelineStages() }),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: opsKeys.notifications(),
    queryFn: () =>
      opsFetch<{ preferences: NotificationPreference[] }>('/api/ops/settings/notifications').then(
        (d) => d.preferences
      ),
  });
}

export function useUpdateNotificationPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventType: string; emailEnabled?: boolean; smsEnabled?: boolean }) =>
      opsMutate<{ preference: NotificationPreference }>('/api/ops/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: opsKeys.notifications() }),
  });
}
