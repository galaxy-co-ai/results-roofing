'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Filter, Search, FileText, AlertCircle } from 'lucide-react';
import { DocumentCard } from '@/components/features/documents';
import type { DocumentData } from '@/components/features/documents';
import { HelpNoteSupport } from '@/components/features/support';
import { useOrders, useOrderDetails } from '@/hooks';
import { Skeleton } from '@/components/ui';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './page.module.css';

const CATEGORIES = ['All Documents', 'Contracts', 'Warranty', 'Payments', 'Permits', 'Materials'];

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTierDisplayName(tier: string): string {
  const tierMap: Record<string, string> = {
    good: 'Essential Package',
    better: 'Preferred Package',
    best: 'Signature Package',
  };
  return tierMap[tier] || tier;
}

function DocumentsSkeleton() {
  return (
    <div className={styles.documentsPage}>
      <header className={styles.header}>
        <Skeleton variant="text" width="50%" height={32} />
        <Skeleton variant="text" width="70%" height={20} />
      </header>
      <div className={styles.toolbar}>
        <Skeleton variant="rounded" width="60%" height={40} />
        <Skeleton variant="rounded" width="100px" height={40} />
      </div>
      <div className={styles.categoryTabs}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={100} height={32} />
        ))}
      </div>
      <div className={styles.documentsList}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={80} />
        ))}
      </div>
    </div>
  );
}

function DocumentsError() {
  return (
    <div className={styles.documentsPage}>
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} />
        <h2>Unable to load documents</h2>
        <p>Please try refreshing the page.</p>
      </div>
    </div>
  );
}

function DocumentsPendingState() {
  return (
    <div className={styles.documentsPage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your <span className={styles.titleAccent}>Documents</span></h1>
          <p className={styles.subtitle}>
            Your documents will appear here after your deposit is confirmed
          </p>
        </div>
      </header>
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <FileText size={28} />
        </div>
        <p>Once your deposit is processed, your contract, warranty, and project documents will be available here.</p>
      </div>
    </div>
  );
}

function ClerkDocuments() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  return <DocumentsContent userEmail={userEmail} userLoaded={isLoaded} />;
}

function DevDocuments() {
  const userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  return <DocumentsContent userEmail={userEmail} userLoaded={true} />;
}

interface ExtendedDocument extends DocumentData {
  category: string;
  fileSize: string;
  description: string;
}

function DocumentsContent({ userEmail, userLoaded }: { userEmail: string | null; userLoaded: boolean }) {
  const [activeCategory, setActiveCategory] = useState('All Documents');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(userEmail);
  const currentOrderId = ordersData?.orders?.[0]?.id ?? null;
  const { data: orderDetails, isLoading: detailsLoading, error: detailsError } = useOrderDetails(currentOrderId);

  if (!userLoaded || ordersLoading || (currentOrderId && detailsLoading)) {
    return <DocumentsSkeleton />;
  }

  if (ordersError || detailsError) {
    return <DocumentsError />;
  }

  if (!currentOrderId || !orderDetails) {
    return <DocumentsPendingState />;
  }

  const { order, contracts, payments } = orderDetails;

  // Build project data for documents
  const projectData = {
    address: `${order.propertyAddress}, ${order.propertyCity}, ${order.propertyState} ${order.propertyZip}`,
    customerName: order.customerName || 'Customer',
    email: order.customerEmail,
    phone: order.customerPhone || '',
    packageName: getTierDisplayName(order.selectedTier),
    totalPrice: order.totalPrice,
    depositAmount: order.totalPaid,
    installationDate: order.scheduledStartDate ? formatDate(order.scheduledStartDate) : 'To be scheduled',
    contractDate: formatDate(order.createdAt),
    materials: 'GAF Timberline HDZ Architectural Shingles',
    warrantyYears: 30,
    permitNumber: `BP-${new Date(order.createdAt).getFullYear()}-${order.confirmationNumber.slice(-5)}`,
  };

  // Generate documents based on order state
  const documents: ExtendedDocument[] = [];

  // Contract document (if contract exists)
  if (contracts.length > 0) {
    const contract = contracts[0];
    documents.push({
      id: `doc-contract-${contract.id}`,
      type: 'contract',
      title: 'Roofing Contract',
      status: contract.signedAt ? 'signed' : 'pending',
      date: formatDate(contract.signedAt || contract.id),
      category: 'Contracts',
      fileSize: '245 KB',
      description: `Full roofing replacement agreement for ${getTierDisplayName(order.selectedTier)}`,
      projectData,
    });
  }

  // Warranty document (if contract is signed)
  if (contracts.some(c => c.signedAt)) {
    documents.push({
      id: 'doc-warranty',
      type: 'warranty',
      title: '30-Year Warranty Certificate',
      status: 'active',
      date: formatDate(order.createdAt),
      category: 'Warranty',
      fileSize: '128 KB',
      description: 'GAF Golden Pledge warranty coverage details',
      projectData,
    });
  }

  // Receipt documents (for each payment)
  payments.forEach((payment, index) => {
    if (payment.status === 'succeeded') {
      documents.push({
        id: `doc-receipt-${payment.id}`,
        type: 'receipt',
        title: payment.type === 'deposit' ? 'Deposit Receipt' : `Payment Receipt #${index + 1}`,
        status: 'paid',
        date: formatDate(payment.processedAt),
        category: 'Payments',
        fileSize: '56 KB',
        description: `Receipt for $${payment.amount.toLocaleString()} ${payment.type} payment`,
        projectData,
      });
    }
  });

  // Permit document (always available as pending or approved)
  documents.push({
    id: 'doc-permit',
    type: 'permit',
    title: 'Building Permit',
    status: order.scheduledStartDate ? 'approved' : 'pending',
    date: formatDate(order.createdAt),
    category: 'Permits',
    fileSize: '312 KB',
    description: 'City building permit application',
    projectData,
  });

  // Materials document
  documents.push({
    id: 'doc-materials',
    type: 'materials',
    title: 'Material Specifications',
    status: 'active',
    date: formatDate(order.createdAt),
    category: 'Materials',
    fileSize: '1.2 MB',
    description: 'GAF Timberline HDZ shingle specifications and colors',
    projectData,
  });

  // Scope document (if contract exists)
  if (contracts.length > 0) {
    documents.push({
      id: 'doc-scope',
      type: 'scope',
      title: 'Project Scope of Work',
      status: contracts.some(c => c.signedAt) ? 'signed' : 'pending',
      date: formatDate(order.createdAt),
      category: 'Contracts',
      fileSize: '189 KB',
      description: 'Detailed breakdown of all work to be performed',
      projectData,
    });
  }

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'All Documents' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count documents per category
  const getCategoryCount = (category: string) => {
    if (category === 'All Documents') return documents.length;
    return documents.filter(d => d.category === category).length;
  };

  return (
    <div className={styles.documentsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your <span className={styles.titleAccent}>Documents</span></h1>
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
          const count = getCategoryCount(category);

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

export default function DocumentsPage() {
  if (DEV_BYPASS_ENABLED) {
    return <DevDocuments />;
  }
  return <ClerkDocuments />;
}
