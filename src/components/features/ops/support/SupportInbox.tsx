'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Archive,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import styles from './support.module.css';

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

interface SupportInboxProps {
  tickets: Ticket[];
  selectedId?: string;
  onSelect: (ticket: Ticket) => void;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onPriorityChange?: (ticketId: string, priority: TicketPriority) => void;
  onAssign?: (ticketId: string, userId: string) => void;
  onArchive?: (ticketId: string) => void;
  onDelete?: (ticketId: string) => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: TicketStatus | 'all';
  onStatusFilterChange?: (status: TicketStatus | 'all') => void;
}

function getChannelIcon(channel: TicketChannel) {
  switch (channel) {
    case 'sms':
      return MessageSquare;
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    default:
      return MessageSquare;
  }
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case 'open':
      return <AlertCircle size={12} className={styles.statusOpen} />;
    case 'pending':
      return <Clock size={12} className={styles.statusPending} />;
    case 'resolved':
      return <CheckCircle2 size={12} className={styles.statusResolved} />;
    case 'closed':
      return <CheckCircle2 size={12} className={styles.statusClosed} />;
    default:
      return null;
  }
}

function getPriorityClass(priority: TicketPriority) {
  switch (priority) {
    case 'urgent':
      return styles.priorityUrgent;
    case 'high':
      return styles.priorityHigh;
    case 'medium':
      return styles.priorityMedium;
    case 'low':
      return styles.priorityLow;
    default:
      return '';
  }
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function SupportInbox({
  tickets,
  selectedId,
  onSelect,
  onStatusChange,
  onPriorityChange: _onPriorityChange,
  onArchive,
  onDelete,
  loading = false,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
}: SupportInboxProps) {
  const [expandedFilters, setExpandedFilters] = useState(false);

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  return (
    <div className={styles.inbox}>
      {/* Header */}
      <div className={styles.inboxHeader}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          className={styles.filterToggle}
          onClick={() => setExpandedFilters(!expandedFilters)}
        >
          <Filter size={14} />
        </button>
      </div>

      {/* Status Tabs */}
      <div className={styles.statusTabs}>
        {(['all', 'open', 'pending', 'resolved'] as const).map((status) => (
          <button
            key={status}
            className={`${styles.statusTab} ${statusFilter === status ? styles.active : ''}`}
            onClick={() => onStatusFilterChange?.(status)}
          >
            <span className={styles.statusLabel}>
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className={styles.statusCount}>{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className={styles.ticketList}>
        {loading ? (
          <div className={styles.loadingState}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonItem}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonText}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineSm} />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} />
            <p>No tickets found</p>
            <span>All caught up!</span>
          </div>
        ) : (
          tickets.map((ticket) => {
            const ChannelIcon = getChannelIcon(ticket.channel);
            const isSelected = ticket.id === selectedId;
            const hasUnread = ticket.unreadCount > 0;

            return (
              <div
                key={ticket.id}
                className={`${styles.ticketItem} ${isSelected ? styles.selected : ''} ${hasUnread ? styles.unread : ''}`}
                onClick={() => onSelect(ticket)}
              >
                {/* Priority Indicator */}
                <div className={`${styles.priorityIndicator} ${getPriorityClass(ticket.priority)}`} />

                {/* Avatar */}
                <div className={styles.avatar}>
                  <span>{getInitials(ticket.contact.name)}</span>
                </div>

                {/* Content */}
                <div className={styles.ticketContent}>
                  <div className={styles.ticketHeader}>
                    <span className={styles.contactName}>{ticket.contact.name}</span>
                    <span className={styles.timestamp}>{formatTime(ticket.lastMessageAt || ticket.updatedAt)}</span>
                  </div>
                  <div className={styles.ticketSubject}>{ticket.subject}</div>
                  <div className={styles.ticketPreview}>
                    <ChannelIcon size={12} className={styles.channelIcon} />
                    <span>{ticket.preview}</span>
                  </div>
                  <div className={styles.ticketMeta}>
                    {getStatusIcon(ticket.status)}
                    <span className={styles.statusText}>{ticket.status}</span>
                    {ticket.tags && ticket.tags.length > 0 && (
                      <>
                        <span className={styles.separator}>•</span>
                        <Tag size={10} />
                        <span>{ticket.tags[0]}</span>
                        {ticket.tags.length > 1 && <span>+{ticket.tags.length - 1}</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.ticketActions}>
                  {hasUnread && (
                    <span className={styles.unreadBadge}>{ticket.unreadCount}</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onStatusChange && (
                        <>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'open')}>
                            <AlertCircle size={14} /> Mark Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'pending')}>
                            <Clock size={14} /> Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'resolved')}>
                            <CheckCircle2 size={14} /> Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {onArchive && (
                        <DropdownMenuItem onClick={() => onArchive(ticket.id)}>
                          <Archive size={14} /> Archive
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(ticket.id)}
                          className="text-red-500"
                        >
                          <Trash2 size={14} /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SupportInbox;
