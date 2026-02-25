'use client';

import { useState, useMemo } from 'react';
import { format, subDays, addDays, differenceInDays } from 'date-fns';
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis,
} from 'recharts';
import {
  CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, TrendingUp,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OpsPageHeader } from '@/components/ui/ops';
import { cn } from '@/lib/utils';
import { useOpsAnalytics } from '@/hooks/ops/use-ops-queries';
import { useToast } from '@/components/ui/Toast';

const revenueConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const ordersConfig = {
  orders: { label: 'Orders', color: 'hsl(217 91% 60%)' },
} satisfies ChartConfig;

const quotesConfig = {
  quotes: { label: 'Quotes', color: 'hsl(142 76% 36%)' },
} satisfies ChartConfig;

const STAGE_LABELS: Record<string, string> = {
  preliminary: 'New',
  measured: 'Measured',
  selected: 'Selected',
  financed: 'Financed',
  scheduled: 'Scheduled',
  signed: 'Signed',
  converted: 'Converted',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [chartView, setChartView] = useState<'revenue' | 'orders' | 'quotes'>('revenue');

  const { success, error: showError } = useToast();

  const fromStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const toStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
  const { data, isLoading, refetch } = useOpsAnalytics(fromStr, toStr);

  async function handleRefresh() {
    try {
      await refetch();
      success('Refreshed');
    } catch {
      showError('Failed to refresh');
    }
  }

  const chartData = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.map((d) => ({
      ...d,
      dateStr: format(new Date(d.date + 'T00:00:00'), 'MMM d'),
    }));
  }, [data]);

  const pipelineData = useMemo(() => {
    if (!data?.pipeline) return [];
    return data.pipeline.filter((p) => p.count > 0);
  }, [data]);

  const maxPipelineCount = Math.max(...pipelineData.map((p) => p.count), 1);

  const summary = data?.summary ?? { totalRevenue: 0, totalOrders: 0, totalQuotes: 0, avgOrderValue: 0 };

  const daysDiff = dateRange?.from && dateRange?.to
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 30;

  const navigateRange = (direction: 'prev' | 'next') => {
    if (!dateRange?.from || !dateRange?.to) return;
    const shift = direction === 'prev' ? -daysDiff : daysDiff;
    setDateRange({
      from: addDays(dateRange.from, shift),
      to: addDays(dateRange.to, shift),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <OpsPageHeader title="Business Analytics" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-[var(--admin-border-default)]">
            <Button variant="ghost" size="icon" className="rounded-r-none" onClick={() => navigateRange('prev')}>
              <ChevronLeft className="size-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="rounded-none border-x border-[var(--admin-border-default)] px-3">
                  <CalendarIcon className="mr-2 size-4" />
                  {dateRange?.from ? format(dateRange.from, 'MMM d') : 'Start'} - {dateRange?.to ? format(dateRange.to, 'MMM d') : 'End'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="range" numberOfMonths={2} selected={dateRange} onSelect={setDateRange} />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="rounded-l-none" onClick={() => navigateRange('next')}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Revenue', value: `$${summary.totalRevenue.toLocaleString()}` },
          { label: 'Orders', value: summary.totalOrders.toLocaleString() },
          { label: 'Quotes', value: summary.totalQuotes.toLocaleString() },
          { label: 'Avg Order', value: `$${summary.avgOrderValue.toLocaleString()}` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {isLoading ? '—' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Performance Overview */}
        <Card className="lg:col-span-2">
          <Tabs value={chartView} onValueChange={(v) => setChartView(v as typeof chartView)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Performance Overview</CardTitle>
                <CardDescription>{daysDiff}-day trend</CardDescription>
              </div>
              <TabsList className="h-8">
                <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
                <TabsTrigger value="quotes" className="text-xs">Quotes</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No data for this period</div>
              ) : (
                <>
                  <TabsContent value="revenue" className="mt-0">
                    <ChartContainer config={revenueConfig} className="h-72 w-full">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revGrad)" />
                      </AreaChart>
                    </ChartContainer>
                  </TabsContent>
                  <TabsContent value="orders" className="mt-0">
                    <ChartContainer config={ordersConfig} className="h-72 w-full">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>
                  <TabsContent value="quotes" className="mt-0">
                    <ChartContainer config={quotesConfig} className="h-72 w-full">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="quotes" stroke="var(--color-quotes)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* Pipeline Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quote Pipeline</CardTitle>
            <CardDescription>All-time by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : pipelineData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No quotes yet</div>
            ) : (
              <div className="space-y-3">
                {pipelineData.map((stage) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 text-right">{STAGE_LABELS[stage.stage] || stage.stage}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max((stage.count / maxPipelineCount) * 100, 8)}%` }}
                      >
                        {stage.count > 0 && (
                          <span className="text-[11px] font-medium text-white tabular-nums">{stage.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder: Lead Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead Sources</CardTitle>
            <CardDescription>Where leads come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs">Connect CRM for lead source tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder: Traffic */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Website Traffic</CardTitle>
            <CardDescription>Visitors and conversions by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs">Connect Google Analytics for traffic data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
