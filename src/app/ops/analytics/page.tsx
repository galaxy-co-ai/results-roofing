'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  MessageSquare,
  FileText,
  TrendingUp,
  Eye,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  StatsCard,
  AreaChart,
  BarChart,
  DonutChart,
  ActivityFeed,
} from '@/components/features/ops/analytics';

// Mock data generators
function generateRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((label, i) => ({
    label,
    value: 50000 + Math.random() * 30000 + i * 5000,
  }));
}

function generateLeadSourceData() {
  return [
    { label: 'Google Ads', value: 145, color: '#06b6d4' },
    { label: 'Facebook', value: 98, color: '#8b5cf6' },
    { label: 'Referrals', value: 76, color: '#22c55e' },
    { label: 'Website', value: 54, color: '#f59e0b' },
    { label: 'Other', value: 23, color: '#6b7280' },
  ];
}

function generateConversionData() {
  return [
    { label: 'Converted', value: 42, color: '#22c55e' },
    { label: 'In Progress', value: 28, color: '#f59e0b' },
    { label: 'Lost', value: 18, color: '#ef4444' },
  ];
}

function generateWeeklyLeads() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((label) => ({
    label,
    value: Math.floor(5 + Math.random() * 15),
  }));
}

function generateActivityItems() {
  const now = Date.now();
  return [
    {
      id: '1',
      icon: Users,
      iconColor: '#06b6d4',
      iconBg: '#06b6d415',
      text: <><strong>John Smith</strong> became a new lead via Google Ads</>,
      timestamp: new Date(now - 15 * 60000).toISOString(),
    },
    {
      id: '2',
      icon: DollarSign,
      iconColor: '#22c55e',
      iconBg: '#22c55e15',
      text: <><strong>Sarah Johnson</strong> paid invoice #1234 ($3,450)</>,
      timestamp: new Date(now - 45 * 60000).toISOString(),
    },
    {
      id: '3',
      icon: MessageSquare,
      iconColor: '#8b5cf6',
      iconBg: '#8b5cf615',
      text: <>New SMS received from <strong>Mike Brown</strong></>,
      timestamp: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: '4',
      icon: CheckCircle2,
      iconColor: '#22c55e',
      iconBg: '#22c55e15',
      text: <>Opportunity <strong>&quot;Roof Replacement - Davis&quot;</strong> moved to Won</>,
      timestamp: new Date(now - 4 * 3600000).toISOString(),
    },
    {
      id: '5',
      icon: Mail,
      iconColor: '#f59e0b',
      iconBg: '#f59e0b15',
      text: <>Email campaign <strong>&quot;Spring Promotion&quot;</strong> sent to 234 contacts</>,
      timestamp: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: '6',
      icon: FileText,
      iconColor: '#06b6d4',
      iconBg: '#06b6d415',
      text: <>Blog post <strong>&quot;5 Signs Your Roof Needs Attention&quot;</strong> published</>,
      timestamp: new Date(now - 24 * 3600000).toISOString(),
    },
    {
      id: '7',
      icon: AlertCircle,
      iconColor: '#ef4444',
      iconBg: '#ef444415',
      text: <>Support ticket <strong>#4523</strong> marked as urgent</>,
      timestamp: new Date(now - 26 * 3600000).toISOString(),
    },
    {
      id: '8',
      icon: Phone,
      iconColor: '#8b5cf6',
      iconBg: '#8b5cf615',
      text: <>Missed call from <strong>(469) 555-0123</strong></>,
      timestamp: new Date(now - 28 * 3600000).toISOString(),
    },
  ];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [conversionData, setConversionData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [weeklyLeads, setWeeklyLeads] = useState<{ label: string; value: number }[]>([]);
  const [activityItems, setActivityItems] = useState<ReturnType<typeof generateActivityItems>>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setRevenueData(generateRevenueData());
      setLeadSourceData(generateLeadSourceData());
      setConversionData(generateConversionData());
      setWeeklyLeads(generateWeeklyLeads());
      setActivityItems(generateActivityItems());
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const totalLeads = leadSourceData.reduce((sum, d) => sum + d.value, 0);
  const totalConversions = conversionData.find((d) => d.label === 'Converted')?.value || 0;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Analytics Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
          Track your business performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatsCard
          title="Total Revenue"
          value="$142,580"
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="#22c55e"
          loading={loading}
        />
        <StatsCard
          title="New Leads"
          value={loading ? '...' : totalLeads.toString()}
          change={8.2}
          changeLabel="vs last month"
          icon={Users}
          iconColor="#06b6d4"
          loading={loading}
        />
        <StatsCard
          title="Conversions"
          value={loading ? '...' : totalConversions.toString()}
          change={-2.4}
          changeLabel="vs last month"
          icon={TrendingUp}
          iconColor="#8b5cf6"
          loading={loading}
        />
        <StatsCard
          title="Blog Views"
          value="12,847"
          change={23.1}
          changeLabel="vs last month"
          icon={Eye}
          iconColor="#f59e0b"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <AreaChart
          title="Revenue Trend"
          subtitle="Last 6 months"
          data={revenueData}
          color="#22c55e"
          height={220}
          loading={loading}
          formatValue={(v) => `$${Math.round(v / 1000)}k`}
        />
        <BarChart
          title="Leads This Week"
          subtitle="Daily breakdown"
          data={weeklyLeads}
          color="#06b6d4"
          height={220}
          loading={loading}
        />
      </div>

      {/* Charts Row 2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <BarChart
          title="Lead Sources"
          subtitle="Top acquisition channels"
          data={leadSourceData}
          horizontal
          loading={loading}
        />
        <DonutChart
          title="Conversion Pipeline"
          subtitle="Current opportunities"
          data={conversionData}
          centerValue={totalConversions + (conversionData.find((d) => d.label === 'In Progress')?.value || 0)}
          centerLabel="Active"
          loading={loading}
        />
      </div>

      {/* Activity Feed */}
      <div style={{ maxWidth: 600 }}>
        <ActivityFeed
          title="Recent Activity"
          items={activityItems}
          loading={loading}
          maxItems={8}
        />
      </div>
    </div>
  );
}
