'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Settings,
  Inbox,
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
import {
  OpsStatCard,
  OpsActionCard,
  OpsEmptyState,
  OpsOnboardingStep,
} from '@/components/ui/ops';

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
          <h1
            className="font-bold tracking-tight text-[var(--admin-text-primary)]"
            style={{ fontSize: 'var(--admin-text-display)', textWrap: 'balance' }}
          >
            Operations Dashboard
          </h1>
          <p className="text-[var(--admin-text-secondary)]" style={{ textWrap: 'balance' }}>
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
        <Card className="border-[var(--ops-accent-documents)] bg-[var(--ops-accent-documents-muted)]">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--ops-accent-documents)_20%,transparent)] p-2">
                <Zap className="size-5 text-[var(--ops-accent-documents)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--admin-text-primary)]">
                  Connect GoHighLevel to get started
                </p>
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  Sync contacts, manage messaging, and track your pipeline
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleConnectGHL}
              className="bg-[var(--ops-accent-documents)] hover:bg-[color-mix(in_srgb,var(--ops-accent-documents)_90%,black)] transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] active:scale-[var(--admin-scale-press)]"
            >
              <Settings className="mr-2 size-4" />
              Configure
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OpsStatCard
          label="Total Contacts"
          value={ghlConnected ? '1,234' : '--'}
          change={ghlConnected ? 12.5 : undefined}
          icon={Users}
          accent="documents"
          loading={loading}
        />
        <OpsStatCard
          label="Conversations"
          value={ghlConnected ? '89' : '--'}
          change={ghlConnected ? 8.2 : undefined}
          icon={MessageSquare}
          accent="messaging"
          loading={loading}
        />
        <OpsStatCard
          label="Pipeline Value"
          value={ghlConnected ? '$142,500' : '--'}
          change={ghlConnected ? 18.3 : undefined}
          icon={DollarSign}
          accent="pipeline"
          loading={loading}
        />
        <OpsStatCard
          label="Avg Response Time"
          value={ghlConnected ? '2.4h' : '--'}
          change={ghlConnected ? -15.2 : undefined}
          icon={Clock}
          accent="analytics"
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
              <OpsEmptyState
                icon={Inbox}
                title="Connect GHL to see activity data"
                className="h-64"
              />
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
              <OpsEmptyState
                icon={DollarSign}
                title="Connect GHL to see pipeline"
                className="h-64"
              />
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
            <OpsActionCard
              href="/ops/crm/contacts"
              icon={Users}
              accent="documents"
              title="Manage Contacts"
              description="View and organize your leads"
            />
            <OpsActionCard
              href="/ops/messaging/sms"
              icon={MessageSquare}
              accent="messaging"
              title="SMS Center"
              description="Send messages to contacts"
            />
            <OpsActionCard
              href="/ops/crm/pipeline"
              icon={DollarSign}
              accent="pipeline"
              title="Sales Pipeline"
              description="Track deals and opportunities"
            />
            <OpsActionCard
              href="/ops/analytics"
              icon={TrendingUp}
              accent="analytics"
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
              <OpsOnboardingStep
                step={1}
                title="Configure GoHighLevel"
                description="Add your API key and Location ID in settings"
                accent="documents"
              />
              <OpsOnboardingStep
                step={2}
                title="Sync Contacts"
                description="Import your existing contacts and leads"
                accent="messaging"
              />
              <OpsOnboardingStep
                step={3}
                title="Set Up Messaging"
                description="Configure SMS and email templates"
                accent="pipeline"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
