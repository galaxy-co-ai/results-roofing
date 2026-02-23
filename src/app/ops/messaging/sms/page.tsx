'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import {
  ConversationList,
  MessageThread,
  MessageComposer,
  type Conversation,
  type Message,
} from '@/components/features/ops/messaging';
import { Button } from '@/components/ui/button';
import { OpsPageHeader } from '@/components/ui/ops';
import messagingStyles from '@/components/features/ops/messaging/messaging.module.css';
import { useOpsConversations, useConversationMessages, useMarkConversationRead } from '@/hooks/ops/use-ops-queries';
import type { OpsContact } from '@/types/ops';

type Contact = OpsContact;

export default function SMSPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const { data: conversations = [], isLoading: loadingList, refetch: refetchConversations } =
    useOpsConversations('TYPE_SMS', filter, searchQuery);
  const { data: fetchedMessages = [], isLoading: loadingMessages } =
    useConversationMessages(selectedConversation?.id ?? null);
  const markRead = useMarkConversationRead();

  // Merge fetched messages with local optimistic messages
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
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setLocalMessages([]);
    }
    await fetch(`/api/ops/conversations/${conversationId}`, { method: 'DELETE' });
    refetchConversations();
  };

  const handleSendMessage = async (data: { body: string }) => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'pending',
      body: data.body,
      dateAdded: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...(prev.length ? prev : fetchedMessages), newMessage]);

    try {
      const response = await fetch('/api/ops/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TYPE_SMS',
          contactId: selectedConversation.contactId,
          message: data.body,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="SMS Conversations" />

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

      {/* Messaging Interface */}
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

        {/* Chat Area */}
        <div className={messagingStyles.chatPane}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
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
                      {contact?.phone || 'No phone number'}
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
                  {contact?.email && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="size-4" />
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
                type="sms"
                onSend={handleSendMessage}
                placeholder="Type your message..."
              />
            </>
          ) : (
            <div className={messagingStyles.noConversation}>
              <MessageSquare className="size-12 text-muted-foreground" />
              <p>Select a conversation</p>
              <span>Choose from the list on the left to start messaging</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
