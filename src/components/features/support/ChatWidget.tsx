'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Minimize2 } from 'lucide-react';
import { useChat } from './ChatContext';
import { useOrderDetails, useOrders } from '@/hooks';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './ChatWidget.module.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface ChatAPIMessage {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    content: "Hi there! 👋 I'm here to help with any questions about your roofing project. What can I help you with?",
    sender: 'support',
    timestamp: new Date(),
  },
];

const QUICK_REPLIES = [
  'Question about my quote',
  'Scheduling help',
  'Payment questions',
  'Talk to a human',
];

export function ChatWidget() {
  const { isOpen, closeChat, initialMessage } = useChat();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatAPIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if on admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // Get user email for fetching order context
  // In dev bypass mode, use mock user. Otherwise, orders hook will handle auth.
  const userEmail = DEV_BYPASS_ENABLED ? MOCK_USER.primaryEmailAddress.emailAddress : null;

  // Fetch user's orders for context (only in dev mode for now - production would use Clerk session)
  const { data: ordersData } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails } = useOrderDetails(currentOrderId);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAdminPage) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAdminPage]);

  // Focus input when chat opens
  useEffect(() => {
    if (isAdminPage) return;
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isAdminPage]);

  // Define handleSendMessage before the useEffect that uses it
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Add to conversation history for API
    const newHistory: ChatAPIMessage[] = [
      ...conversationHistory,
      { role: 'user' as const, content: content.trim() },
    ];
    setConversationHistory(newHistory);

    try {
      // Build page context with order data if available
      const pageContext: {
        path: string;
        orderData?: {
          status: string;
          totalPrice: number;
          amountPaid: number;
          balanceDue: number;
          scheduledDate: string | null;
          propertyAddress: string;
        };
      } = {
        path: pathname || '/',
      };

      if (orderDetails?.order) {
        const order = orderDetails.order;
        pageContext.orderData = {
          status: order.status,
          totalPrice: order.totalPrice,
          amountPaid: order.totalPaid,
          balanceDue: order.balance,
          scheduledDate: order.scheduledStartDate || null,
          propertyAddress: `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState}`,
        };
      }

      // Call the AI support API
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          pageContext,
        }),
      });

      const data = await response.json();

      // Add assistant response to history
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant' as const, content: data.message },
      ]);

      const supportMessage: Message = {
        id: `support-${Date.now()}`,
        content: data.message,
        sender: 'support',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, supportMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `support-${Date.now()}`,
        content: "I'm having trouble connecting. Would you like me to have a team member reach out to you?",
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [conversationHistory, pathname, orderDetails]);

  // Handle initial message from context (must be after handleSendMessage declaration)
  useEffect(() => {
    if (isAdminPage) return;
    if (isOpen && initialMessage && messages.length === 1) {
      handleSendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only trigger on chat open/initial message
  }, [isOpen, initialMessage, isAdminPage]);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`${styles.chatPanel} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="Support chat"
        aria-hidden={!isOpen}
        // @ts-expect-error - inert is valid HTML attribute, TS types lag behind
        inert={!isOpen ? '' : undefined}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <span>RR</span>
              <span className={styles.statusDot} aria-label="Online" />
            </div>
            <div className={styles.headerText}>
              <h2 className={styles.title}>Results Roofing</h2>
              <p className={styles.subtitle}>Usually replies in minutes</p>
            </div>
          </div>
          <button 
            className={styles.closeButton}
            onClick={closeChat}
            aria-label="Close chat"
          >
            <Minimize2 size={18} />
          </button>
        </header>

        {/* Messages */}
        <div className={styles.messages} role="log" aria-live="polite">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`${styles.message} ${styles[message.sender]}`}
            >
              {message.sender === 'support' && (
                <div className={styles.messageAvatar}>RR</div>
              )}
              <div className={styles.messageBubble}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.message} ${styles.support}`}>
              <div className={styles.messageAvatar}>RR</div>
              <div className={styles.typingIndicator}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className={styles.quickReplies}>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                className={styles.quickReply}
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <button 
            type="submit"
            className={styles.sendButton}
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
