'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Mail,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import styles from './ops.module.css';

interface DashboardStats {
  contacts: {
    total: number;
    new: number;
    change: number;
  };
  conversations: {
    total: number;
    unread: number;
    change: number;
  };
  pipeline: {
    totalValue: number;
    deals: number;
    change: number;
  };
  performance: {
    responseTime: number; // minutes
    conversionRate: number; // percentage
    change: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'contact' | 'message' | 'deal' | 'email';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'warning';
}

// Placeholder data - will be replaced with API calls
const mockStats: DashboardStats = {
  contacts: { total: 1247, new: 23, change: 12 },
  conversations: { total: 89, unread: 7, change: -5 },
  pipeline: { totalValue: 324500, deals: 42, change: 18 },
  performance: { responseTime: 14, conversionRate: 32, change: 4 },
};

const mockActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'contact',
    title: 'New Lead Added',
    description: 'John Smith requested a quote for roof replacement',
    time: '5 min ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'message',
    title: 'SMS Received',
    description: 'Sarah Johnson replied to appointment reminder',
    time: '12 min ago',
    status: 'pending',
  },
  {
    id: '3',
    type: 'deal',
    title: 'Deal Moved',
    description: 'Williams Project moved to "Proposal Sent"',
    time: '1 hour ago',
    status: 'success',
  },
  {
    id: '4',
    type: 'email',
    title: 'Email Delivered',
    description: 'Quote follow-up sent to Mike Brown',
    time: '2 hours ago',
    status: 'success',
  },
  {
    id: '5',
    type: 'message',
    title: 'SMS Failed',
    description: 'Could not deliver message to +1 (555) 123-4567',
    time: '3 hours ago',
    status: 'warning',
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  change,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  change: number;
  iconColor?: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className={styles.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className={styles.statLabel}>{label}</p>
          <p className={styles.statValue}>{value}</p>
          {subValue && (
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
              {subValue}
            </p>
          )}
        </div>
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            background: iconColor ? `${iconColor}15` : 'rgba(6, 182, 212, 0.1)',
          }}
        >
          <Icon size={20} color={iconColor || '#06B6D4'} />
        </div>
      </div>
      <div className={`${styles.statChange} ${isPositive ? styles.statChangePositive : styles.statChangeNegative}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{Math.abs(change)}% vs last week</span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'contact':
        return Users;
      case 'message':
        return MessageSquare;
      case 'deal':
        return DollarSign;
      case 'email':
        return Mail;
      default:
        return AlertCircle;
    }
  };

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'success':
        return <CheckCircle2 size={14} style={{ color: '#22C55E' }} />;
      case 'warning':
        return <AlertCircle size={14} style={{ color: '#F59E0B' }} />;
      default:
        return <Clock size={14} style={{ color: '#64748B' }} />;
    }
  };

  const Icon = getIcon();

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: 'rgba(6, 182, 212, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={14} style={{ color: '#06B6D4' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>
            {activity.title}
          </span>
          {getStatusIcon()}
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            margin: '0.25rem 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activity.description}
        </p>
      </div>
      <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>
        {activity.time}
      </span>
    </div>
  );
}

export default function OpsDashboard() {
  // Note: setStats and setActivity will be used when GHL integration is complete
  const [stats] = useState<DashboardStats>(mockStats);
  const [activity] = useState<RecentActivity[]>(mockActivity);
  const [, setLoading] = useState(true);
  const [ghlConnected, setGhlConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API calls to GHL
    const fetchData = async () => {
      try {
        // Test GHL connection
        const response = await fetch('/api/ops/health');
        if (response.ok) {
          const data = await response.json();
          setGhlConnected(data.ghl?.connected ?? false);
        }
      } catch {
        setGhlConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Operations Dashboard</h1>
        <p className={styles.pageDescription}>
          Overview of CRM, messaging, and sales pipeline performance
        </p>
      </div>

      {/* GHL Connection Status */}
      {ghlConnected === false && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} style={{ color: '#F59E0B' }} />
          <span style={{ fontSize: '0.875rem', color: '#F59E0B' }}>
            GoHighLevel connection not configured. Some features may be unavailable.
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={formatNumber(stats.contacts.total)}
          subValue={`${stats.contacts.new} new this week`}
          change={stats.contacts.change}
          iconColor="#06B6D4"
        />
        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={formatNumber(stats.conversations.total)}
          subValue={`${stats.conversations.unread} unread`}
          change={stats.conversations.change}
          iconColor="#8B5CF6"
        />
        <StatCard
          icon={DollarSign}
          label="Pipeline Value"
          value={formatCurrency(stats.pipeline.totalValue)}
          subValue={`${stats.pipeline.deals} active deals`}
          change={stats.pipeline.change}
          iconColor="#22C55E"
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={`${stats.performance.responseTime} min`}
          subValue={`${stats.performance.conversionRate}% conversion`}
          change={stats.performance.change}
          iconColor="#F59E0B"
        />
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <h2
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              margin: '0 0 1rem',
            }}
          >
            Recent Activity
          </h2>
          <div>
            {activity.map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
          <button
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.75rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              color: 'var(--muted-foreground)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            View All Activity
          </button>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <h2
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              margin: '0 0 1rem',
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a
              href="/ops/crm/contacts"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={18} style={{ color: '#06B6D4' }} />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                  Add New Contact
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Create a new lead or customer
                </p>
              </div>
            </a>
            <a
              href="/ops/messaging/sms"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <MessageSquare size={18} style={{ color: '#8B5CF6' }} />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                  Send SMS
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Message a contact directly
                </p>
              </div>
            </a>
            <a
              href="/ops/crm/pipeline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <DollarSign size={18} style={{ color: '#22C55E' }} />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                  View Pipeline
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Manage deals and opportunities
                </p>
              </div>
            </a>
            <a
              href="/ops/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <TrendingUp size={18} style={{ color: '#F59E0B' }} />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                  View Analytics
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Performance reports and insights
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
