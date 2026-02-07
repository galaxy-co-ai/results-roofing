'use client';

import { useState, useMemo } from 'react';
import { format, subDays, addDays, differenceInDays } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  ComposedChart,
} from 'recharts';
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OpsPageHeader, OpsStatCard } from '@/components/ui/ops';
import { cn } from '@/lib/utils';

// Seeded random for consistent demo data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate data for date range
const generateDataForRange = (from: Date, to: Date) => {
  const data = [];
  let currentDate = new Date(from);

  while (currentDate <= to) {
    const seed = currentDate.getTime() / 86400000;
    const baseRevenue = 8000 + Math.sin(seed / 7) * 2000;
    const baseCost = 3000 + Math.sin(seed / 7) * 1000;

    data.push({
      date: new Date(currentDate),
      dateStr: format(currentDate, 'MMM d'),
      revenue: Math.floor(baseRevenue + seededRandom(seed * 1) * 1500),
      cost: Math.floor(baseCost + seededRandom(seed * 2) * 800),
      profit: Math.floor((baseRevenue - baseCost) + seededRandom(seed * 3) * 700),
      leads: Math.floor(seededRandom(seed * 4) * 15) + 5,
      jobs: Math.floor(seededRandom(seed * 5) * 5) + 1,
      newCustomers: Math.floor(seededRandom(seed * 6) * 8) + 2,
      returning: Math.floor(seededRandom(seed * 7) * 12) + 3,
    });

    currentDate = addDays(currentDate, 1);
  }
  return data;
};

// Hourly traffic data
const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const seed = i * 1000;
  return {
    hour: `${i.toString().padStart(2, '0')}:00`,
    visitors: Math.floor(seededRandom(seed) * 200) + (i >= 9 && i <= 17 ? 150 : 30),
    conversions: Math.floor(seededRandom(seed + 1) * 10) + (i >= 9 && i <= 17 ? 5 : 1),
  };
});

// Lead source data
const leadSourceData = [
  { name: 'Google Ads', value: 42, fill: 'var(--ops-accent-crm)' },
  { name: 'Referrals', value: 28, fill: 'var(--ops-accent-messaging)' },
  { name: 'Website', value: 18, fill: 'var(--ops-accent-pipeline)' },
  { name: 'Other', value: 12, fill: 'var(--admin-gray-500)' },
];

// Chart configs
const revenueConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  cost: { label: 'Cost', color: 'hsl(0 84% 60%)' },
  profit: { label: 'Profit', color: 'hsl(142 76% 36%)' },
} satisfies ChartConfig;

const customerConfig = {
  newCustomers: { label: 'New', color: 'hsl(var(--primary))' },
  returning: { label: 'Returning', color: 'hsl(217 91% 60%)' },
} satisfies ChartConfig;

const hourlyConfig = {
  visitors: { label: 'Visitors', color: 'hsl(var(--primary))' },
  conversions: { label: 'Conversions', color: 'hsl(142 76% 36%)' },
} satisfies ChartConfig;

const sourceConfig = {
  'Google Ads': { label: 'Google Ads', color: 'var(--ops-accent-crm)' },
  Referrals: { label: 'Referrals', color: 'var(--ops-accent-messaging)' },
  Website: { label: 'Website', color: 'var(--ops-accent-pipeline)' },
  Other: { label: 'Other', color: 'var(--admin-gray-500)' },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [chartView, setChartView] = useState<'revenue' | 'profit' | 'leads'>('revenue');

  const filteredData = useMemo(() => {
    if (!dateRange?.from) {
      return generateDataForRange(subDays(new Date(), 29), new Date());
    }
    return generateDataForRange(dateRange.from, dateRange.to || dateRange.from);
  }, [dateRange]);

  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + item.profit, 0);
    const totalLeads = filteredData.reduce((sum, item) => sum + item.leads, 0);
    const totalJobs = filteredData.reduce((sum, item) => sum + item.jobs, 0);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
    return { totalRevenue, totalCost, totalProfit, totalLeads, totalJobs, profitMargin };
  }, [filteredData]);

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
        <OpsPageHeader
          title="Business Analytics"
          description={`${daysDiff} day${daysDiff !== 1 ? 's' : ''} selected${dateRange?.from ? ` · ${format(dateRange.from, 'MMM d')} - ${format(dateRange.to || dateRange.from, 'MMM d, yyyy')}` : ''}`}
          icon={BarChart3}
          accent="analytics"
        />
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
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="rounded-l-none" onClick={() => navigateRange('next')}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Download className="mr-2 size-4" /> Export CSV</DropdownMenuItem>
              <DropdownMenuItem><RefreshCw className="mr-2 size-4" /> Refresh</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 size-4" /> Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: 12.5 },
          { label: 'Cost', value: `$${stats.totalCost.toLocaleString()}`, change: 8.2 },
          { label: 'Profit', value: `$${stats.totalProfit.toLocaleString()}`, change: 18.3 },
          { label: 'Leads', value: stats.totalLeads.toLocaleString(), change: 5.7 },
          { label: 'Profit Margin', value: `${stats.profitMargin}%`, change: 2.1 },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="transition-all duration-[var(--admin-duration-hover)] ease-[var(--admin-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-md)]"
          >
            <CardContent className="pt-6">
              <p className="text-sm text-[var(--admin-text-secondary)]">{stat.label}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <span className={cn(
                  'flex items-center text-sm tabular-nums',
                  stat.change >= 0
                    ? 'text-[var(--admin-trend-positive)]'
                    : 'text-[var(--admin-trend-negative)]'
                )}>
                  {stat.change >= 0 ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Performance Overview */}
        <Card className="lg:col-span-2">
          <Tabs value={chartView} onValueChange={(v) => setChartView(v as typeof chartView)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Performance Overview</CardTitle>
                <CardDescription>Revenue, cost, and lead trends</CardDescription>
              </div>
              <TabsList className="h-8">
                <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                <TabsTrigger value="profit" className="text-xs">Profit</TabsTrigger>
                <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="revenue" className="mt-0">
                <ChartContainer config={revenueConfig} className="h-72 w-full">
                  <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revGrad)" />
                    <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  </AreaChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="profit" className="mt-0">
                <ChartContainer config={revenueConfig} className="h-72 w-full">
                  <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="leads" className="mt-0">
                <ChartContainer config={revenueConfig} className="h-72 w-full">
                  <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="leads" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead Sources</CardTitle>
            <CardDescription>Where leads come from</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ChartContainer config={sourceConfig} className="mx-auto aspect-square h-40">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                />
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2">
              {leadSourceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer Types</CardTitle>
            <CardDescription>New vs returning customers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={customerConfig} className="h-48 w-full">
              <BarChart data={filteredData.slice(-14)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tickMargin={8} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newCustomers" stackId="a" fill="var(--color-newCustomers)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="returning" stackId="a" fill="var(--color-returning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Hourly Traffic */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hourly Traffic</CardTitle>
            <CardDescription>Website visitors and conversions by hour (today)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={hourlyConfig} className="h-48 w-full">
              <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tickMargin={8} fontSize={10} interval={2} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickMargin={8} fontSize={10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickMargin={8} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="visitors" fill="var(--color-visitors)" radius={[2, 2, 0, 0]} opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="var(--color-conversions)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
