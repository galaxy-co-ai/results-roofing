'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Search, ChevronDown, HelpCircle, FileText, CreditCard, Calendar, Shield, Wrench, MessageCircle } from 'lucide-react';
import { useFAQ } from './FAQContext';
import { useChat } from '@/components/features/support';
import styles from './FAQModal.module.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'project', label: 'My Project', icon: Wrench },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'schedule', label: 'Scheduling', icon: Calendar },
  { id: 'warranty', label: 'Warranty', icon: Shield },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How long will my roof replacement take?',
    answer: 'Most residential roof replacements are completed in 1-2 days, depending on the size and complexity of your roof. Your project coordinator will provide a specific timeline once your installation is scheduled.',
    category: 'project',
  },
  {
    id: 'faq-2',
    question: 'Do I need to be home during installation?',
    answer: 'You do not need to be home during the installation. However, we recommend ensuring all gates are unlocked, vehicles are moved from the driveway, and any fragile items near the house are secured. We\'ll contact you when the job is complete.',
    category: 'project',
  },
  {
    id: 'faq-3',
    question: 'When is my final payment due?',
    answer: 'Your remaining balance is due upon project completion. After the final inspection and walkthrough, we\'ll send you an invoice via email with payment options. You can pay online through your portal, by credit card, or by check.',
    category: 'payment',
  },
  {
    id: 'faq-4',
    question: 'Do you offer financing options?',
    answer: 'Yes! We partner with Wisetack to offer flexible financing with rates as low as 0% APR for qualified customers. You can apply during checkout or contact us to discuss financing options for your remaining balance.',
    category: 'payment',
  },
  {
    id: 'faq-5',
    question: 'What happens if it rains on my installation day?',
    answer: 'We monitor weather closely and will reschedule if conditions are unsafe. If rain is expected, we may start earlier or adjust the schedule. If work has begun, our crew will secure your roof with waterproof underlayment to protect your home.',
    category: 'schedule',
  },
  {
    id: 'faq-6',
    question: 'Can I reschedule my installation date?',
    answer: 'Yes, you can request a schedule change up to 3 business days before your installation date at no charge. Contact us through the chat or call our project coordination team to discuss available dates.',
    category: 'schedule',
  },
  {
    id: 'faq-7',
    question: 'What does my warranty cover?',
    answer: 'Your warranty includes coverage for material defects, workmanship issues, and leak repairs. The GAF manufacturer warranty covers shingles and accessories, while our workmanship warranty covers installation quality. Full details are available in your warranty certificate.',
    category: 'warranty',
  },
  {
    id: 'faq-8',
    question: 'Is my warranty transferable if I sell my home?',
    answer: 'Yes, your warranty can be transferred to the new homeowner. Contact us within 30 days of the property sale to complete the transfer. There\'s no additional fee for warranty transfers.',
    category: 'warranty',
  },
  {
    id: 'faq-9',
    question: 'How do I access my project documents?',
    answer: 'All your documents are available in the Documents section of your portal. You can view, download, and print your contract, warranty certificate, receipts, permits, and more at any time.',
    category: 'documents',
  },
  {
    id: 'faq-10',
    question: 'Will you obtain the necessary permits?',
    answer: 'Yes, we handle all permit applications as part of our service. Your building permit will be uploaded to your documents once approved. We also schedule and coordinate all required inspections.',
    category: 'documents',
  },
];

export function FAQModal() {
  const { isOpen, closeFAQ } = useFAQ();
  const { openChat } = useChat();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Check if on admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // Handle escape key
  useEffect(() => {
    if (isAdminPage) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeFAQ();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeFAQ, isAdminPage]);

  // Focus search on open
  useEffect(() => {
    if (isAdminPage) return;
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, isAdminPage]);

  // Lock body scroll
  useEffect(() => {
    if (isAdminPage) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isAdminPage]);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeFAQ();
    }
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContactSupport = () => {
    closeFAQ();
    openChat('I have a question that isn\'t in the FAQ');
  };

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      ref={modalRef}
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Frequently Asked Questions"
    >
      <div className={styles.modal}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>How can we help?</h2>
            <p className={styles.subtitle}>Search our FAQ or browse by topic</p>
          </div>
          <button className={styles.closeButton} onClick={closeFAQ} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search FAQ"
          />
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryButton} ${activeCategory === cat.id ? styles.categoryActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon size={16} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className={styles.faqList}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={expandedItems.includes(item.id)}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${expandedItems.includes(item.id) ? styles.chevronOpen : ''}`}
                  />
                </button>
                <div
                  className={`${styles.faqAnswer} ${expandedItems.includes(item.id) ? styles.faqAnswerOpen : ''}`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No matching questions found.</p>
              <button className={styles.contactButton} onClick={handleContactSupport}>
                <MessageCircle size={16} />
                <span>Ask our support team</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Still have questions?</p>
          <button className={styles.contactButton} onClick={handleContactSupport}>
            <MessageCircle size={16} />
            <span>Chat with Support</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
