'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Inbox,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  SupportInbox,
  TicketDetail,
  type Ticket,
  type TicketStatus,
  type TicketMessage,
} from '@/components/features/ops/support';
import { Button } from '@/components/ui/button';
import { OpsPageHeader } from '@/components/ui/ops';
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import supportStyles from '@/components/features/ops/support/support.module.css';
import { useOpsTickets, useTicketMessages } from '@/hooks/ops/use-ops-queries';

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const { data: tickets = [], isLoading: loadingList, refetch: refetchTickets } =
    useOpsTickets(statusFilter, searchQuery);
  const { data: messages = [], isLoading: loadingMessages } =
    useTicketMessages(selectedTicket?.id ?? null);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
    // TODO: API call to update status
    refetchTickets();
  };

  const handleArchive = async (ticketId: string) => {
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    // TODO: API call to archive
    refetchTickets();
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    // TODO: API call to delete
    refetchTickets();
  };

  const handleSendMessage = async (data: { body: string; channel: 'sms' | 'email' }) => {
    if (!selectedTicket) return;

    setSending(true);
    try {
      // TODO: API call to send message
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API
      refetchTickets();
    } finally {
      setSending(false);
    }
  };

  const handleTicketStatusChange = (status: TicketStatus) => {
    if (selectedTicket) {
      handleStatusChange(selectedTicket.id, status);
    }
  };

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
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
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
              sending={sending}
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
    </motion.div>
  );
}
