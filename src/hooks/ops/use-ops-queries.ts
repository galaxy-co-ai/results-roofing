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
  tickets: (filters?: { status?: string; search?: string }) =>
    [...opsKeys.all, 'tickets', filters] as const,
  ticketMessages: (ticketId: string) => [...opsKeys.all, 'ticket-messages', ticketId] as const,
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
