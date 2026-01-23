'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Table2,
  Users,
  FileText,
  Package,
  CreditCard,
  Calendar,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import styles from './page.module.css';

interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  recordCount: number;
  category: 'core' | 'config' | 'events' | 'dev';
}

const TABLE_METADATA: Record<string, Omit<TableInfo, 'recordCount'>> = {
  leads: {
    name: 'leads',
    displayName: 'Leads',
    description: 'Customer contact information and addresses',
    icon: Users,
    category: 'core',
  },
  quotes: {
    name: 'quotes',
    displayName: 'Quotes',
    description: 'Roofing quotes with pricing and status',
    icon: FileText,
    category: 'core',
  },
  orders: {
    name: 'orders',
    displayName: 'Orders',
    description: 'Confirmed jobs after contract signing',
    icon: Package,
    category: 'core',
  },
  contracts: {
    name: 'contracts',
    displayName: 'Contracts',
    description: 'E-signature contracts and status',
    icon: FileText,
    category: 'core',
  },
  payments: {
    name: 'payments',
    displayName: 'Payments',
    description: 'Payment records from Stripe',
    icon: CreditCard,
    category: 'core',
  },
  appointments: {
    name: 'appointments',
    displayName: 'Appointments',
    description: 'Scheduled installations and inspections',
    icon: Calendar,
    category: 'core',
  },
  measurements: {
    name: 'measurements',
    displayName: 'Measurements',
    description: 'Roof measurement data from Roofr or manual entry',
    icon: Table2,
    category: 'core',
  },
  pricing_tiers: {
    name: 'pricing_tiers',
    displayName: 'Pricing Tiers',
    description: 'Good/Better/Best package configuration — changes affect live pricing!',
    icon: CreditCard,
    category: 'config',
  },
  sms_consents: {
    name: 'sms_consents',
    displayName: 'SMS Consents',
    description: 'Customer SMS marketing consent records',
    icon: MessageSquare,
    category: 'events',
  },
  webhook_events: {
    name: 'webhook_events',
    displayName: 'Webhook Events',
    description: 'Incoming webhook payloads from integrations',
    icon: Database,
    category: 'events',
  },
  feedback: {
    name: 'feedback',
    displayName: 'Feedback',
    description: 'User feedback submissions',
    icon: MessageSquare,
    category: 'dev',
  },
  dev_tasks: {
    name: 'dev_tasks',
    displayName: 'Dev Tasks',
    description: 'Development task tracking',
    icon: FileText,
    category: 'dev',
  },
  dev_notes: {
    name: 'dev_notes',
    displayName: 'Dev Notes',
    description: 'Development notes and documentation',
    icon: FileText,
    category: 'dev',
  },
};

const CATEGORY_LABELS = {
  core: 'Core Business Tables',
  config: 'Configuration Tables',
  events: 'Event Logs',
  dev: 'Development Tables',
};

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTableCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tables');
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();

      const enrichedTables: TableInfo[] = Object.entries(data.tables).map(
        ([name, count]) => ({
          ...TABLE_METADATA[name],
          name,
          recordCount: count as number,
        })
      ).filter(t => t.displayName); // Only show tables we have metadata for

      setTables(enrichedTables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableCounts();
  }, []);

  const groupedTables = tables.reduce((acc, table) => {
    const category = table.category || 'core';
    if (!acc[category]) acc[category] = [];
    acc[category].push(table);
    return acc;
  }, {} as Record<string, TableInfo[]>);

  const totalRecords = tables.reduce((sum, t) => sum + t.recordCount, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Database size={28} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Database Management</h1>
            <p className={styles.subtitle}>
              View and manage application data. Changes here directly affect the live site.
            </p>
          </div>
        </div>
        <button
          onClick={fetchTableCounts}
          className={styles.refreshButton}
          disabled={loading}
          aria-label="Refresh table counts"
        >
          <RefreshCw size={18} className={loading ? styles.spinning : ''} />
          Refresh
        </button>
      </header>

      {/* Stats Overview */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Tables</span>
          <span className={styles.statValue}>{tables.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Records</span>
          <span className={styles.statValue}>{totalRecords.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Database</span>
          <span className={styles.statValue}>PostgreSQL (Neon)</span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinning} />
          <span>Loading tables...</span>
        </div>
      ) : (
        <div className={styles.categorySections}>
          {(['core', 'config', 'events', 'dev'] as const).map((category) => {
            const categoryTables = groupedTables[category] || [];
            if (categoryTables.length === 0) return null;

            return (
              <section key={category} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>{CATEGORY_LABELS[category]}</h2>
                <div className={styles.tableGrid}>
                  {categoryTables.map((table) => (
                    <Link
                      key={table.name}
                      href={`/admin/database/${table.name}`}
                      className={styles.tableCard}
                    >
                      <div className={styles.tableCardHeader}>
                        <table.icon size={24} className={styles.tableIcon} />
                        <span className={styles.tableName}>{table.displayName}</span>
                      </div>
                      <p className={styles.tableDescription}>{table.description}</p>
                      <div className={styles.tableCardFooter}>
                        <span className={styles.recordCount}>
                          {table.recordCount.toLocaleString()} records
                        </span>
                        <span className={styles.viewLink}>View &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className={styles.warningBanner}>
        <AlertCircle size={18} />
        <div>
          <strong>Caution:</strong> Editing data here directly affects the live application.
          Changes to <strong>Pricing Tiers</strong> will immediately update front-end pricing.
        </div>
      </div>
    </div>
  );
}
