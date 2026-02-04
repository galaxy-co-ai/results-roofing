'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Settings,
  ArrowRight,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface HealthStatus {
  ghl?: {
    connected: boolean;
    locationId?: string;
  };
}

// Sample data for charts
const activityData = [
  { month: 'Jan', leads: 45, jobs: 12 },
  { month: 'Feb', leads: 52, jobs: 18 },
  { month: 'Mar', leads: 61, jobs: 22 },
  { month: 'Apr', leads: 48, jobs: 15 },
  { month: 'May', leads: 73, jobs: 28 },
  { month: 'Jun', leads: 68, jobs: 24 },
];

const pipelineData = [
  { stage: 'New', value: 24 },
  { stage: 'Contacted', value: 18 },
  { stage: 'Quoted', value: 12 },
  { stage: 'Won', value: 8 },
];

const chartConfig = {
  leads: { label: 'Leads', color: 'hsl(var(--primary))' },
  jobs: { label: 'Jobs', color: 'hsl(217 91% 60%)' },
} satisfies ChartConfig;

const pipelineConfig = {
  value: { label: 'Deals', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  loading?: boolean;
}

function StatCard({ label, value, change, icon: Icon, iconColor, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="size-5" style={{ color: iconColor }} />
          </div>
        </div>
        {change !== undefined && !loading && (
          <div className="mt-3 flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
            <span className={cn('text-sm font-medium', change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <div
        className="rounded-lg p-2"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon className="size-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground" />
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
    window.open('https://app.gohighlevel.com/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
          <p className="text-muted-foreground">
            {ghlConnected
              ? 'Overview of CRM, messaging, and sales pipeline performance'
              : 'Connect GoHighLevel to sync your CRM data'}
          </p>
        </div>
        <Tabs defaultValue="overview" className="w-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Connection Status Banner */}
      {!loading && ghlConnected === false && (
        <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-violet-50">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2">
                <Zap className="size-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium">Connect GoHighLevel to get started</p>
                <p className="text-sm text-muted-foreground">
                  Sync contacts, manage messaging, and track your pipeline
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleConnectGHL} className="bg-cyan-600 hover:bg-cyan-700">
              <Settings className="mr-2 size-4" />
              Configure
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Contacts"
          value={ghlConnected ? '1,234' : '--'}
          change={ghlConnected ? 12.5 : undefined}
          icon={Users}
          iconColor="#06B6D4"
          loading={loading}
        />
        <StatCard
          label="Conversations"
          value={ghlConnected ? '89' : '--'}
          change={ghlConnected ? 8.2 : undefined}
          icon={MessageSquare}
          iconColor="#8B5CF6"
          loading={loading}
        />
        <StatCard
          label="Pipeline Value"
          value={ghlConnected ? '$142,500' : '--'}
          change={ghlConnected ? 18.3 : undefined}
          icon={DollarSign}
          iconColor="#22C55E"
          loading={loading}
        />
        <StatCard
          label="Avg Response Time"
          value={ghlConnected ? '2.4h' : '--'}
          change={ghlConnected ? -15.2 : undefined}
          icon={Clock}
          iconColor="#F59E0B"
          loading={loading}
        />
      </div>

      {/* Charts and Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lead & Job Activity</CardTitle>
            <CardDescription>Monthly leads and completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {ghlConnected ? (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-leads)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-leads)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} fill="url(#leadGrad)" />
                  <Area type="monotone" dataKey="jobs" stroke="var(--color-jobs)" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
                <Inbox className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Connect GHL to see activity data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Pipeline</CardTitle>
            <CardDescription>Deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {ghlConnected ? (
              <ChartContainer config={pipelineConfig} className="h-64 w-full">
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} fontSize={12} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
                <DollarSign className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Connect GHL to see pipeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </CardContent>
      </Card>

      {/* Getting Started Section */}
      {!loading && ghlConnected === false && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
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
                  className="flex gap-3 rounded-lg p-4"
                  style={{ backgroundColor: `${item.color}08`, border: `1px solid ${item.color}20` }}
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
