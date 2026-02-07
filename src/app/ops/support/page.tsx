'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const fetchTickets = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { q: searchQuery }),
      });
      const response = await fetch(`/api/ops/support/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter, searchQuery]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/ops/support/tickets/${ticketId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket, fetchMessages]);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Mark as read
    if (ticket.unreadCount > 0) {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, unreadCount: 0 } : t))
      );
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
    // TODO: API call to update status
  };

  const handleArchive = async (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
      setMessages([]);
    }
    // TODO: API call to archive
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
      setMessages([]);
    }
    // TODO: API call to delete
  };

  const handleSendMessage = async (data: { body: string; channel: 'sms' | 'email' }) => {
    if (!selectedTicket) return;

    setSending(true);
    try {
      // Optimistic update
      const newMessage: TicketMessage = {
        id: `temp-${Date.now()}`,
        ticketId: selectedTicket.id,
        direction: 'outbound',
        channel: data.channel,
        body: data.body,
        author: { id: 'agent', name: 'Agent', type: 'agent' },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // Update ticket preview
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                preview: data.body.substring(0, 100),
                messageCount: t.messageCount + 1,
                updatedAt: new Date().toISOString(),
                lastMessageAt: new Date().toISOString(),
              }
            : t
        )
      );

      // TODO: API call to send message
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API
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
        <OpsPageHeader
          title="Support Inbox"
          description="Manage customer support tickets"
          icon={Inbox}
          accent="support"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
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
              <Inbox size={48} />
              <p>Select a ticket</p>
              <span>Choose a ticket from the list to view details</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
