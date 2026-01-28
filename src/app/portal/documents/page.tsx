'use client';

import { useState } from 'react';
import { Filter, Search, FileText } from 'lucide-react';
import { DocumentCard } from '@/components/features/documents';
import type { DocumentData } from '@/components/features/documents';
import { HelpNoteSupport } from '@/components/features/support';
import styles from './page.module.css';

// Mock data - would come from database in production
const DOCUMENTS: (DocumentData & { category: string; fileSize: string; description: string })[] = [
  {
    id: 'doc-1',
    type: 'contract',
    title: 'Roofing Contract',
    status: 'signed',
    date: 'January 22, 2026',
    category: 'Contracts',
    fileSize: '245 KB',
    description: 'Full roofing replacement agreement for Premium Package',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
    },
  },
  {
    id: 'doc-2',
    type: 'warranty',
    title: '30-Year Warranty Certificate',
    status: 'active',
    date: 'January 22, 2026',
    category: 'Warranty',
    fileSize: '128 KB',
    description: 'GAF Golden Pledge warranty coverage details',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
    },
  },
  {
    id: 'doc-3',
    type: 'receipt',
    title: 'Deposit Receipt',
    status: 'paid',
    date: 'January 22, 2026',
    category: 'Payments',
    fileSize: '56 KB',
    description: 'Receipt for $750 deposit payment',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
    },
  },
  {
    id: 'doc-4',
    type: 'permit',
    title: 'Building Permit',
    status: 'approved',
    date: 'January 23, 2026',
    category: 'Permits',
    fileSize: '312 KB',
    description: 'City of Austin building permit application',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
      permitNumber: 'BP-2026-00847',
    },
  },
  {
    id: 'doc-5',
    type: 'materials',
    title: 'Material Specifications',
    status: 'active',
    date: 'January 23, 2026',
    category: 'Materials',
    fileSize: '1.2 MB',
    description: 'GAF Timberline HDZ shingle specifications and colors',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
    },
  },
  {
    id: 'doc-6',
    type: 'scope',
    title: 'Project Scope of Work',
    status: 'signed',
    date: 'January 22, 2026',
    category: 'Contracts',
    fileSize: '189 KB',
    description: 'Detailed breakdown of all work to be performed',
    projectData: {
      address: '123 Main Street, Austin, TX 78701',
      customerName: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      packageName: 'Premium Package',
      totalPrice: 15000,
      depositAmount: 750,
      installationDate: 'February 3, 2026',
      contractDate: 'January 22, 2026',
      materials: 'GAF Timberline HDZ Architectural Shingles',
      warrantyYears: 30,
    },
  },
];

const CATEGORIES = ['All Documents', 'Contracts', 'Warranty', 'Payments', 'Permits', 'Materials'];

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState('All Documents');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = DOCUMENTS.filter((doc) => {
    const matchesCategory = activeCategory === 'All Documents' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.documentsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Documents</h1>
          <p className={styles.subtitle}>
            Click any document to view, sign, print, or download
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {CATEGORIES.map((category) => {
          const count = category === 'All Documents' 
            ? DOCUMENTS.length 
            : DOCUMENTS.filter(d => d.category === category).length;
          
          return (
            <button
              key={category}
              className={`${styles.categoryTab} ${activeCategory === category ? styles.categoryTabActive : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
              {count > 0 && (
                <span className={styles.categoryCount}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className={styles.documentsList}>
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            subtitle={doc.category}
            fileSize={doc.fileSize}
          />
        ))}
        
        {filteredDocuments.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <FileText size={28} />
            </div>
            <p>No documents found matching your search.</p>
          </div>
        )}
      </div>

      {/* Help Note */}
      <HelpNoteSupport 
        title="Need a document you don't see?"
        message="We'll help you locate it."
        chatPrompt="I need help finding a document"
      />
    </div>
  );
}
