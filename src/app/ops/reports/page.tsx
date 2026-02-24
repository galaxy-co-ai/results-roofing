'use client';

import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';
import { TrendingUp, Users, RefreshCw } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useOpsAnalytics } from '@/hooks/ops/use-ops-queries';

const STAGE_LABELS: Record<string, string> = {
  preliminary: 'New Lead',
  measured: 'Measured',
  selected: 'Tier Selected',
  financed: 'Financing',
  scheduled: 'Scheduled',
  signed: 'Signed',
  converted: 'Complete',
};

export default function ReportsPage() {
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading, refetch } = useOpsAnalytics(monthStart, today);

  const summary = useMemo(() => data?.summary ?? { totalRevenue: 0, totalOrders: 0, totalQuotes: 0, avgOrderValue: 0 }, [data]);
  const pipeline = useMemo(() => data?.pipeline ?? [], [data]);
  const totalQuotesInPipeline = pipeline.reduce((s, p) => s + p.count, 0);

  const kpis = useMemo(() => [
    { label: 'Revenue (MTD)', value: `$${summary.totalRevenue.toLocaleString()}` },
    { label: 'Orders', value: summary.totalOrders.toLocaleString() },
    { label: 'Quotes Generated', value: summary.totalQuotes.toLocaleString() },
    { label: 'Avg Order Value', value: `$${summary.avgOrderValue.toLocaleString()}` },
  ], [summary]);

  // Build cumulative funnel: each stage shows how many quotes reached it or beyond
  const funnelData = useMemo(() => {
    if (totalQuotesInPipeline === 0) return [];
    const stageOrder = ['preliminary', 'measured', 'selected', 'financed', 'scheduled', 'signed', 'converted'];
    let remaining = totalQuotesInPipeline;
    return stageOrder.map((stage) => {
      const count = remaining;
      const rate = ((count / totalQuotesInPipeline) * 100).toFixed(1) + '%';
      const stageData = pipeline.find((p) => p.stage === stage);
      remaining -= stageData?.count ?? 0;
      return {
        name: STAGE_LABELS[stage] || stage,
        count,
        rate,
      };
    }).filter((s) => s.count > 0);
  }, [pipeline, totalQuotesInPipeline]);

  // Lead source chart data
  const leadsBySource = data?.leadsBySource ?? [];

  // Revenue trend from daily data
  const revenueChartData = useMemo(() => {
    if (!data?.daily?.length) return [];
    // Aggregate by week for a cleaner chart
    const weekly: { label: string; revenue: number }[] = [];
    let weekRevenue = 0;
    let weekStart = '';
    data.daily.forEach((d, i) => {
      if (i % 7 === 0) {
        if (weekStart) {
          weekly.push({ label: weekStart, revenue: Math.round(weekRevenue * 100) / 100 });
        }
        weekStart = format(new Date(d.date), 'MMM d');
        weekRevenue = 0;
      }
      weekRevenue += d.revenue;
    });
    if (weekStart) {
      weekly.push({ label: weekStart, revenue: Math.round(weekRevenue * 100) / 100 });
    }
    return weekly;
  }, [data?.daily]);

  const leadSourceConfig = {
    count: { label: 'Leads', color: 'hsl(var(--primary))' },
  } satisfies ChartConfig;

  const revenueConfig = {
    revenue: { label: 'Revenue', color: 'hsl(217 91% 60%)' },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'MMMM yyyy')} &middot; Business intelligence
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-24 mt-1" />
                  ) : (
                    <p className="text-xl font-bold tabular-nums mt-1" style={{ fontFamily: 'var(--ops-font-display)' }}>{kpi.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quote Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              ) : funnelData.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No quotes in pipeline yet</div>
              ) : (
                <div className="space-y-2">
                  {funnelData.map((stage) => (
                    <div key={stage.name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-28 text-right">{stage.name}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-7 overflow-hidden">
                          <div
                            className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all"
                            style={{ width: stage.rate }}
                          >
                            {parseFloat(stage.rate) > 15 && (
                              <span className="text-[11px] font-medium text-white tabular-nums">{stage.count}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums w-12">{stage.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Source + Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Leads by Source</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-7 w-full" />
                    ))}
                  </div>
                ) : leadsBySource.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs">No lead data for this period</p>
                    </div>
                  </div>
                ) : (
                  <ChartContainer config={leadSourceConfig} className="h-[200px] w-full">
                    <BarChart data={leadsBySource} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis
                        dataKey="source"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                        width={80}
                        tickFormatter={(v: string) => v.length > 10 ? v.substring(0, 10) + '...' : v}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-7 w-full" />
                    ))}
                  </div>
                ) : revenueChartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs">No revenue data for this period</p>
                    </div>
                  </div>
                ) : (
                  <ChartContainer config={revenueConfig} className="h-[200px] w-full">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} />
                      <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales Rep Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-12 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p>Team performance tracking</p>
                  <p className="text-xs mt-1">Set up team members to track individual performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lead Source Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              ) : leadsBySource.length === 0 ? (
                <div className="py-12 flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>No lead data for this period</p>
                    <p className="text-xs mt-1">Leads will appear here as they come in</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadsBySource.map(ls => {
                    const maxCount = Math.max(...leadsBySource.map(l => l.count), 1);
                    const pct = ((ls.count / maxCount) * 100).toFixed(0);
                    return (
                      <div key={ls.source} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 text-right capitalize truncate">{ls.source}</span>
                        <div className="flex-1 bg-muted rounded-full h-7 overflow-hidden">
                          <div
                            className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${pct}%` }}
                          >
                            {Number(pct) > 15 && (
                              <span className="text-[11px] font-medium text-white tabular-nums">{ls.count}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums w-8">{ls.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
