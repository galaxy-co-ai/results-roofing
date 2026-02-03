'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  Clock,
  Tag,
  Send,
  Paperclip,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Ticket, TicketStatus, TicketPriority } from './SupportInbox';
import styles from './support.module.css';

export interface TicketMessage {
  id: string;
  ticketId: string;
  direction: 'inbound' | 'outbound';
  channel: 'sms' | 'email' | 'phone' | 'note';
  body: string;
  html?: string;
  attachments?: Array<{
    id: string;
    url: string;
    fileName: string;
    mimeType?: string;
  }>;
  author?: {
    id: string;
    name: string;
    type: 'contact' | 'agent';
  };
  createdAt: string;
}

interface TicketDetailProps {
  ticket: Ticket;
  messages: TicketMessage[];
  onSendMessage: (message: { body: string; channel: 'sms' | 'email' }) => Promise<void>;
  onStatusChange?: (status: TicketStatus) => void;
  onPriorityChange?: (priority: TicketPriority) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  loading?: boolean;
  sending?: boolean;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatMessageTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch {
    return '';
  }
}

function formatMessageDate(dateStr: string): string {
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

function groupMessagesByDate(messages: TicketMessage[]): Map<string, TicketMessage[]> {
  const groups = new Map<string, TicketMessage[]>();

  messages.forEach((message) => {
    const dateKey = formatMessageDate(message.createdAt);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  });

  return groups;
}

function MessageBubble({ message, contactName }: { message: TicketMessage; contactName: string }) {
  const isOutbound = message.direction === 'outbound';
  const isNote = message.channel === 'note';

  if (isNote) {
    return (
      <div className={styles.noteWrapper}>
        <div className={styles.note}>
          <div className={styles.noteHeader}>
            <span className={styles.noteAuthor}>{message.author?.name || 'Agent'}</span>
            <span className={styles.noteTime}>{formatMessageTime(message.createdAt)}</span>
          </div>
          <p className={styles.noteBody}>{message.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.messageBubbleWrapper} ${isOutbound ? styles.outbound : styles.inbound}`}>
      {!isOutbound && (
        <div className={styles.messageAvatar}>
          <span>{getInitials(contactName)}</span>
        </div>
      )}
      <div className={`${styles.messageBubble} ${isOutbound ? styles.outbound : styles.inbound}`}>
        {message.html ? (
          <div
            className={styles.messageHtml}
            dangerouslySetInnerHTML={{ __html: message.html }}
          />
        ) : (
          <p className={styles.messageBody}>{message.body}</p>
        )}
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
                <span>{attachment.fileName}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        )}
        <div className={styles.messageFooter}>
          <span className={styles.messageTime}>{formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export function TicketDetail({
  ticket,
  messages,
  onSendMessage,
  onStatusChange,
  onPriorityChange,
  onAddTag: _onAddTag,
  onRemoveTag,
  loading = false,
  sending = false,
}: TicketDetailProps) {
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState<'sms' | 'email'>('sms');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    await onSendMessage({ body: replyText.trim(), channel: replyChannel });
    setReplyText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={styles.ticketDetail}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={styles.headerInfo}>
          <h2 className={styles.ticketSubject}>{ticket.subject}</h2>
          <div className={styles.ticketId}>#{ticket.id.slice(0, 8)}</div>
        </div>
        <div className={styles.headerActions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status: {ticket.status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusChange?.('open')}>
                <AlertCircle size={14} /> Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('pending')}>
                <Clock size={14} /> Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('resolved')}>
                <CheckCircle2 size={14} /> Resolved
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange?.('closed')}>
                Close Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onPriorityChange?.('urgent')}>
                Set Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange?.('high')}>
                Set High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange?.('medium')}>
                Set Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange?.('low')}>
                Set Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.detailContent}>
        {/* Contact Info Sidebar */}
        <aside className={styles.contactSidebar}>
          <div className={styles.contactCard}>
            <div className={styles.contactAvatar}>
              <span>{getInitials(ticket.contact.name)}</span>
            </div>
            <h3 className={styles.contactName}>{ticket.contact.name}</h3>
            <div className={styles.contactDetails}>
              {ticket.contact.email && (
                <a href={`mailto:${ticket.contact.email}`} className={styles.contactDetail}>
                  <Mail size={14} />
                  <span>{ticket.contact.email}</span>
                </a>
              )}
              {ticket.contact.phone && (
                <a href={`tel:${ticket.contact.phone}`} className={styles.contactDetail}>
                  <Phone size={14} />
                  <span>{ticket.contact.phone}</span>
                </a>
              )}
            </div>
            <Button variant="outline" size="sm" className={styles.viewProfileBtn} asChild>
              <a href={`/ops/crm/contacts/${ticket.contact.id}`}>
                <User size={14} />
                View Profile
              </a>
            </Button>
          </div>

          {/* Tags */}
          <div className={styles.tagsSection}>
            <h4 className={styles.sectionTitle}>
              <Tag size={14} /> Tags
            </h4>
            <div className={styles.tagsList}>
              {ticket.tags && ticket.tags.length > 0 ? (
                ticket.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    {onRemoveTag && (
                      <button
                        className={styles.removeTag}
                        onClick={() => onRemoveTag(tag)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className={styles.noTags}>No tags</span>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <div className={styles.ticketInfo}>
            <h4 className={styles.sectionTitle}>
              <Clock size={14} /> Timeline
            </h4>
            <div className={styles.timelineItem}>
              <span className={styles.timelineLabel}>Created</span>
              <span className={styles.timelineValue}>
                {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineLabel}>Last Updated</span>
              <span className={styles.timelineValue}>
                {format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}
              </span>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineLabel}>Messages</span>
              <span className={styles.timelineValue}>{ticket.messageCount}</span>
            </div>
          </div>
        </aside>

        {/* Messages */}
        <div className={styles.messagesPane}>
          {loading ? (
            <div className={styles.loadingMessages}>
              <Loader2 className={styles.spinner} />
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <MessageSquare size={32} />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {Array.from(messageGroups.entries()).map(([date, dateMessages]) => (
                <div key={date} className={styles.dateGroup}>
                  <div className={styles.dateDivider}>
                    <span>{date}</span>
                  </div>
                  {dateMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      contactName={ticket.contact.name}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Reply Composer */}
          <div className={styles.replyComposer}>
            <div className={styles.channelToggle}>
              <button
                className={`${styles.channelBtn} ${replyChannel === 'sms' ? styles.active : ''}`}
                onClick={() => setReplyChannel('sms')}
              >
                <MessageSquare size={14} /> SMS
              </button>
              <button
                className={`${styles.channelBtn} ${replyChannel === 'email' ? styles.active : ''}`}
                onClick={() => setReplyChannel('email')}
              >
                <Mail size={14} /> Email
              </button>
            </div>
            <div className={styles.replyInput}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Reply via ${replyChannel.toUpperCase()}...`}
                rows={3}
              />
            </div>
            <div className={styles.replyActions}>
              <button className={styles.attachBtn}>
                <Paperclip size={16} />
              </button>
              <Button
                onClick={handleSend}
                disabled={!replyText.trim() || sending}
              >
                {sending ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <Send size={16} />
                )}
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
