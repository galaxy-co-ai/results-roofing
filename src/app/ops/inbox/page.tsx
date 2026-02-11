'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Mail, MessageSquare, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/Toast';

interface Conversation {
  id: string;
  name: string;
  preview: string;
  channel: 'email' | 'sms';
  time: string;
  job: string;
  unread: boolean;
}

interface Message {
  id: string;
  from: 'them' | 'us';
  content: string;
  time: string;
  channel: 'email' | 'sms';
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'John Davis', preview: 'Re: Your roof estimate — sounds good, let me know when to sign', channel: 'email', time: '2m ago', job: 'Job #1042', unread: true },
  { id: '2', name: 'Sarah Miller', preview: 'Thanks for the quick response! When can the crew...', channel: 'sms', time: '15m ago', job: 'Job #1038', unread: true },
  { id: '3', name: 'Mike Torres', preview: 'When can the crew start? We want to get this done before...', channel: 'sms', time: '1h ago', job: 'Job #1035', unread: false },
  { id: '4', name: 'Maria Lopez', preview: 'I have a question about the warranty coverage for the...', channel: 'email', time: '3h ago', job: 'Job #1030', unread: false },
  { id: '5', name: 'Robert Chen', preview: 'Can we schedule the inspection for next week?', channel: 'email', time: '5h ago', job: 'Job #1025', unread: false },
  { id: '6', name: 'Amanda White', preview: 'I got a quote from another company, can you match?', channel: 'sms', time: '1d ago', job: 'Job #1040', unread: false },
  { id: '7', name: 'James Wilson', preview: 'Payment sent via check, should arrive this week', channel: 'email', time: '2d ago', job: 'Job #1020', unread: false },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', from: 'them', content: 'Hi, I got the estimate for the roof replacement. Can we discuss the Better package? I\'m interested but want to understand the warranty difference.', time: '10:23 AM', channel: 'email' },
    { id: 'm2', from: 'us', content: 'Absolutely! The Better package includes a 25-year manufacturer warranty vs 15-year on Standard. It also includes upgraded underlayment and ice & water shield along all eaves. Happy to walk through the details on a call.', time: '10:45 AM', channel: 'email' },
    { id: 'm3', from: 'them', content: 'Sounds good, let\'s go with it. When do I sign?', time: '11:02 AM', channel: 'email' },
    { id: 'm4', from: 'us', content: 'Great choice! I\'ll send over the updated proposal with the Better package right now. You\'ll be able to e-sign directly from the email.', time: '11:15 AM', channel: 'email' },
    { id: 'm5', from: 'them', content: 'Re: Your roof estimate — sounds good, let me know when to sign', time: '11:30 AM', channel: 'email' },
  ],
  '2': [
    { id: 'm1', from: 'them', content: 'Hey, just wanted to say thanks for coming out so quickly yesterday. The estimate looks fair.', time: '9:00 AM', channel: 'sms' },
    { id: 'm2', from: 'us', content: 'Thank you Sarah! We try to be prompt. Let me know if you have any questions about the packages.', time: '9:15 AM', channel: 'sms' },
    { id: 'm3', from: 'them', content: 'Actually yes — what\'s the timeline looking like if we go with the Better package?', time: '9:30 AM', channel: 'sms' },
    { id: 'm4', from: 'us', content: 'We could have a crew out within 2-3 weeks of signing. Installation typically takes 2 days for your roof size.', time: '9:45 AM', channel: 'sms' },
    { id: 'm5', from: 'them', content: 'Thanks for the quick response! When can the crew start? We want to get it done before the rainy season.', time: '10:00 AM', channel: 'sms' },
  ],
  '3': [
    { id: 'm1', from: 'us', content: 'Hi Mike! Following up on your roof inspection from last week. We found some areas that need attention. Want to go over the findings?', time: '2:00 PM', channel: 'sms' },
    { id: 'm2', from: 'them', content: 'Yes please. Is it urgent? We noticed a small leak in the attic.', time: '2:30 PM', channel: 'sms' },
    { id: 'm3', from: 'us', content: 'It\'s not an emergency but I\'d recommend addressing it soon. The leak is likely from the damaged flashing we identified. I can get a repair estimate to you today.', time: '2:45 PM', channel: 'sms' },
    { id: 'm4', from: 'them', content: 'When can the crew start? We want to get this done before it gets worse.', time: '3:00 PM', channel: 'sms' },
  ],
  '4': [
    { id: 'm1', from: 'them', content: 'Hello, I signed the contract last week but I have a question about the warranty. Does it cover hail damage?', time: '8:00 AM', channel: 'email' },
    { id: 'm2', from: 'us', content: 'Great question Maria! Yes, the manufacturer warranty covers hail damage to the shingles. We also provide a 5-year workmanship warranty that covers any installation-related issues.', time: '8:30 AM', channel: 'email' },
    { id: 'm3', from: 'them', content: 'I have a question about the warranty coverage for the underlayment too. Is that covered separately?', time: '9:00 AM', channel: 'email' },
  ],
  '5': [
    { id: 'm1', from: 'them', content: 'Hi, I\'d like to schedule a roof inspection. We\'re thinking of replacing our roof next spring.', time: '10:00 AM', channel: 'email' },
    { id: 'm2', from: 'us', content: 'Hi Robert! Smart to plan ahead. I\'d be happy to schedule an inspection. Do you have any preferred dates next week?', time: '10:30 AM', channel: 'email' },
    { id: 'm3', from: 'them', content: 'Can we schedule the inspection for next week? Tuesday or Wednesday would work best for us.', time: '11:00 AM', channel: 'email' },
  ],
  '6': [
    { id: 'm1', from: 'them', content: 'Hi, I got a quote from ABC Roofing for $2,000 less. Can you match their price?', time: '3:00 PM', channel: 'sms' },
    { id: 'm2', from: 'us', content: 'Hi Amanda, thanks for letting us know. Could you share their quote so I can compare apples to apples? Often the difference comes down to material quality and warranty coverage.', time: '3:30 PM', channel: 'sms' },
    { id: 'm3', from: 'them', content: 'I got a quote from another company, can you match? I\'ll send you the details.', time: '4:00 PM', channel: 'sms' },
  ],
  '7': [
    { id: 'm1', from: 'us', content: 'Hi James, just following up on the final invoice. Let me know if you have any questions.', time: '9:00 AM', channel: 'email' },
    { id: 'm2', from: 'them', content: 'Thanks for the reminder. I\'ll send a check today.', time: '10:00 AM', channel: 'email' },
    { id: 'm3', from: 'them', content: 'Payment sent via check, should arrive this week. Thanks for the great work on the roof!', time: '11:00 AM', channel: 'email' },
  ],
};

