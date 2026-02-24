'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Mail, MessageSquare, Send, Loader2, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useOpsConversations,
  useConversationMessages,
  useSendMessage,
  useMarkConversationRead,
  useOpsContacts,
  useCreateConversation,
} from '@/hooks/ops/use-ops-queries';
import type { Conversation } from '@/types/ops';

type ChannelFilter = 'all' | 'unread' | 'email' | 'sms';

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function InboxPage() {
  const { error: showError, success: showSuccess } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ChannelFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New conversation dialog state
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [newConvoType, setNewConvoType] = useState<'TYPE_SMS' | 'TYPE_EMAIL'>('TYPE_SMS');
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

  // Fetch both SMS and Email conversations
  const { data: smsConversations = [], isLoading: loadingSms, refetch: refetchSms } = useOpsConversations('TYPE_SMS');
  const { data: emailConversations = [], isLoading: loadingEmail, refetch: refetchEmail } = useOpsConversations('TYPE_EMAIL');

  const isLoading = loadingSms || loadingEmail;

  // Merge and sort all conversations
  const allConversations = useMemo(() => {
    const merged = [...smsConversations, ...emailConversations];
    merged.sort((a, b) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });
    return merged;
  }, [smsConversations, emailConversations]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return allConversations.filter(c => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const name = (c.contact?.name || '').toLowerCase();
        const body = (c.lastMessageBody || '').toLowerCase();
        if (!name.includes(q) && !body.includes(q)) return false;
      }
      // Channel filter
      if (filter === 'unread') return (c.unreadCount || 0) > 0;
      if (filter === 'email') return c.lastMessageType === 'TYPE_EMAIL';
      if (filter === 'sms') return c.lastMessageType === 'TYPE_SMS';
      return true;
    });
  }, [allConversations, search, filter]);

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useConversationMessages(selectedId);
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();

  const selected = allConversations.find(c => c.id === selectedId);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSelectConversation(conv: Conversation) {
    setSelectedId(conv.id);
    if ((conv.unreadCount || 0) > 0) {
      markRead.mutate(conv.id);
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: selectedId, body: newMessage.trim() });
      setNewMessage('');
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleRefresh() {
    refetchSms();
    refetchEmail();
  }

  async function handleCreateConversation() {
    if (!newConvoContactId || !newConvoBody.trim()) return;
    const selectedContact = allContacts.find(c => c.id === newConvoContactId);
    try {
      await createConversation.mutateAsync({
        type: newConvoType,
        contactId: newConvoContactId,
        message: newConvoType === 'TYPE_SMS' ? newConvoBody.trim() : undefined,
        subject: newConvoType === 'TYPE_EMAIL' ? newConvoSubject : undefined,
        html: newConvoType === 'TYPE_EMAIL' ? newConvoBody.trim().replace(/\n/g, '<br/>') : undefined,
        emailTo: newConvoType === 'TYPE_EMAIL' ? selectedContact?.email : undefined,
      });
      showSuccess('Message sent', 'New conversation started');
      setShowNewConvo(false);
      setNewConvoContactId('');
      setNewConvoBody('');
      setNewConvoSubject('');
      setContactSearch('');
      handleRefresh();
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to create conversation');
    }
  }

  const unreadCount = allConversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Inbox
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${unreadCount} unread · ${allConversations.length} conversations`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowNewConvo(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      <div className="flex border rounded-lg overflow-hidden bg-card" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Conversation List */}
        <div className="w-[320px] border-r flex flex-col shrink-0">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {(['all', 'unread', 'email', 'sms'] as const).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-6 text-[11px] px-2"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : f === 'email' ? 'Email' : 'SMS'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {allConversations.length === 0 ? 'No conversations yet' : 'No conversations match this filter'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isEmail = conv.lastMessageType === 'TYPE_EMAIL';
                const hasUnread = (conv.unreadCount || 0) > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3 border-b transition-colors ${
                      selectedId === conv.id
                        ? 'bg-blue-50/80 border-l-[3px] border-l-primary'
                        : 'hover:bg-muted/50 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {hasUnread && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>
                            {conv.contact?.name || 'Unknown'}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{timeAgo(conv.lastMessageDate)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessageBody || 'No messages'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {isEmail ? <Mail className="h-3 w-3 text-muted-foreground" /> : <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-[11px] text-muted-foreground">{isEmail ? 'Email' : 'SMS'}</span>
                          {hasUnread && (
                            <span className="text-[11px] font-medium text-primary tabular-nums ml-auto">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.contact?.name || 'Unknown'}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selected.contact?.email && <span>{selected.contact.email}</span>}
                      {selected.contact?.phone && <span>{selected.contact.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border rounded-lg p-0.5">
                    <div className={`h-7 px-2 flex items-center gap-1.5 text-xs rounded ${selected.lastMessageType === 'TYPE_EMAIL' ? 'bg-secondary text-secondary-foreground' : ''}`}>
                      <Mail className="h-3.5 w-3.5" /> Email
                    </div>
                    <div className={`h-7 px-2 flex items-center gap-1.5 text-xs rounded ${selected.lastMessageType === 'TYPE_SMS' ? 'bg-secondary text-secondary-foreground' : ''}`}>
                      <MessageSquare className="h-3.5 w-3.5" /> SMS
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className="h-16 w-[60%] rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    No messages in this conversation
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    const isEmail = msg.type === 'TYPE_EMAIL';
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                          isOutbound
                            ? 'bg-primary/10 text-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          {msg.meta?.email?.subject && (
                            <p className="text-xs font-semibold mb-1">{msg.meta.email.subject}</p>
                          )}
                          <p className="text-sm">{msg.body || '(no content)'}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[11px] text-muted-foreground tabular-nums">{formatMessageTime(msg.dateAdded)}</span>
                            {isEmail ? <Mail className="h-3 w-3 text-muted-foreground" /> : <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                            {msg.status && msg.status !== 'delivered' && msg.status !== 'read' && (
                              <span className="text-[11px] text-muted-foreground">{msg.status}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      className="min-h-[40px]"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvo} onOpenChange={setShowNewConvo}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {/* Channel Selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Channel</label>
              <div className="flex gap-2">
                <Button
                  variant={newConvoType === 'TYPE_SMS' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setNewConvoType('TYPE_SMS')}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> SMS
                </Button>
                <Button
                  variant={newConvoType === 'TYPE_EMAIL' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setNewConvoType('TYPE_EMAIL')}
                >
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                </Button>
              </div>
            </div>
            {/* Contact Picker */}
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
                          setContactSearch(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c.phone || '');
                        }}
                      >
                        <span className="font-medium">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}</span>
                        {c.email && <span className="text-xs text-muted-foreground ml-2">{c.email}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
              {newConvoContactId && (
                <p className="text-xs text-green-600">Contact selected</p>
              )}
            </div>
            {/* Subject (email only) */}
            {newConvoType === 'TYPE_EMAIL' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject..."
                  value={newConvoSubject}
                  onChange={e => setNewConvoSubject(e.target.value)}
                />
              </div>
            )}
            {/* Message */}
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
              disabled={!newConvoContactId || !newConvoBody.trim() || createConversation.isPending || (newConvoType === 'TYPE_EMAIL' && !newConvoSubject.trim())}
            >
              {createConversation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
