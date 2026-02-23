'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  Phone,
  User,
  Inbox,
  Star,
} from 'lucide-react';
import {
  ConversationList,
  MessageThread,
  MessageComposer,
  type Conversation,
  type Message,
} from '@/components/features/ops/messaging';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OpsPageHeader } from '@/components/ui/ops';
import messagingStyles from '@/components/features/ops/messaging/messaging.module.css';
import { useOpsConversations, useConversationMessages, useMarkConversationRead } from '@/hooks/ops/use-ops-queries';
import type { OpsContact } from '@/types/ops';

type Contact = OpsContact;

export default function EmailPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const { data: conversations = [], isLoading: loadingList, refetch: refetchConversations } =
    useOpsConversations('TYPE_EMAIL', filter, searchQuery);
  const { data: fetchedMessages = [], isLoading: loadingMessages } =
    useConversationMessages(selectedConversation?.id ?? null);
  const markRead = useMarkConversationRead();

  const messages = localMessages.length > 0 ? localMessages : fetchedMessages;

  useEffect(() => {
    setLocalMessages([]);
  }, [fetchedMessages]);

  useEffect(() => {
    if (selectedConversation) {
      markRead.mutate(selectedConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStar = async (conversationId: string, starred: boolean) => {
    await fetch(`/api/ops/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    });
    refetchConversations();
  };

  const handleMarkRead = async (conversationId: string) => {
    markRead.mutate(conversationId);
    refetchConversations();
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this email thread?')) return;

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setLocalMessages([]);
    }
    await fetch(`/api/ops/conversations/${conversationId}`, { method: 'DELETE' });
    refetchConversations();
  };

  const handleSendEmail = async (data: { body: string; subject?: string }) => {
    if (!selectedConversation || !data.subject) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type: 'TYPE_EMAIL',
      direction: 'outbound',
      status: 'pending',
      body: '',
      meta: {
        email: {
          subject: data.subject,
          html: data.body.replace(/\n/g, '<br/>'),
        },
      },
      dateAdded: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...(prev.length ? prev : fetchedMessages), newMessage]);

    try {
      const response = await fetch('/api/ops/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TYPE_EMAIL',
          contactId: selectedConversation.contactId,
          subject: data.subject,
          html: data.body.replace(/\n/g, '<br/>'),
          emailTo: selectedConversation.contact?.email,
        }),
      });

      if (response.ok) {
        const { message } = await response.json();
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, ...message, status: 'sent' } : m))
        );
        refetchConversations();
      } else {
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'failed' } : m))
        );
      }
    } catch {
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const contact: Contact | undefined = selectedConversation?.contact;

  const totalEmails = conversations.length;
  const unreadCount = conversations.filter((c) => (c.unreadCount ?? 0) > 0).length;
  const starredCount = conversations.filter((c) => c.starred).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="Email Inbox" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchConversations()}
          disabled={loadingList}
          className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
        >
          <RefreshCw className={`mr-2 size-4 ${loadingList ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
          <Inbox className="size-4" style={{ color: 'var(--ops-accent-documents)' }} />
          <span className="font-medium tabular-nums">{totalEmails}</span>
          <span className="text-muted-foreground">Total</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
          <Mail className="size-4" style={{ color: 'var(--ops-accent-messaging)' }} />
          <span className="font-medium tabular-nums">{unreadCount}</span>
          <span className="text-muted-foreground">Unread</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
          <Star className="size-4" style={{ color: 'var(--ops-accent-analytics)' }} />
          <span className="font-medium tabular-nums">{starredCount}</span>
          <span className="text-muted-foreground">Starred</span>
        </Badge>
      </div>

      {/* Email Interface */}
      <div className={messagingStyles.messagingLayout}>
        {/* Conversation List */}
        <div className={messagingStyles.conversationListPane}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id}
            onSelect={handleSelectConversation}
            onStar={handleStar}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            loading={loadingList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Email Thread */}
        <div className={messagingStyles.chatPane}>
          {selectedConversation ? (
            <>
              {/* Email Header */}
              <div className={messagingStyles.chatHeader}>
                <div className={messagingStyles.chatHeaderInfo}>
                  <div className={messagingStyles.avatar}>
                    <span>
                      {contact?.name
                        ? contact.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                        : '?'}
                    </span>
                  </div>
                  <div>
                    <div className={messagingStyles.chatHeaderName}>
                      {contact?.name || 'Unknown Contact'}
                    </div>
                    <div className={messagingStyles.chatHeaderSubtitle}>
                      {contact?.email || 'No email address'}
                    </div>
                  </div>
                </div>
                <div className={messagingStyles.chatHeaderActions}>
                  {contact?.phone && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${contact.phone}`}>
                        <Phone className="size-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/ops/crm/contacts/${contact?.id}`}>
                      <User className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <MessageThread
                messages={messages}
                contact={contact}
                loading={loadingMessages}
              />

              {/* Composer */}
              <MessageComposer
                type="email"
                onSend={handleSendEmail}
                placeholder="Write your email..."
              />
            </>
          ) : (
            <div className={messagingStyles.noConversation}>
              <Mail className="size-12 text-muted-foreground" />
              <p>Select an email thread</p>
              <span>Choose from the list on the left to view emails</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
