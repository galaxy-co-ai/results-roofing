'use client';

import { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Bug, Lightbulb, MessageCircle, ChevronRight, Check, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useFeedback, type FeedbackReason } from './FeedbackContext';
import styles from './FeedbackWidget.module.css';

interface ReasonOption {
  id: FeedbackReason;
  icon: typeof Bug;
  label: string;
  description: string;
}

interface SubOption {
  id: string;
  label: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {
    id: 'bug',
    icon: Bug,
    label: "Something's broken",
    description: 'Report an issue or error',
  },
  {
    id: 'suggestion',
    icon: Lightbulb,
    label: 'Feature idea',
    description: 'Share how we can improve',
  },
  {
    id: 'general',
    icon: MessageCircle,
    label: 'General feedback',
    description: 'Anything else on your mind',
  },
];

const SUB_OPTIONS: Record<FeedbackReason, SubOption[]> = {
  bug: [
    { id: 'page-not-loading', label: 'Page not loading correctly' },
    { id: 'button-not-working', label: 'Button or link not working' },
    { id: 'display-issue', label: 'Display or layout issue' },
    { id: 'slow-performance', label: 'Slow or unresponsive' },
    { id: 'other', label: 'Other' },
  ],
  suggestion: [
    { id: 'easier-navigation', label: 'Make navigation easier' },
    { id: 'more-info', label: 'Need more information' },
    { id: 'new-feature', label: 'Add a new feature' },
    { id: 'improve-design', label: 'Improve the design' },
    { id: 'other', label: 'Other' },
  ],
  general: [
    { id: 'love-it', label: 'I love this!' },
    { id: 'confusing', label: "Something's confusing" },
    { id: 'question', label: 'I have a question' },
    { id: 'other', label: 'Other' },
  ],
};

// Helper to check if an option is "Other"
const isOtherOption = (optionId: string | null): boolean => optionId === 'other';

