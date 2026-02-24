'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Phone,
  Mail,
  User,
  Plus,
  Send,
  Loader2,
} from 'lucide-react';
import {
  ConversationList,
  MessageThread,
  MessageComposer,
  type Conversation,
  type Message,
} from '@/components/features/ops/messaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OpsPageHeader } from '@/components/ui/ops';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import messagingStyles from '@/components/features/ops/messaging/messaging.module.css';
import { useOpsConversations, useConversationMessages, useMarkConversationRead, useOpsContacts, useCreateConversation } from '@/hooks/ops/use-ops-queries';
import { useSearchParam, useFilterParam } from '@/hooks/ops/use-ops-filters';
import { useToast } from '@/components/ui/Toast';
import type { OpsContact } from '@/types/ops';

type Contact = OpsContact;

export default function SMSPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useSearchParam('q');
  const [filter, setFilter] = useFilterParam('filter', ['all', 'unread', 'starred'] as const, 'all');

  // New conversation state
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [newConvoContactId, setNewConvoContactId] = useState('');
  const [newConvoBody, setNewConvoBody] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const { data: allContacts = [] } = useOpsContacts();
  const createConversation = useCreateConversation();

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return allContacts.slice(0, 10);
    const q = contactSearch.toLowerCase();
    return allContacts.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.lastName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    ).slice(0, 10);
  }, [allContacts, contactSearch]);

  // Wrap nuqs setters for components expecting sync callbacks
  const handleSearchChange = useCallback((v: string) => { setSearchQuery(v); }, [setSearchQuery]);
  const handleFilterChange = useCallback((v: 'all' | 'unread' | 'starred') => { setFilter(v); }, [setFilter]);

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

  async function handleCreateConversation() {
    if (!newConvoContactId || !newConvoBody.trim()) return;
    try {
      await createConversation.mutateAsync({
        type: 'TYPE_SMS',
        contactId: newConvoContactId,
        message: newConvoBody.trim(),
      });
      showSuccess('Message sent', 'New SMS conversation started');
      setShowNewConvo(false);
      setNewConvoContactId('');
      setNewConvoBody('');
      setContactSearch('');
      refetchConversations();
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="SMS Conversations" />

        <div className="flex items-center gap-2">
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
          <Button
            size="sm"
            onClick={() => setShowNewConvo(true)}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
          >
            <Plus className="mr-2 size-4" />
            New Conversation
          </Button>
        </div>
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
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
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

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvo} onOpenChange={setShowNewConvo}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New SMS Conversation</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">To</label>
              <Input
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={e => { setContactSearch(e.target.value); setNewConvoContactId(''); }}
              />
              {contactSearch && !newConvoContactId && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">No contacts found</p>
                  ) : (
                    filteredContacts.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b last:border-0"
                        onClick={() => {
                          setNewConvoContactId(c.id);
                          setContactSearch(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phone || '');
                        }}
                      >
                        <span className="font-medium">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}</span>
                        {c.phone && <span className="text-xs text-muted-foreground ml-2">{c.phone}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
              {newConvoContactId && <p className="text-xs text-green-600">Contact selected</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-y"
                placeholder="Type your message..."
                value={newConvoBody}
                onChange={e => setNewConvoBody(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConvo(false)}>Cancel</Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newConvoContactId || !newConvoBody.trim() || createConversation.isPending}
            >
              {createConversation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
