'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Minimize2 } from 'lucide-react';
import { useChat } from './ChatContext';
import styles from './ChatWidget.module.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if on admin page
  const isAdminPage = pathname?.startsWith('/admin');

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

  // Handle initial message from context
  useEffect(() => {
    if (isAdminPage) return;
    if (isOpen && initialMessage && messages.length === 1) {
      handleSendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only trigger on chat open/initial message, not on every messages change
  }, [isOpen, initialMessage, isAdminPage]);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleSendMessage = async (content: string) => {
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

    // Simulate support response (replace with actual chat integration)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Question about my quote': "I'd be happy to help with your quote! You can view your full quote details in your dashboard. Is there something specific you'd like me to clarify?",
        'Scheduling help': "Need to reschedule or have questions about your appointment? I can help! What would you like to do?",
        'Payment questions': "I can help with payment questions! You can view your payment history and make payments from the Payments section. What specifically would you like to know?",
        'Talk to a human': "Absolutely! A team member will join this chat shortly. Our average response time is under 2 minutes during business hours (Mon-Fri 8am-6pm).",
      };

      const supportMessage: Message = {
        id: `support-${Date.now()}`,
        content: responses[content] || "Thanks for reaching out! A team member will respond shortly. In the meantime, is there anything else I can help you with?",
        sender: 'support',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

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
