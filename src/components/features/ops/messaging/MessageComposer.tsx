'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Clock,
  X,
  File,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import styles from './messaging.module.css';

export type MessageType = 'sms' | 'email';

interface MessageComposerProps {
  type: MessageType;
  onSend: (message: {
    body: string;
    subject?: string;
    attachments?: File[];
  }) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showSchedule?: boolean;
  onSchedule?: (message: { body: string; subject?: string }, scheduledTime: Date) => Promise<void>;
}

interface Attachment {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

// Common SMS templates
const SMS_TEMPLATES = [
  { label: 'Appointment Reminder', text: "Hi {name}, this is a reminder about your appointment tomorrow at {time}. Reply YES to confirm or call us to reschedule." },
  { label: 'Quote Follow-up', text: "Hi {name}, following up on the quote we sent. Do you have any questions? Happy to discuss - just reply here or give us a call." },
  { label: 'Thank You', text: "Thank you for choosing Results Roofing! If you have any questions about your project, don't hesitate to reach out." },
  { label: 'Review Request', text: "Hi {name}, thank you for trusting us with your roofing project! If you have a moment, we'd love a review: {link}" },
];

export function MessageComposer({
  type,
  onSend,
  disabled = false,
  placeholder,
  maxLength = type === 'sms' ? 160 : undefined,
  showSchedule = false,
  onSchedule,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (type === 'email' && !subject.trim()) return;

    setSending(true);
    try {
      await onSend({
        body: message.trim(),
        subject: type === 'email' ? subject.trim() : undefined,
        attachments: attachments.map((a) => a.file),
      });
      setMessage('');
      setSubject('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  }, [message, subject, attachments, type, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      type: file.type.startsWith('image/') ? 'image' : 'document',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const attachment = prev[index];
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const insertTemplate = (text: string) => {
    setMessage(text);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const charCount = message.length;
  const isOverLimit = maxLength ? charCount > maxLength : false;
  const segmentCount = type === 'sms' ? Math.ceil(charCount / 160) : 0;

  return (
    <div className={styles.composer}>
      {/* Email Subject */}
      {type === 'email' && (
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={styles.subjectInput}
          disabled={disabled || sending}
        />
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className={styles.attachmentsPreview}>
          {attachments.map((attachment, index) => (
            <div key={index} className={styles.attachmentPreview}>
              {attachment.type === 'image' && attachment.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={attachment.preview} alt="" className={styles.attachmentImage} />
              ) : (
                <div className={styles.attachmentDoc}>
                  <File size={20} />
                </div>
              )}
              <span className={styles.attachmentName}>{attachment.file.name}</span>
              <button
                className={styles.removeAttachment}
                onClick={() => removeAttachment(index)}
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (type === 'sms' ? 'Type your message...' : 'Write your email...')}
          className={`${styles.messageInput} ${isOverLimit ? styles.overLimit : ''}`}
          disabled={disabled || sending}
          rows={type === 'email' ? 6 : 2}
        />

        {/* Character count for SMS */}
        {type === 'sms' && (
          <div className={`${styles.charCount} ${isOverLimit ? styles.overLimit : ''}`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
            {segmentCount > 1 && <span className={styles.segmentCount}>({segmentCount} segments)</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.composerActions}>
        <div className={styles.leftActions}>
          {/* Attachments */}
          <button
            className={styles.actionBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            title="Attach file"
            type="button"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={type === 'sms' ? 'image/*' : '*/*'}
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />

          {/* Templates (SMS only) */}
          {type === 'sms' && (
            <Popover open={showTemplates} onOpenChange={setShowTemplates}>
              <PopoverTrigger asChild>
                <button
                  className={styles.actionBtn}
                  disabled={disabled || sending}
                  title="Use template"
                  type="button"
                >
                  <Smile size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className={styles.templatesPopover}>
                <div className={styles.templatesList}>
                  <p className={styles.templatesTitle}>Quick Templates</p>
                  {SMS_TEMPLATES.map((template, index) => (
                    <button
                      key={index}
                      className={styles.templateItem}
                      onClick={() => insertTemplate(template.text)}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Schedule */}
          {showSchedule && onSchedule && (
            <button
              className={styles.actionBtn}
              disabled={disabled || sending}
              title="Schedule message"
              type="button"
            >
              <Clock size={16} />
            </button>
          )}
        </div>

        <button
          className={styles.sendBtn}
          onClick={handleSubmit}
          disabled={disabled || sending || (!message.trim() && attachments.length === 0) || (type === 'email' && !subject.trim())}
          type="button"
        >
          {sending ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <Send size={16} />
          )}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default MessageComposer;
