'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Star,
  StarOff,
  MessageSquare,
  Mail,
  Phone,
  MoreVertical,
  Archive,
  Trash2,
  CheckCheck,
  Circle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import styles from './messaging.module.css';

export type MessageType = 'TYPE_SMS' | 'TYPE_EMAIL' | 'TYPE_CALL';

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
  lastMessageDirection?: 'inbound' | 'outbound';
  unreadCount?: number;
  starred?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onStar?: (conversationId: string, starred: boolean) => void;
  onArchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  onMarkRead?: (conversationId: string) => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filter?: 'all' | 'unread' | 'starred';
  onFilterChange?: (filter: 'all' | 'unread' | 'starred') => void;
}

function getTypeIcon(type?: MessageType) {
  switch (type) {
    case 'TYPE_SMS':
      return MessageSquare;
    case 'TYPE_EMAIL':
      return Mail;
    case 'TYPE_CALL':
      return Phone;
    default:
      return MessageSquare;
  }
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

function truncateMessage(message?: string, maxLength = 50): string {
  if (!message) return 'No messages yet';
  if (message.length <= maxLength) return message;
  return `${message.substring(0, maxLength)}...`;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onStar,
  onArchive,
  onDelete,
  onMarkRead,
  loading = false,
  searchQuery = '',
  onSearchChange,
  filter = 'all',
  onFilterChange,
}: ConversationListProps) {
  return (
    <div className={styles.conversationList}>
      {/* Search & Filter Header */}
      <div className={styles.listHeader}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {onFilterChange && (
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => onFilterChange('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'unread' ? styles.active : ''}`}
              onClick={() => onFilterChange('unread')}
            >
              Unread
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'starred' ? styles.active : ''}`}
              onClick={() => onFilterChange('starred')}
            >
              Starred
            </button>
          </div>
        )}
      </div>

      {/* Conversation Items */}
      <div className={styles.listContent}>
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
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} />
            <p>No conversations found</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const TypeIcon = getTypeIcon(conversation.lastMessageType);
            const isSelected = conversation.id === selectedId;
            const hasUnread = (conversation.unreadCount ?? 0) > 0;
            const contactName = conversation.contact?.name || conversation.contact?.phone || 'Unknown';

            return (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${isSelected ? styles.selected : ''} ${hasUnread ? styles.unread : ''}`}
                onClick={() => onSelect(conversation)}
              >
                {/* Avatar */}
                <div className={styles.avatar}>
                  <span>{getInitials(contactName)}</span>
                </div>

                {/* Content */}
                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <span className={styles.contactName}>{contactName}</span>
                    <span className={styles.timestamp}>{formatTime(conversation.lastMessageDate)}</span>
                  </div>
                  <div className={styles.conversationPreview}>
                    <TypeIcon size={12} className={styles.typeIcon} />
                    {conversation.lastMessageDirection === 'outbound' && (
                      <CheckCheck size={12} className={styles.directionIcon} />
                    )}
                    <span className={styles.previewText}>
                      {truncateMessage(conversation.lastMessageBody)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.conversationActions}>
                  {hasUnread && (
                    <span className={styles.unreadBadge}>
                      {conversation.unreadCount}
                    </span>
                  )}
                  {conversation.starred && (
                    <Star size={14} className={styles.starredIcon} />
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
                      {onStar && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onStar(conversation.id, !conversation.starred);
                          }}
                        >
                          {conversation.starred ? (
                            <>
                              <StarOff size={14} /> Unstar
                            </>
                          ) : (
                            <>
                              <Star size={14} /> Star
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {hasUnread && onMarkRead && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(conversation.id);
                          }}
                        >
                          <Circle size={14} /> Mark as read
                        </DropdownMenuItem>
                      )}
                      {onArchive && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchive(conversation.id);
                          }}
                        >
                          <Archive size={14} /> Archive
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conversation.id);
                          }}
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

export default ConversationList;