type ChannelFilter = 'all' | 'unread' | 'email' | 'sms';

export default function InboxPage() {
  const { info, success } = useToast();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<ChannelFilter>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find(c => c.id === selectedId);
  const currentMessages = messages[selectedId] || [];

  const filteredConversations = conversations.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'unread') return c.unread;
    return c.channel === filter;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    // Mark as read
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  }

  function handleSend() {
    if (!newMessage.trim() || !selected) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const msg: Message = {
      id: `m${Date.now()}`,
      from: 'us',
      content: newMessage.trim(),
      time: timeStr,
      channel: selected.channel,
    };
    setMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), msg],
    }));
    // Update preview
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, preview: newMessage.trim(), time: 'Just now' } : c
    ));
    setNewMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
          Inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {conversations.filter(c => c.unread).length} unread conversations
        </p>
      </div>

      <div className="flex border rounded-lg overflow-hidden bg-card" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Conversation List */}
        <div className="w-[320px] border-r flex flex-col shrink-0">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 h-8 text-sm" />
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
                  {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f === 'email' ? 'Email' : 'SMS'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left p-3 border-b transition-colors ${
                  selectedId === conv.id
                    ? 'bg-blue-50/80 border-l-[3px] border-l-primary'
                    : 'hover:bg-muted/50 border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${conv.unread ? 'font-semibold' : 'font-medium'}`}>
                        {conv.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.preview}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {conv.channel === 'email' ? <Mail className="h-3 w-3 text-muted-foreground" /> : <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[11px] text-muted-foreground">{conv.job}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations match this filter
              </div>
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
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.job}</p>
                  </div>
                  <div className="flex items-center gap-1 border rounded-lg p-0.5">
                    <Button variant={selected.channel === 'email' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs gap-1.5" onClick={() => info('Coming soon', 'Channel switching is under development')}>
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Button>
                    <Button variant={selected.channel === 'sms' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs gap-1.5" onClick={() => info('Coming soon', 'Channel switching is under development')}>
                      <MessageSquare className="h-3.5 w-3.5" /> SMS
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === 'us' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                      msg.from === 'us'
                        ? 'bg-primary/10 text-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                        {msg.channel === 'email' ? <Mail className="h-3 w-3 text-muted-foreground" /> : <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                ))}
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
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => info('Coming soon', 'File attachments are under development')}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="h-9 gap-1.5" onClick={handleSend} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
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
