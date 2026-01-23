'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquareText, 
  ListTodo, 
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  FileCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import styles from './page.module.css';

interface Stats {
  feedback: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  notes: {
    total: number;
    pinned: number;
  };
  business: {
    quotes: number;
    leads: number;
    orders: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch {
      setError('Could not load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <RefreshCw size={24} className={styles.spinner} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <AlertCircle size={24} />
          <span>{error}</span>
          <button onClick={fetchStats} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Project overview and quick actions
          </p>
        </div>
        <button onClick={fetchStats} className={styles.refreshButton} aria-label="Refresh stats">
          <RefreshCw size={16} />
        </button>
      </header>

      {/* Dev Tools Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Development Tools</h2>
        <div className={styles.statsGrid}>
          {/* Feedback Card */}
          <Link href="/admin/feedback" className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.iconFeedback}`}>
                <MessageSquareText size={20} />
              </div>
              <ChevronRight size={16} className={styles.statArrow} />
            </div>
            <div className={styles.statValue}>{stats?.feedback.total || 0}</div>
            <div className={styles.statLabel}>Feedback Items</div>
            <div className={styles.statMeta}>
              {stats?.feedback.new ? (
                <span className={styles.metaNew}>
                  <AlertCircle size={12} />
                  {stats.feedback.new} new
                </span>
              ) : null}
              {stats?.feedback.inProgress ? (
                <span className={styles.metaProgress}>
                  <Clock size={12} />
                  {stats.feedback.inProgress} in progress
                </span>
              ) : null}
            </div>
          </Link>

          {/* Tasks Card */}
          <Link href="/admin/tasks" className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.iconTasks}`}>
                <ListTodo size={20} />
              </div>
              <ChevronRight size={16} className={styles.statArrow} />
            </div>
            <div className={styles.statValue}>{stats?.tasks.total || 0}</div>
            <div className={styles.statLabel}>Tasks</div>
            <div className={styles.statMeta}>
              {stats?.tasks.todo ? (
                <span className={styles.metaTodo}>
                  {stats.tasks.todo} todo
                </span>
              ) : null}
              {stats?.tasks.inProgress ? (
                <span className={styles.metaProgress}>
                  <Clock size={12} />
                  {stats.tasks.inProgress} active
                </span>
              ) : null}
            </div>
          </Link>

          {/* Notes Card */}
          <Link href="/admin/notes" className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.iconNotes}`}>
                <FileText size={20} />
              </div>
              <ChevronRight size={16} className={styles.statArrow} />
            </div>
            <div className={styles.statValue}>{stats?.notes.total || 0}</div>
            <div className={styles.statLabel}>Notes</div>
            <div className={styles.statMeta}>
              {stats?.notes.pinned ? (
                <span className={styles.metaPinned}>
                  {stats.notes.pinned} pinned
                </span>
              ) : null}
            </div>
          </Link>
        </div>
      </section>

      {/* Business Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Business Metrics</h2>
        <div className={styles.businessGrid}>
          <div className={styles.businessCard}>
            <TrendingUp size={18} className={styles.businessIcon} />
            <div className={styles.businessValue}>{stats?.business.quotes || 0}</div>
            <div className={styles.businessLabel}>Total Quotes</div>
          </div>
          <div className={styles.businessCard}>
            <Users size={18} className={styles.businessIcon} />
            <div className={styles.businessValue}>{stats?.business.leads || 0}</div>
            <div className={styles.businessLabel}>Leads</div>
          </div>
          <div className={styles.businessCard}>
            <FileCheck size={18} className={styles.businessIcon} />
            <div className={styles.businessValue}>{stats?.business.orders || 0}</div>
            <div className={styles.businessLabel}>Orders</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/tasks" className={styles.actionButton}>
            <ListTodo size={16} />
            Add New Task
          </Link>
          <Link href="/admin/notes" className={styles.actionButton}>
            <FileText size={16} />
            Write Note
          </Link>
          <Link href="/admin/feedback?status=new" className={styles.actionButton}>
            <MessageSquareText size={16} />
            Review Feedback
          </Link>
        </div>
      </section>

      {/* Status Legend */}
      <section className={styles.legend}>
        <h3 className={styles.legendTitle}>Status Legend</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotNew}`} />
            New
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotProgress}`} />
            In Progress
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotDone}`} />
            Resolved/Done
          </div>
        </div>
      </section>
    </div>
  );
}
