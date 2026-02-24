'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Mail,
  RefreshCw,
  Phone,
  User,
  Inbox,
  Star,
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
import { Badge } from '@/components/ui/badge';
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

export default function EmailPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useSearchParam('q');
  const [filter, setFilter] = useFilterParam('filter', ['all', 'unread', 'starred'] as const, 'all');

  // New conversation state
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [newConvoContactId, setNewConvoContactId] = useState('');
  const [newConvoBody, setNewConvoBody] = useState('');
  const [newConvoSubject, setNewConvoSubject] = useState('');
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

  const handleSearchChange = useCallback((v: string) => { setSearchQuery(v); }, [setSearchQuery]);
  const handleFilterChange = useCallback((v: 'all' | 'unread' | 'starred') => { setFilter(v); }, [setFilter]);

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

  async function handleCreateConversation() {
    if (!newConvoContactId || !newConvoBody.trim() || !newConvoSubject.trim()) return;
    const selectedContact = allContacts.find(c => c.id === newConvoContactId);
    try {
      await createConversation.mutateAsync({
        type: 'TYPE_EMAIL',
        contactId: newConvoContactId,
        subject: newConvoSubject,
        html: newConvoBody.trim().replace(/\n/g, '<br/>'),
        emailTo: selectedContact?.email,
      });
      showSuccess('Email sent', 'New email conversation started');
      setShowNewConvo(false);
      setNewConvoContactId('');
      setNewConvoBody('');
      setNewConvoSubject('');
      setContactSearch('');
      refetchConversations();
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to send email');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <OpsPageHeader title="Email Inbox" />

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
            New Email
          </Button>
        </div>
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
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
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

      {/* New Email Dialog */}
      <Dialog open={showNewConvo} onOpenChange={setShowNewConvo}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New Email</DialogTitle>
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
                          setContactSearch(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || '');
                        }}
                      >
                        <span className="font-medium">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}</span>
                        {c.email && <span className="text-xs text-muted-foreground ml-2">{c.email}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
              {newConvoContactId && <p className="text-xs text-green-600">Contact selected</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject..."
                value={newConvoSubject}
                onChange={e => setNewConvoSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px] resize-y"
                placeholder="Write your email..."
                value={newConvoBody}
                onChange={e => setNewConvoBody(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConvo(false)}>Cancel</Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newConvoContactId || !newConvoBody.trim() || !newConvoSubject.trim() || createConversation.isPending}
            >
              {createConversation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
