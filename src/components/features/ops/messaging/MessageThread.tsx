'use client';

import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import styles from './messaging.module.css';

export type MessageStatus = 'pending' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'TYPE_SMS' | 'TYPE_EMAIL' | 'TYPE_CALL';

export interface Message {
  id: string;
  conversationId: string;
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
      html?: string;
    };
  };
  dateAdded?: string;
}

export interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface MessageThreadProps {
  messages: Message[];
  contact?: Contact;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function getStatusIcon(status: MessageStatus) {
  switch (status) {
    case 'read':
    case 'delivered':
      return <CheckCheck size={12} className={styles.statusDelivered} />;
    case 'sent':
      return <Check size={12} className={styles.statusSent} />;
    case 'pending':
    case 'scheduled':
      return <Clock size={12} className={styles.statusPending} />;
    case 'failed':
    case 'undelivered':
      return <AlertCircle size={12} className={styles.statusFailed} />;
    default:
      return null;
  }
}

function formatMessageTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch {
    return '';
  }
}

function formatMessageDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  } catch {
    return '';
  }
}

function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const groups = new Map<string, Message[]>();

  messages.forEach((message) => {
    const dateKey = formatMessageDate(message.dateAdded);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  });

  return groups;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function MessageBubble({ message, contact }: { message: Message; contact?: Contact }) {
  const isOutbound = message.direction === 'outbound';
  const isEmail = message.type === 'TYPE_EMAIL';

  return (
    <div className={`${styles.messageBubbleWrapper} ${isOutbound ? styles.outbound : styles.inbound}`}>
      {!isOutbound && (
        <div className={styles.messageAvatar}>
          <span>{getInitials(contact?.name)}</span>
        </div>
      )}
      <div className={`${styles.messageBubble} ${isOutbound ? styles.outbound : styles.inbound}`}>
        {/* Email subject */}
        {isEmail && message.meta?.email?.subject && (
          <div className={styles.emailSubject}>
            <strong>Subject:</strong> {message.meta.email.subject}
          </div>
        )}

        {/* Message body */}
        {isEmail && message.meta?.email?.html ? (
          <div
            className={styles.emailBody}
            dangerouslySetInnerHTML={{ __html: message.meta.email.html }}
          />
        ) : (
          <p className={styles.messageBody}>{message.body || '(No content)'}</p>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={styles.attachments}>
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attachment}
              >
                <Paperclip size={12} />
                <span>{attachment.fileName || 'Attachment'}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        )}

        {/* Timestamp & Status */}
        <div className={styles.messageFooter}>
          <span className={styles.messageTime}>{formatMessageTime(message.dateAdded)}</span>
          {isOutbound && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}

export function MessageThread({
  messages,
  contact,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
}: MessageThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current && !loadingMore) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loadingMore]);

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className={styles.threadLoading}>
        <div className={styles.spinner} />
        <p>Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.threadEmpty}>
        <p>No messages yet</p>
        <span>Send a message to start the conversation</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.messageThread}>
      {/* Load More Button */}
      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {Array.from(messageGroups.entries()).map(([date, dateMessages]) => (
        <div key={date} className={styles.dateGroup}>
          <div className={styles.dateDivider}>
            <span>{date}</span>
          </div>
          {dateMessages.map((message) => (
            <MessageBubble key={message.id} message={message} contact={contact} />
          ))}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageThread;
