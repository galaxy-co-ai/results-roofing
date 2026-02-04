'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Settings,
  ArrowRight,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState, EmptyStatCard } from '@/components/features/ops/EmptyState';
import { Button } from '@/components/ui/button';
import styles from './ops.module.css';

interface HealthStatus {
  ghl?: {
    connected: boolean;
    locationId?: string;
  };
}

function QuickActionCard({
  href,
  icon: Icon,
  iconColor,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: `${iconColor}08`,
        border: `1px solid ${iconColor}20`,
        borderRadius: '0.625rem',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${iconColor}12`;
        e.currentTarget.style.borderColor = `${iconColor}30`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${iconColor}08`;
        e.currentTarget.style.borderColor = `${iconColor}20`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          background: `${iconColor}15`,
        }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
          {title}
        </span>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>
          {description}
        </p>
      </div>
      <ArrowRight size={14} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
    </Link>
  );
}

export default function OpsDashboard() {
  const [loading, setLoading] = useState(true);
  const [ghlConnected, setGhlConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/ops/health');
        if (response.ok) {
          const data: HealthStatus = await response.json();
          setGhlConnected(data.ghl?.connected ?? false);
        }
      } catch {
        setGhlConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const handleConnectGHL = () => {
    // TODO: Navigate to settings or open GHL setup modal
    window.open('https://app.gohighlevel.com/', '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Operations Dashboard</h1>
        <p className={styles.pageDescription}>
          {ghlConnected
            ? 'Overview of CRM, messaging, and sales pipeline performance'
            : 'Connect GoHighLevel to sync your CRM data'}
        </p>
      </div>

      {/* Connection Status Banner */}
      {!loading && ghlConnected === false && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(6, 182, 212, 0.15)',
              }}
            >
              <Zap size={18} style={{ color: '#06B6D4' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                Connect GoHighLevel to get started
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                Sync contacts, manage messaging, and track your pipeline
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleConnectGHL} style={{ background: '#06B6D4' }}>
            <Settings size={14} />
            Configure
          </Button>
        </div>
      )}

      {/* Stats Grid - Empty States */}
      <div className={styles.statsGrid}>
        <EmptyStatCard
          icon={Users}
          iconColor="#06B6D4"
          label="Total Contacts"
          emptyText="Syncs from GHL"
        />
        <EmptyStatCard
          icon={MessageSquare}
          iconColor="#8B5CF6"
          label="Conversations"
          emptyText="Syncs from GHL"
        />
        <EmptyStatCard
          icon={DollarSign}
          iconColor="#22C55E"
          label="Pipeline Value"
          emptyText="Syncs from GHL"
        />
        <EmptyStatCard
          icon={Clock}
          iconColor="#F59E0B"
          label="Avg Response Time"
          emptyText="Calculated live"
        />
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Activity - Empty State */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
              }}
            >
              Recent Activity
            </h2>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--muted-foreground)',
                padding: '0.25rem 0.5rem',
                background: 'var(--muted)',
                borderRadius: '9999px',
              }}
            >
              Live feed
            </span>
          </div>
          <EmptyState
            icon={Inbox}
            iconColor="#64748B"
            title="No activity yet"
            description="When contacts are added, messages are sent, or deals are updated, you'll see them here."
            size="md"
          />
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
            <QuickActionCard
              href="/ops/crm/contacts"
              icon={Users}
              iconColor="#06B6D4"
              title="Manage Contacts"
              description="View and organize your leads"
            />
            <QuickActionCard
              href="/ops/messaging/sms"
              icon={MessageSquare}
              iconColor="#8B5CF6"
              title="SMS Center"
              description="Send messages to contacts"
            />
            <QuickActionCard
              href="/ops/crm/pipeline"
              icon={DollarSign}
              iconColor="#22C55E"
              title="Sales Pipeline"
              description="Track deals and opportunities"
            />
            <QuickActionCard
              href="/ops/analytics"
              icon={TrendingUp}
              iconColor="#F59E0B"
              title="Analytics"
              description="Performance insights"
            />
          </div>
        </div>
      </div>

      {/* Getting Started Section - Only show when not connected */}
      {!loading && ghlConnected === false && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
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
            Getting Started
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                step: 1,
                title: 'Configure GoHighLevel',
                description: 'Add your API key and Location ID in settings',
                color: '#06B6D4',
              },
              {
                step: 2,
                title: 'Sync Contacts',
                description: 'Import your existing contacts and leads',
                color: '#8B5CF6',
              },
              {
                step: 3,
                title: 'Set Up Messaging',
                description: 'Configure SMS and email templates',
                color: '#22C55E',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: `${item.color}05`,
                  border: `1px solid ${item.color}15`,
                  borderRadius: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>
                    {item.title}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
