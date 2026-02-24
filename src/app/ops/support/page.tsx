'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Inbox,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  SupportInbox,
  TicketDetail,
  type Ticket,
  type TicketStatus,
} from '@/components/features/ops/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OpsPageHeader } from '@/components/ui/ops';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import supportStyles from '@/components/features/ops/support/support.module.css';
import {
  useOpsTickets,
  useTicketMessages,
  useUpdateTicket,
  useDeleteTicket,
  useSendTicketMessage,
  useCreateTicket,
} from '@/hooks/ops/use-ops-queries';
import { useSearchParam, useFilterParam } from '@/hooks/ops/use-ops-filters';

export default function SupportPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useSearchParam('q');
  const [statusFilter, setStatusFilter] = useFilterParam(
    'status',
    ['all', 'open', 'pending', 'resolved', 'closed'] as const,
    'all',
  );

  // New ticket dialog state
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    channel: 'web' as 'sms' | 'email' | 'phone' | 'web',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    initialMessage: '',
  });

  const handleSearchChange = useCallback((v: string) => { setSearchQuery(v); }, [setSearchQuery]);
  const handleStatusFilterChange = useCallback((v: TicketStatus | 'all') => { setStatusFilter(v); }, [setStatusFilter]);

  const { data: tickets = [], isLoading: loadingList, refetch: refetchTickets } =
    useOpsTickets(statusFilter, searchQuery);
  const { data: messages = [], isLoading: loadingMessages } =
    useTicketMessages(selectedTicket?.id ?? null);

  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const sendMessage = useSendTicketMessage();
  const createTicket = useCreateTicket();

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
    updateTicket.mutate({ ticketId, status });
  };

  const handleArchive = (ticketId: string) => {
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    updateTicket.mutate({ ticketId, status: 'closed' });
  };

  const handleDelete = (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    deleteTicket.mutate(ticketId);
  };

  const handleSendMessage = async (data: { body: string; channel: 'sms' | 'email' }) => {
    if (!selectedTicket) return;
    await sendMessage.mutateAsync({
      ticketId: selectedTicket.id,
      body: data.body,
      channel: data.channel,
    });
  };

  const handleTicketStatusChange = (status: TicketStatus) => {
    if (selectedTicket) {
      handleStatusChange(selectedTicket.id, status);
    }
  };

  async function handleCreateTicket() {
    if (!ticketForm.subject.trim() || !ticketForm.initialMessage.trim() || !ticketForm.contactName.trim()) return;
    try {
      await createTicket.mutateAsync({
        subject: ticketForm.subject.trim(),
        message: ticketForm.initialMessage.trim(),
        priority: ticketForm.priority,
        channel: ticketForm.channel,
        contact: {
          name: ticketForm.contactName.trim(),
          email: ticketForm.contactEmail.trim() || undefined,
          phone: ticketForm.contactPhone.trim() || undefined,
        },
      });
      showSuccess('Ticket created', `"${ticketForm.subject}" has been created`);
      setShowNewTicket(false);
      setTicketForm({
        subject: '',
        priority: 'medium',
        channel: 'web',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        initialMessage: '',
      });
      refetchTickets();
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to create ticket');
    }
  }

  // Stats
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const resolvedTodayCount = tickets.filter((t) => {
    if (t.status !== 'resolved') return false;
    const today = new Date().toDateString();
    return new Date(t.updatedAt).toDateString() === today;
  }).length;

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      {/* Header */}
      <motion.header variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <OpsPageHeader title="Support Inbox" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchTickets()}
            disabled={loadingList}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewTicket(true)}
            className="bg-[var(--ops-accent-support)] hover:bg-[color-mix(in_srgb,var(--ops-accent-support)_90%,black)] transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <Plus size={14} />
            New Ticket
          </Button>
        </div>
      </motion.header>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--admin-bg-card)] border border-[var(--admin-border)]">
          <AlertCircle size={16} style={{ color: 'var(--ops-accent-support)' }} />
          <span className="text-sm font-medium tabular-nums">{openCount}</span>
          <span className="text-xs text-muted-foreground">Open</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--admin-bg-card)] border border-[var(--admin-border)]">
          <Clock size={16} style={{ color: 'var(--ops-accent-analytics)' }} />
          <span className="text-sm font-medium tabular-nums">{pendingCount}</span>
          <span className="text-xs text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--admin-bg-card)] border border-[var(--admin-border)]">
          <CheckCircle2 size={16} style={{ color: 'var(--ops-accent-pipeline)' }} />
          <span className="text-sm font-medium tabular-nums">{resolvedTodayCount}</span>
          <span className="text-xs text-muted-foreground">Resolved Today</span>
        </div>
      </motion.div>

      {/* Support Interface */}
      <motion.div variants={fadeInUp} className={supportStyles.supportLayout}>
        {/* Ticket List */}
        <div className={supportStyles.inboxPane}>
          <SupportInbox
            tickets={tickets}
            selectedId={selectedTicket?.id}
            onSelect={handleSelectTicket}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onDelete={handleDelete}
            loading={loadingList}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </div>

        {/* Ticket Detail */}
        <div className={supportStyles.detailPane}>
          {selectedTicket ? (
            <TicketDetail
              ticket={selectedTicket}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStatusChange={handleTicketStatusChange}
              loading={loadingMessages}
              sending={sendMessage.isPending}
            />
          ) : (
            <div className={supportStyles.noTicketSelected}>
              <Inbox size={32} />
              <p>Select a ticket</p>
              <span>Choose a ticket from the list to view details</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ticket-subject">Subject *</Label>
              <Input
                id="ticket-subject"
                placeholder="Brief description of the issue..."
                value={ticketForm.subject}
                onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(v) => setTicketForm(f => ({ ...f, priority: v as typeof f.priority }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select
                  value={ticketForm.channel}
                  onValueChange={(v) => setTicketForm(f => ({ ...f, channel: v as typeof f.channel }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-contact-name">Contact Name *</Label>
              <Input
                id="ticket-contact-name"
                placeholder="John Smith"
                value={ticketForm.contactName}
                onChange={e => setTicketForm(f => ({ ...f, contactName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ticket-contact-email">Contact Email</Label>
                <Input
                  id="ticket-contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={ticketForm.contactEmail}
                  onChange={e => setTicketForm(f => ({ ...f, contactEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ticket-contact-phone">Contact Phone</Label>
                <Input
                  id="ticket-contact-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={ticketForm.contactPhone}
                  onChange={e => setTicketForm(f => ({ ...f, contactPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-message">Initial Message *</Label>
              <textarea
                id="ticket-message"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-y"
                placeholder="Describe the issue..."
                value={ticketForm.initialMessage}
                onChange={e => setTicketForm(f => ({ ...f, initialMessage: e.target.value }))}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTicket(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!ticketForm.subject.trim() || !ticketForm.initialMessage.trim() || !ticketForm.contactName.trim() || createTicket.isPending}
              className="bg-[var(--ops-accent-support)] hover:bg-[color-mix(in_srgb,var(--ops-accent-support)_90%,black)]"
            >
              {createTicket.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
