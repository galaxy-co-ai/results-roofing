'use client';

import { Download, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/Toast';

const KPIS = [
  { label: 'Revenue (MTD)', value: '$184,200', change: '+12.3%', up: true },
  { label: 'Jobs Won', value: '14', change: '+3', up: true },
  { label: 'Close Rate', value: '34.2%', change: '-2.1%', up: false },
  { label: 'Avg Job Value', value: '$13,157', change: '+4.8%', up: true },
  { label: 'Speed to Lead', value: '18 min', change: '-3 min', up: true },
  { label: 'Avg Days to Close', value: '12.4', change: '+1.2', up: false },
];

const PIPELINE_STAGES = [
  { name: 'New Lead', count: 47, rate: '100%' },
  { name: 'Appointment', count: 38, rate: '80.9%' },
  { name: 'Measured', count: 32, rate: '68.1%' },
  { name: 'Proposal Sent', count: 28, rate: '59.6%' },
  { name: 'Signed', count: 16, rate: '34.0%' },
  { name: 'Complete', count: 14, rate: '29.8%' },
];

const LEAD_SOURCES = [
  { source: 'Website', leads: 18, conv: '38%', revenue: '$68,400' },
  { source: 'Referral', leads: 12, conv: '50%', revenue: '$54,000' },
  { source: 'Google Ads', leads: 9, conv: '22%', revenue: '$36,800' },
  { source: 'Door Knock', leads: 5, conv: '40%', revenue: '$18,000' },
  { source: 'Facebook', leads: 3, conv: '33%', revenue: '$7,000' },
];

const REP_PERFORMANCE = [
  { name: 'Jake Sullivan', jobs: 6, revenue: '$82,000', closeRate: '42%', avgDays: '9' },
  { name: 'Tyler Clark', jobs: 5, revenue: '$61,200', closeRate: '31%', avgDays: '14' },
  { name: 'Anna Brooks', jobs: 3, revenue: '$41,000', closeRate: '28%', avgDays: '16' },
];

export default function ReportsPage() {
  const { info } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Business intelligence and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => info('Coming soon', 'Date range selector is under development')}>This Month</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => info('Coming soon', 'Report export is under development')}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPIS.map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-xl font-bold tabular-nums mt-1" style={{ fontFamily: 'var(--ops-font-display)' }}>{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                    {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                    <span className="text-muted-foreground font-normal">vs last mo</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lead Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 text-right">{stage.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-7 overflow-hidden">
                        <div
                          className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: stage.rate }}
                        >
                          {parseFloat(stage.rate) > 20 && (
                            <span className="text-[11px] font-medium text-white tabular-nums">{stage.count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-12">{stage.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Two-column: Lead Sources + Revenue Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Leads by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {LEAD_SOURCES.map((src) => (
                    <div key={src.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24">{src.source}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{src.leads} leads</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs tabular-nums text-muted-foreground">{src.conv} conv</span>
                        <span className="text-sm font-medium tabular-nums w-20 text-right">{src.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p>Revenue chart</p>
                    <p className="text-xs mt-1">Connect data source to visualize</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rep Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REP_PERFORMANCE.map((rep, i) => (
                  <div key={rep.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{rep.name}</p>
                      <p className="text-xs text-muted-foreground">{rep.jobs} jobs won</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{rep.revenue}</p>
                      <p className="text-xs text-muted-foreground">{rep.closeRate} close rate</p>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-3">
                {LEAD_SOURCES.map((src) => (
                  <div key={src.source} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-28">{src.source}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{ width: `${(src.leads / 18) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums w-16">{src.leads} leads</span>
                    <span className="text-xs tabular-nums w-12 text-right">{src.conv}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
