'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Bug, 
  Lightbulb, 
  MessageCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DonutChart, BarList } from '@/components/ui/charts';
import { staggerContainer, cardItem, fadeInUp } from '@/lib/animation-variants';
import styles from './page.module.css';

interface FeedbackItem {
  id: string;
  reason: 'bug' | 'suggestion' | 'general';
  subOption: string;
  customReason: string | null;
  notes: string | null;
  page: string;
  userAgent: string | null;
  feedbackTimestamp: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#EF4444' },
  { value: 'reviewed', label: 'Reviewed', color: '#3B82F6' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', color: '#22C55E' },
  { value: 'wont_fix', label: "Won't Fix", color: '#6B7280' },
];

const REASON_ICONS = {
  bug: Bug,
  suggestion: Lightbulb,
  general: MessageCircle,
};

const REASON_LABELS = {
  bug: "Something's broken",
  suggestion: 'Feature idea',
  general: 'General feedback',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatSubOption(subOption: string): string {
  return subOption
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (reasonFilter) params.set('reason', reasonFilter);
      
      const response = await fetch(`/api/admin/feedback?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch {
      setError('Could not load feedback');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, reasonFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Calculate analytics from feedback data
  const analytics = useMemo(() => {
    const total = feedback.length;
    const byStatus = {
      new: feedback.filter(f => f.status === 'new').length,
      reviewed: feedback.filter(f => f.status === 'reviewed').length,
      in_progress: feedback.filter(f => f.status === 'in_progress').length,
      resolved: feedback.filter(f => f.status === 'resolved').length,
      wont_fix: feedback.filter(f => f.status === 'wont_fix').length,
    };
    const byReason = {
      bug: feedback.filter(f => f.reason === 'bug').length,
      suggestion: feedback.filter(f => f.reason === 'suggestion').length,
      general: feedback.filter(f => f.reason === 'general').length,
    };
    const resolutionRate = total > 0 
      ? Math.round(((byStatus.resolved + byStatus.wont_fix) / total) * 100) 
      : 0;

    return { total, byStatus, byReason, resolutionRate };
  }, [feedback]);

  // Prepare chart data
  const statusChartData = useMemo(() => [
    { name: 'New', value: analytics.byStatus.new },
    { name: 'Reviewed', value: analytics.byStatus.reviewed },
    { name: 'In Progress', value: analytics.byStatus.in_progress },
    { name: 'Resolved', value: analytics.byStatus.resolved },
    { name: "Won't Fix", value: analytics.byStatus.wont_fix },
  ].filter(d => d.value > 0), [analytics.byStatus]);

  const reasonBarListData = useMemo(() => [
    { name: 'Bug Reports', value: analytics.byReason.bug, color: 'rose' as const },
    { name: 'Feature Ideas', value: analytics.byReason.suggestion, color: 'violet' as const },
    { name: 'General Feedback', value: analytics.byReason.general, color: 'blue' as const },
  ].sort((a, b) => b.value - a.value), [analytics.byReason]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        const { feedback: updated } = await response.json();
        setFeedback((prev) => 
          prev.map((f) => (f.id === id ? updated : f))
        );
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdminNotesChange = async (id: string, adminNotes: string) => {
    try {
      await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });
    } catch {
      // Silent fail
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div 
      className={styles.page}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.header className={styles.header} variants={fadeInUp}>
        <div>
          <h1 className="text-heading-24 tracking-tight">Feedback</h1>
          <p className="text-copy-14 text-subtle mt-1">
            User feedback and bug reports
          </p>
        </div>
        <button onClick={fetchFeedback} className={styles.refreshButton} aria-label="Refresh">
          <RefreshCw size={16} />
        </button>
      </motion.header>

      {/* Analytics Section */}
      <motion.div 
        className="grid gap-4 md:grid-cols-4 mb-6"
        variants={staggerContainer}
      >
        {/* Total Feedback */}
        <motion.div variants={cardItem}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <MessageCircle size={18} className="text-blue-600" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total</span>
                <div className="text-2xl font-bold">{analytics.total}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* New/Unreviewed */}
        <motion.div variants={cardItem}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50">
                <AlertCircle size={18} className="text-rose-600" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Needs Review</span>
                <div className="text-2xl font-bold">{analytics.byStatus.new}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* In Progress */}
        <motion.div variants={cardItem}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock size={18} className="text-amber-600" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">In Progress</span>
                <div className="text-2xl font-bold">{analytics.byStatus.in_progress}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Resolved */}
        <motion.div variants={cardItem}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Resolved</span>
                <div className="text-2xl font-bold">{analytics.byStatus.resolved}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 mb-6"
        variants={staggerContainer}
      >
        {/* Status Distribution */}
        <motion.div variants={cardItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Status Distribution</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Resolution Rate</span>
                <Progress value={analytics.resolutionRate} className="w-20 h-2" />
                <span className="text-xs font-medium">{analytics.resolutionRate}%</span>
              </div>
            </div>
            {statusChartData.length > 0 ? (
              <DonutChart
                data={statusChartData}
                category="value"
                index="name"
                colors={['rose', 'blue', 'amber', 'emerald', 'slate']}
                className="h-40"
              />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No feedback data
              </div>
            )}
          </Card>
        </motion.div>

        {/* Feedback by Type */}
        <motion.div variants={cardItem}>
          <Card className="p-5">
            <h3 className="text-sm font-medium mb-4">Feedback by Type</h3>
            {reasonBarListData.length > 0 ? (
              <BarList data={reasonBarListData} className="mt-2" />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No feedback data
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div className={styles.filters} variants={fadeInUp}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by reason"
        >
          <option value="">All Types</option>
          <option value="bug">Bugs</option>
          <option value="suggestion">Suggestions</option>
          <option value="general">General</option>
        </select>
      </motion.div>

      {/* Loading/Error States */}
      {isLoading && (
        <div className={styles.loading}>
          <RefreshCw size={20} className={styles.spinner} />
          Loading...
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && feedback.length === 0 && (
        <div className={styles.empty}>
          <MessageCircle size={32} />
          <p>No feedback yet</p>
          <span>Feedback from users will appear here</span>
        </div>
      )}

      {/* Feedback List */}
      {!isLoading && feedback.length > 0 && (
        <motion.div className={styles.list} variants={staggerContainer}>
          {feedback.map((item) => {
            const ReasonIcon = REASON_ICONS[item.reason];
            const isExpanded = expandedId === item.id;
            const statusOption = STATUS_OPTIONS.find((s) => s.value === item.status);

            return (
              <motion.div key={item.id} className={styles.card} variants={cardItem}>
                {/* Card Header */}
                <button
                  className={styles.cardHeader}
                  onClick={() => toggleExpanded(item.id)}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.cardLeft}>
                    <div 
                      className={styles.reasonIcon}
                      style={{ 
                        background: item.reason === 'bug' 
                          ? 'rgba(239, 68, 68, 0.15)' 
                          : item.reason === 'suggestion'
                          ? 'rgba(168, 85, 247, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                        color: item.reason === 'bug' 
                          ? '#EF4444' 
                          : item.reason === 'suggestion'
                          ? '#A855F7'
                          : '#3B82F6',
                      }}
                    >
                      <ReasonIcon size={16} />
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardTitle}>
                        {item.customReason || formatSubOption(item.subOption)}
                      </span>
                      <span className={styles.cardMeta}>
                        {REASON_LABELS[item.reason]} • {item.page} • {formatDate(item.feedbackTimestamp)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span 
                      className={styles.statusBadge}
                      style={{ 
                        background: `${statusOption?.color}20`,
                        color: statusOption?.color,
                      }}
                    >
                      {statusOption?.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className={styles.cardBody}>
                    {/* User Notes */}
                    {item.notes && (
                      <div className={styles.section}>
                        <label className={styles.sectionLabel}>User Notes</label>
                        <p className={styles.userNotes}>{item.notes}</p>
                      </div>
                    )}

                    {/* Status Update */}
                    <div className={styles.section}>
                      <label className={styles.sectionLabel}>Status</label>
                      <div className={styles.statusButtons}>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            className={`${styles.statusButton} ${item.status === opt.value ? styles.statusActive : ''}`}
                            style={{ 
                              '--status-color': opt.color,
                            } as React.CSSProperties}
                            onClick={() => handleStatusChange(item.id, opt.value)}
                            disabled={updatingId === item.id}
                          >
                            {updatingId === item.id && item.status !== opt.value ? (
                              <Loader2 size={12} className={styles.spinner} />
                            ) : (
                              opt.label
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className={styles.section}>
                      <label className={styles.sectionLabel}>Admin Notes</label>
                      <textarea
                        className={styles.adminNotes}
                        placeholder="Add notes about this feedback..."
                        defaultValue={item.adminNotes || ''}
                        onBlur={(e) => handleAdminNotesChange(item.id, e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Metadata */}
                    <div className={styles.metadata}>
                      <span>ID: {item.id.slice(0, 8)}...</span>
                      {item.resolvedAt && <span>Resolved: {formatDate(item.resolvedAt)}</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
