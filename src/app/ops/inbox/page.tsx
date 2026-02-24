'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Mail, MessageSquare, Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useOpsConversations,
  useConversationMessages,
  useSendMessage,
  useMarkConversationRead,
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
  const { error: showError } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ChannelFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
    </div>
  );
}
