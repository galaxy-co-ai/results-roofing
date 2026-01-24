'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Table2,
  Users,
  FileText,
  Package,
  CreditCard,
  Calendar,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  icon: LucideIcon;
  recordCount: number;
  category: 'core' | 'config' | 'events' | 'dev';
}

const TABLE_METADATA: Record<string, Omit<TableInfo, 'recordCount'>> = {
  leads: {
    name: 'leads',
    displayName: 'Leads',
    description: 'Customer contact information and addresses',
    icon: Users,
    category: 'core',
  },
  quotes: {
    name: 'quotes',
    displayName: 'Quotes',
    description: 'Roofing quotes with pricing and status',
    icon: FileText,
    category: 'core',
  },
  orders: {
    name: 'orders',
    displayName: 'Orders',
    description: 'Confirmed jobs after contract signing',
    icon: Package,
    category: 'core',
  },
  contracts: {
    name: 'contracts',
    displayName: 'Contracts',
    description: 'E-signature contracts and status',
    icon: FileText,
    category: 'core',
  },
  payments: {
    name: 'payments',
    displayName: 'Payments',
    description: 'Payment records from Stripe',
    icon: CreditCard,
    category: 'core',
  },
  appointments: {
    name: 'appointments',
    displayName: 'Appointments',
    description: 'Scheduled installations and inspections',
    icon: Calendar,
    category: 'core',
  },
  measurements: {
    name: 'measurements',
    displayName: 'Measurements',
    description: 'Roof measurement data from Roofr or manual entry',
    icon: Table2,
    category: 'core',
  },
  pricing_tiers: {
    name: 'pricing_tiers',
    displayName: 'Pricing Tiers',
    description: 'Good/Better/Best package configuration',
    icon: CreditCard,
    category: 'config',
  },
  sms_consents: {
    name: 'sms_consents',
    displayName: 'SMS Consents',
    description: 'Customer SMS marketing consent records',
    icon: MessageSquare,
    category: 'events',
  },
  webhook_events: {
    name: 'webhook_events',
    displayName: 'Webhook Events',
    description: 'Incoming webhook payloads',
    icon: Database,
    category: 'events',
  },
  feedback: {
    name: 'feedback',
    displayName: 'Feedback',
    description: 'User feedback submissions',
    icon: MessageSquare,
    category: 'dev',
  },
  dev_tasks: {
    name: 'dev_tasks',
    displayName: 'Dev Tasks',
    description: 'Development task tracking',
    icon: FileText,
    category: 'dev',
  },
  dev_notes: {
    name: 'dev_notes',
    displayName: 'Dev Notes',
    description: 'Development notes',
    icon: FileText,
    category: 'dev',
  },
};

const CATEGORY_LABELS = {
  core: 'Core Business',
  config: 'Configuration',
  events: 'Event Logs',
  dev: 'Development',
};

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTableCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tables');
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();

      const enrichedTables: TableInfo[] = Object.entries(data.tables).map(
        ([name, count]) => ({
          ...TABLE_METADATA[name],
          name,
          recordCount: count as number,
        })
      ).filter(t => t.displayName);

      setTables(enrichedTables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableCounts();
  }, []);

  const groupedTables = tables.reduce((acc, table) => {
    const category = table.category || 'core';
    if (!acc[category]) acc[category] = [];
    acc[category].push(table);
    return acc;
  }, {} as Record<string, TableInfo[]>);

  const totalRecords = tables.reduce((sum, t) => sum + t.recordCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={20} className="text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold">Database</h1>
            <p className="text-sm text-muted-foreground">
              Manage application data
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTableCounts} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="ml-1">Refresh</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">PostgreSQL</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={20} className="animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading tables...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {(['core', 'config', 'events', 'dev'] as const).map((category) => {
            const categoryTables = groupedTables[category] || [];
            if (categoryTables.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTables.map((table) => (
                    <Link key={table.name} href={`/admin/database/${table.name}`}>
                      <Card className="h-full transition-colors hover:bg-accent/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <table.icon size={16} className="text-muted-foreground" />
                              <CardTitle className="text-sm font-medium">
                                {table.displayName}
                              </CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {table.recordCount}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-xs">
                            {table.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-yellow-600" />
        <div className="text-yellow-800 dark:text-yellow-200">
          <strong>Caution:</strong> Editing data here directly affects the live application.
        </div>
      </div>
    </div>
  );
}
