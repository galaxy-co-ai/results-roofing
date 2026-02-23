'use client';

import { useState, useMemo } from 'react';
import { Search, MoreHorizontal, ArrowUpDown, Download, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '@/components/ui/dialog';
import { useOpsPayments } from '@/hooks/ops/use-ops-queries';
import type { OpsPayment } from '@/types/ops';

const STATUS_STYLES: Record<string, string> = {
  succeeded: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUSES = ['all', 'succeeded', 'pending', 'processing', 'failed', 'refunded'];
const METHODS = ['all', 'card', 'bank_transfer', 'financing'];

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function methodLabel(m: string | null) {
  if (!m) return '—';
  const map: Record<string, string> = { card: 'Credit Card', bank_transfer: 'ACH', financing: 'Financing' };
  return map[m] || m;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewPayment, setViewPayment] = useState<OpsPayment | null>(null);

  const { data, isLoading, refetch } = useOpsPayments(
    statusFilter !== 'all' ? statusFilter : undefined,
    methodFilter !== 'all' ? methodFilter : undefined,
    search || undefined,
  );

  const payments = data?.payments ?? [];
  const stats = data?.stats ?? { totalReceived: 0, pendingAmount: 0, failedAmount: 0 };

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount);
  }, [payments, sortDir]);

  const succeededPayments = payments.filter(p => p.status === 'succeeded');
  const avgTransaction = succeededPayments.length
    ? Math.round(stats.totalReceived / succeededPayments.length)
    : 0;

  function handleExportCSV() {
    const headers = ['Date', 'Customer', 'Invoice', 'Amount', 'Method', 'Status', 'Type'];
    const rows = payments.map(p => [
      formatDate(p.processedAt || p.createdAt),
      p.customerName || '—',
      p.confirmationNumber || '—',
      `$${p.amount}`,
      methodLabel(p.paymentMethod),
      p.status,
      p.type,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${payments.length} payments tracked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={isLoading || payments.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Received</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-green-600">
            {isLoading ? '—' : `$${stats.totalReceived.toLocaleString()}`}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {isLoading ? '—' : `$${stats.pendingAmount.toLocaleString()}`}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-red-600">
            {isLoading ? '—' : `$${stats.failedAmount.toLocaleString()}`}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Transaction</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {isLoading ? '—' : `$${avgTransaction.toLocaleString()}`}
          </p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by customer or invoice #..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {methodFilter === 'all' ? 'Method' : methodLabel(methodFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {METHODS.map(m => (
              <DropdownMenuItem key={m} onClick={() => setMethodFilter(m)}>
                {m === 'all' ? 'All Methods' : methodLabel(m)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUSES.map(s => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">{payments.length === 0 ? 'No payments recorded yet' : 'No payments match your filter'}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">
                    <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setViewPayment(p)}>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(p.processedAt || p.createdAt)}</TableCell>
                    <TableCell className="font-medium">{p.customerName || '—'}</TableCell>
                    <TableCell className="text-primary font-medium">{p.confirmationNumber || '—'}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">${p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{methodLabel(p.paymentMethod)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs capitalize">{p.type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewPayment(p); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>{sorted.length} payments</span>
            </div>
          </>
        )}
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
          {viewPayment && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewPayment.customerName || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Invoice</p><p className="font-medium text-primary">{viewPayment.confirmationNumber || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium tabular-nums">${viewPayment.amount.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(viewPayment.processedAt || viewPayment.createdAt)}</p></div>
                <div><p className="text-xs text-muted-foreground">Method</p><p className="font-medium">{methodLabel(viewPayment.paymentMethod)}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewPayment.status] || STATUS_STYLES.pending}`}>{viewPayment.status.charAt(0).toUpperCase() + viewPayment.status.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{viewPayment.type}</p></div>
                {viewPayment.cardBrand && viewPayment.cardLast4 && (
                  <div><p className="text-xs text-muted-foreground">Card</p><p className="font-medium">{viewPayment.cardBrand} ···· {viewPayment.cardLast4}</p></div>
                )}
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
