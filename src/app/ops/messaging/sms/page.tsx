'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
import { staggerContainer, fadeInUp } from '@/lib/animation-variants';
import styles from '../../ops.module.css';
import messagingStyles from '@/components/features/ops/messaging/messaging.module.css';

interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function SMSPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        type: 'TYPE_SMS',
        ...(filter !== 'all' && { status: filter }),
        ...(searchQuery && { q: searchQuery }),
      });
      const response = await fetch(`/api/ops/conversations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoadingList(false);
    }
  }, [filter, searchQuery]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/ops/conversations/${conversationId}?messages=true`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Mark as read
      fetch(`/api/ops/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
    }
  }, [selectedConversation, fetchMessages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStar = async (conversationId: string, starred: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, starred } : c))
    );
    await fetch(`/api/ops/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    });
  };

  const handleMarkRead = async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    await fetch(`/api/ops/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
    await fetch(`/api/ops/conversations/${conversationId}`, { method: 'DELETE' });
  };

  const handleSendMessage = async (data: { body: string }) => {
    if (!selectedConversation) return;

    // Optimistic update
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type: 'TYPE_SMS',
      direction: 'outbound',
      status: 'pending',
      body: data.body,
      dateAdded: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

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
        // Update the temp message with the real one
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, ...message, status: 'sent' } : m))
        );
        // Update conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessageBody: data.body, lastMessageDate: new Date().toISOString(), lastMessageDirection: 'outbound' }
              : c
          )
        );
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'failed' } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const contact: Contact | undefined = selectedConversation?.contact;

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      {/* Header */}
      <motion.header variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}
          >
            <MessageSquare size={24} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>SMS Conversations</h1>
            <p className={styles.pageDescription}>
              Manage text message conversations
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchConversations}
          disabled={loadingList}
        >
          <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </motion.header>

      {/* Messaging Interface */}
      <motion.div variants={fadeInUp} className={messagingStyles.messagingLayout}>
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
                        <Phone size={14} />
                      </a>
                    </Button>
                  )}
                  {contact?.email && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${contact.email}`}>
                        <Mail size={14} />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/ops/crm/contacts/${contact?.id}`}>
                      <User size={14} />
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
              <MessageSquare size={48} style={{ color: 'var(--muted-foreground)' }} />
              <p>Select a conversation</p>
              <span>Choose from the list on the left to start messaging</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