export function FeedbackWidget() {
  const {
    isOpen,
    toggleFeedback,
    closeFeedback,
    step,
    setStep,
    feedbackData,
    setReason,
    setSubOption,
    setCustomReason,
    setNotes,
    submitFeedback,
    isSubmitting,
    isSubmitted,
  } = useFeedback();

  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customReasonRef = useRef<HTMLInputElement>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Check if on admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // Focus textarea when reaching notes step
  useEffect(() => {
    if (isAdminPage) return;
    if (step === 3 && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [step, isAdminPage]);

  // Handle keyboard events
  useEffect(() => {
    if (isAdminPage) return;
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFeedback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeFeedback, isAdminPage]);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleReasonSelect = (reason: FeedbackReason) => {
    setReason(reason);
    setStep(2);
  };

  const handleSubOptionSelect = (option: string) => {
    setSubOption(option);
    if (isOtherOption(option)) {
      setShowOtherInput(true);
      // Focus the input after render
      setTimeout(() => customReasonRef.current?.focus(), 100);
    } else {
      setShowOtherInput(false);
      setStep(3);
    }
  };

  const handleOtherContinue = () => {
    if (feedbackData.customReason.trim()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setShowOtherInput(false);
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    await submitFeedback();
  };

  const formatTimestamp = () => {
    return feedbackData.timestamp.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'What brings you here?';
      case 2:
        return feedbackData.reason === 'bug' 
          ? 'What happened?'
          : feedbackData.reason === 'suggestion'
          ? 'What area?'
          : 'Tell us more';
      case 3:
        return 'Any details to add?';
      default:
        return '';
    }
  };

  const selectedReason = feedbackData.reason 
    ? REASON_OPTIONS.find(r => r.id === feedbackData.reason) 
    : null;

  return (
    <>
      {/* Edge Tab Trigger */}
      <button
        className={`${styles.edgeTab} ${isOpen ? styles.hidden : ''}`}
        onClick={toggleFeedback}
        aria-label="Open feedback form"
        aria-expanded={isOpen}
        aria-controls="feedback-panel"
      >
        <span className={styles.tabLabel}>Feedback</span>
      </button>

      {/* Feedback Panel */}
      <div
        ref={panelRef}
        id="feedback-panel"
        className={`${styles.panel} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="Share feedback"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {step > 1 && !isSubmitted && (
              <button
                className={styles.backButton}
                onClick={handleBack}
                aria-label="Go back"
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className={styles.headerText}>
              <h2 className={styles.title}>
                {isSubmitted ? 'Thank you!' : getStepTitle()}
              </h2>
              <p className={styles.meta} suppressHydrationWarning>
                {isSubmitted ? 'Your feedback helps us improve' : formatTimestamp()}
              </p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={closeFeedback}
            aria-label="Close feedback form"
          >
            <X size={18} />
          </button>
        </header>

        {/* Progress indicator */}
        {!isSubmitted && (
          <div className={styles.progress}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${(step / 3) * 100}%` }}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Step ${step} of 3`}
            />
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {/* Success State */}
          {isSubmitted && (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <Check size={32} strokeWidth={3} />
              </div>
              <p className={styles.successText}>
                We&apos;ve received your feedback and will review it shortly.
              </p>
            </div>
          )}

          {/* Step 1: Choose Reason */}
          {!isSubmitted && step === 1 && (
            <div className={styles.optionsList} role="radiogroup" aria-label="Feedback type">
              {REASON_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={styles.optionCard}
                  onClick={() => handleReasonSelect(option.id)}
                  role="radio"
                  aria-checked={feedbackData.reason === option.id}
                >
                  <div className={styles.optionIcon}>
                    <option.icon size={20} />
                  </div>
                  <div className={styles.optionText}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionDescription}>{option.description}</span>
                  </div>
                  <ChevronRight size={16} className={styles.optionArrow} />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Sub-options */}
          {!isSubmitted && step === 2 && feedbackData.reason && (
            <div className={styles.step2Container}>
              {/* Selected reason badge */}
              {selectedReason && (
                <div className={styles.selectedBadge}>
                  <selectedReason.icon size={14} />
                  <span>{selectedReason.label}</span>
                </div>
              )}
              
              {/* Show sub-options or "Other" input */}
              {!showOtherInput ? (
                <div className={styles.subOptionsList} role="radiogroup" aria-label="Specific issue">
                  {SUB_OPTIONS[feedbackData.reason].map((option) => (
                    <button
                      key={option.id}
                      className={`${styles.subOptionButton} ${
                        feedbackData.subOption === option.id ? styles.selected : ''
                      } ${option.id === 'other' ? styles.otherOption : ''}`}
                      onClick={() => handleSubOptionSelect(option.id)}
                      role="radio"
                      aria-checked={feedbackData.subOption === option.id}
                    >
                      {option.id === 'other' && <MoreHorizontal size={14} className={styles.otherIcon} />}
                      {option.label}
                      <ChevronRight size={14} className={styles.subOptionArrow} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.otherInputContainer}>
                  <label className={styles.otherInputLabel} htmlFor="custom-reason">
                    Please describe:
                  </label>
                  <input
                    ref={customReasonRef}
                    id="custom-reason"
                    type="text"
                    className={styles.otherInput}
                    placeholder="What would you like to share?"
                    value={feedbackData.customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={100}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && feedbackData.customReason.trim()) {
                        handleOtherContinue();
                      }
                    }}
                    aria-label="Custom feedback reason"
                  />
                  <span className={styles.otherInputHint}>
                    {feedbackData.customReason.length}/100
                  </span>
                  <button
                    className={styles.otherContinueButton}
                    onClick={handleOtherContinue}
                    disabled={!feedbackData.customReason.trim()}
                    aria-label="Continue to next step"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Additional Notes */}
          {!isSubmitted && step === 3 && (
            <div className={styles.notesContainer}>
              {/* Summary badges */}
              <div className={styles.summaryBadges}>
                {selectedReason && (
                  <span className={styles.summaryBadge}>
                    <selectedReason.icon size={12} />
                    {selectedReason.label}
                  </span>
                )}
                {feedbackData.subOption && (
                  <span className={styles.summaryBadge}>
                    {isOtherOption(feedbackData.subOption) 
                      ? feedbackData.customReason || 'Other'
                      : SUB_OPTIONS[feedbackData.reason!]?.find(o => o.id === feedbackData.subOption)?.label
                    }
                  </span>
                )}
              </div>

              <div className={styles.textareaWrapper}>
                <textarea
                  ref={textareaRef}
                  className={styles.textarea}
                  placeholder="Add any additional details... (optional)"
                  value={feedbackData.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={500}
                  aria-label="Additional feedback details"
                />
                <span className={styles.charCount}>
                  {feedbackData.notes.length}/500
                </span>
              </div>

              <div className={styles.pageInfo}>
                <span className={styles.pageLabel}>Page:</span>
                <span className={styles.pagePath}>{feedbackData.currentPage || '/'}</span>
              </div>

              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner} />
                    Sending...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
