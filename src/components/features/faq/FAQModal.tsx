'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Search, ChevronDown, FileText, CreditCard, Calendar, Shield, Wrench, MessageCircle } from 'lucide-react';
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
  { id: 'project', label: 'My Project', icon: Wrench },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'schedule', label: 'Scheduling', icon: Calendar },
  { id: 'warranty', label: 'Warranty', icon: Shield },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const FAQ_ITEMS: FAQItem[] = [
  // Project - 5 questions
  {
    id: 'project-1',
    question: 'How long will my roof replacement take?',
    answer: 'Most residential roof replacements are completed in 1-2 days, depending on the size and complexity of your roof. Your project coordinator will provide a specific timeline once your installation is scheduled.',
    category: 'project',
  },
  {
    id: 'project-2',
    question: 'Do I need to be home during installation?',
    answer: 'You do not need to be home during the installation. However, we recommend ensuring all gates are unlocked, vehicles are moved from the driveway, and any fragile items near the house are secured. We\'ll contact you when the job is complete.',
    category: 'project',
  },
  {
    id: 'project-3',
    question: 'What materials will be used on my roof?',
    answer: 'We use GAF Timberline HDZ architectural shingles, the #1 selling shingle in North America. Your package includes premium underlayment, starter strips, ridge caps, and all necessary flashing. Exact specifications are in your contract.',
    category: 'project',
  },
  {
    id: 'project-4',
    question: 'How do you protect my property during installation?',
    answer: 'Our crews use tarps to protect landscaping, magnets to collect nails, and plywood to shield windows and siding. We perform a thorough cleanup after completion, including a final magnet sweep of your entire property.',
    category: 'project',
  },
  {
    id: 'project-5',
    question: 'Will my old roof be removed or covered over?',
    answer: 'We always perform a complete tear-off down to the deck. This allows us to inspect the wood decking for damage, ensure proper ventilation, and provide a clean surface for optimal shingle adhesion and longevity.',
    category: 'project',
  },
  // Payment - 5 questions
  {
    id: 'payment-1',
    question: 'When is my final payment due?',
    answer: 'Your remaining balance is due upon project completion. After the final inspection and walkthrough, we\'ll send you an invoice via email with payment options. You can pay online through your portal, by credit card, or by check.',
    category: 'payment',
  },
  {
    id: 'payment-2',
    question: 'Do you offer financing options?',
    answer: 'Yes! We partner with Wisetack to offer flexible financing with rates as low as 0% APR for qualified customers. You can apply during checkout or contact us to discuss financing options for your remaining balance.',
    category: 'payment',
  },
  {
    id: 'payment-3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), ACH bank transfers, checks, and financing through Wisetack. All payments can be made securely through your customer portal.',
    category: 'payment',
  },
  {
    id: 'payment-4',
    question: 'Is my deposit refundable?',
    answer: 'Your deposit is fully refundable if you cancel before materials are ordered (typically within 48 hours of booking). Once materials are ordered, a portion may be retained to cover material costs. See your contract for full details.',
    category: 'payment',
  },
  {
    id: 'payment-5',
    question: 'Will I receive a receipt for my payments?',
    answer: 'Yes, receipts are automatically generated for every payment and available in your Documents section. You\'ll also receive email confirmations immediately after each transaction.',
    category: 'payment',
  },
  // Schedule - 5 questions
  {
    id: 'schedule-1',
    question: 'What happens if it rains on my installation day?',
    answer: 'We monitor weather closely and will reschedule if conditions are unsafe. If rain is expected, we may start earlier or adjust the schedule. If work has begun, our crew will secure your roof with waterproof underlayment to protect your home.',
    category: 'schedule',
  },
  {
    id: 'schedule-2',
    question: 'Can I reschedule my installation date?',
    answer: 'Yes, you can request a schedule change up to 3 business days before your installation date at no charge. Contact us through the chat or call our project coordination team to discuss available dates.',
    category: 'schedule',
  },
  {
    id: 'schedule-3',
    question: 'What time will the crew arrive?',
    answer: 'Our crews typically arrive between 7:00-8:00 AM to maximize daylight working hours. You\'ll receive a confirmation text the evening before with the expected arrival time.',
    category: 'schedule',
  },
  {
    id: 'schedule-4',
    question: 'How far in advance should I book my installation?',
    answer: 'We recommend booking 2-3 weeks in advance during peak season (spring and fall). During slower periods, we can often accommodate installations within 1-2 weeks of your deposit.',
    category: 'schedule',
  },
  {
    id: 'schedule-5',
    question: 'When will my materials be delivered?',
    answer: 'Materials are typically delivered 1-2 days before your scheduled installation. Our team will coordinate placement to minimize disruption. You\'ll be notified when delivery is en route.',
    category: 'schedule',
  },
  // Warranty - 5 questions
  {
    id: 'warranty-1',
    question: 'What does my warranty cover?',
    answer: 'Your warranty includes coverage for material defects, workmanship issues, and leak repairs. The GAF manufacturer warranty covers shingles and accessories, while our workmanship warranty covers installation quality. Full details are available in your warranty certificate.',
    category: 'warranty',
  },
  {
    id: 'warranty-2',
    question: 'Is my warranty transferable if I sell my home?',
    answer: 'Yes, your warranty can be transferred to the new homeowner. Contact us within 30 days of the property sale to complete the transfer. There\'s no additional fee for warranty transfers.',
    category: 'warranty',
  },
  {
    id: 'warranty-3',
    question: 'How long does my warranty last?',
    answer: 'The GAF manufacturer warranty covers materials for up to 50 years (lifetime limited). Our workmanship warranty covers installation quality for 10 years. Premium packages include enhanced coverage options.',
    category: 'warranty',
  },
  {
    id: 'warranty-4',
    question: 'How do I file a warranty claim?',
    answer: 'Contact us through your portal or call our support line. We\'ll schedule an inspection within 48 hours for urgent issues. If the claim is covered, repairs are completed at no cost to you.',
    category: 'warranty',
  },
  {
    id: 'warranty-5',
    question: 'What can void my warranty?',
    answer: 'Common warranty exclusions include damage from improper modifications, lack of maintenance, Acts of God (separate insurance claim), and unauthorized repairs. Regular inspections help maintain coverage.',
    category: 'warranty',
  },
  // Documents - 5 questions
  {
    id: 'documents-1',
    question: 'How do I access my project documents?',
    answer: 'All your documents are available in the Documents section of your portal. You can view, download, and print your contract, warranty certificate, receipts, permits, and more at any time.',
    category: 'documents',
  },
  {
    id: 'documents-2',
    question: 'Will you obtain the necessary permits?',
    answer: 'Yes, we handle all permit applications as part of our service. Your building permit will be uploaded to your documents once approved. We also schedule and coordinate all required inspections.',
    category: 'documents',
  },
  {
    id: 'documents-3',
    question: 'When will I receive my warranty certificate?',
    answer: 'Your warranty certificate is uploaded to your portal within 5-7 business days after project completion. You\'ll receive an email notification when it\'s ready to view.',
    category: 'documents',
  },
  {
    id: 'documents-4',
    question: 'Can I get a copy of my contract?',
    answer: 'Your signed contract is always available in your Documents section. You can view it online, download a PDF, or request a printed copy mailed to your address.',
    category: 'documents',
  },
  {
    id: 'documents-5',
    question: 'Do I need the permit for my records?',
    answer: 'Yes, keep your permit for future home sales or insurance claims. It proves the work was done legally and to code. A copy is permanently stored in your portal for easy access.',
    category: 'documents',
  },
];

export function FAQModal() {
  const { isOpen, closeFAQ } = useFAQ();
  const { openChat } = useChat();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('project');
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
    const matchesCategory = item.category === activeCategory;
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
            <h2 className={styles.title}>How can we <span className={styles.titleAccent}>help</span>?</h2>
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
