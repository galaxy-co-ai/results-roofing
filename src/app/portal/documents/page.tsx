import type { Metadata } from 'next';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  FolderOpen,
  Shield,
  FileCheck,
  Receipt
} from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Access and download your roofing project documents including contracts, warranties, and permits.',
};

// Document type icons
const DOC_TYPE_ICONS: Record<string, typeof FileText> = {
  contract: FileCheck,
  warranty: Shield,
  invoice: Receipt,
  permit: FolderOpen,
  other: FileText,
};

// Mock data - would come from database in production
const DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Roofing Contract',
    type: 'contract',
    category: 'Contracts',
    status: 'signed',
    dateAdded: 'January 22, 2026',
    fileSize: '245 KB',
    description: 'Full roofing replacement agreement for Better Package',
  },
  {
    id: 'doc-2',
    name: '30-Year Warranty Certificate',
    type: 'warranty',
    category: 'Warranty',
    status: 'active',
    dateAdded: 'January 22, 2026',
    fileSize: '128 KB',
    description: 'GAF Golden Pledge warranty coverage details',
  },
  {
    id: 'doc-3',
    name: 'Deposit Receipt',
    type: 'invoice',
    category: 'Payments',
    status: 'paid',
    dateAdded: 'January 22, 2026',
    fileSize: '56 KB',
    description: 'Receipt for $750 deposit payment',
  },
  {
    id: 'doc-4',
    name: 'Building Permit',
    type: 'permit',
    category: 'Permits',
    status: 'pending',
    dateAdded: 'January 23, 2026',
    fileSize: '312 KB',
    description: 'City of Austin building permit application',
  },
  {
    id: 'doc-5',
    name: 'Material Specifications',
    type: 'other',
    category: 'Materials',
    status: 'active',
    dateAdded: 'January 23, 2026',
    fileSize: '1.2 MB',
    description: 'GAF Timberline HDZ shingle specifications and colors',
  },
  {
    id: 'doc-6',
    name: 'Project Scope of Work',
    type: 'contract',
    category: 'Contracts',
    status: 'signed',
    dateAdded: 'January 22, 2026',
    fileSize: '189 KB',
    description: 'Detailed breakdown of all work to be performed',
  },
];

const CATEGORIES = ['All Documents', 'Contracts', 'Warranty', 'Payments', 'Permits', 'Materials'];

function getStatusBadge(status: string) {
  switch (status) {
    case 'signed':
      return (
        <span className={`${styles.statusBadge} ${styles.statusSigned}`}>
          <CheckCircle size={12} /> Signed
        </span>
      );
    case 'active':
      return (
        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
          <CheckCircle size={12} /> Active
        </span>
      );
    case 'paid':
      return (
        <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
          <CheckCircle size={12} /> Paid
        </span>
      );
    case 'pending':
      return (
        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
          <Clock size={12} /> Pending
        </span>
      );
    default:
      return (
        <span className={`${styles.statusBadge} ${styles.statusDefault}`}>
          <AlertCircle size={12} /> {status}
        </span>
      );
  }
}

export default function DocumentsPage() {
  return (
    <div className={styles.documentsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Documents</h1>
          <p className={styles.subtitle}>
            Access, view, and download all project-related documents
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search documents..."
            className={styles.searchInput}
            aria-label="Search documents"
          />
        </div>
        <div className={styles.filterGroup}>
          <button className={styles.filterButton}>
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        {CATEGORIES.map((category, index) => (
          <button
            key={category}
            className={`${styles.categoryTab} ${index === 0 ? styles.categoryTabActive : ''}`}
          >
            {category}
            {category === 'All Documents' && (
              <span className={styles.categoryCount}>{DOCUMENTS.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className={styles.documentsList}>
        {DOCUMENTS.map((doc) => {
          const IconComponent = DOC_TYPE_ICONS[doc.type] || FileText;
          
          return (
            <article key={doc.id} className={styles.documentCard}>
              <div className={styles.docIcon}>
                <IconComponent size={24} />
              </div>
              
              <div className={styles.docContent}>
                <div className={styles.docHeader}>
                  <h3 className={styles.docName}>{doc.name}</h3>
                  {getStatusBadge(doc.status)}
                </div>
                <p className={styles.docDescription}>{doc.description}</p>
                <div className={styles.docMeta}>
                  <span className={styles.docCategory}>{doc.category}</span>
                  <span className={styles.docDot}>•</span>
                  <span className={styles.docDate}>{doc.dateAdded}</span>
                  <span className={styles.docDot}>•</span>
                  <span className={styles.docSize}>{doc.fileSize}</span>
                </div>
              </div>

              <div className={styles.docActions}>
                <button className={styles.actionButton} aria-label="View document">
                  <Eye size={18} />
                </button>
                <button className={styles.actionButton} aria-label="Download document">
                  <Download size={18} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Help Note */}
      <div className={styles.helpNote}>
        <AlertCircle size={18} className={styles.helpIcon} />
        <div className={styles.helpContent}>
          <p className={styles.helpTitle}>Need a document you don't see?</p>
          <p className={styles.helpText}>
            Contact our support team at{' '}
            <a href="mailto:support@resultsroofing.com">support@resultsroofing.com</a>{' '}
            and we'll help you locate it.
          </p>
        </div>
      </div>
    </div>
  );
}
