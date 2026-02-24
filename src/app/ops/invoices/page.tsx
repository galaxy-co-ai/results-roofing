'use client';

import { useState, useMemo } from 'react';
import { Search, MoreHorizontal, ArrowUpDown, AlertCircle, Eye, Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody,
} from '@/components/ui/dialog';
import { useOpsInvoices, useUpdateInvoiceStatus } from '@/hooks/ops/use-ops-queries';
import { useToast } from '@/components/ui/Toast';
import type { OpsInvoice, OrderStatus } from '@/types/ops';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  deposit_paid: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
};

const STATUSES: (OrderStatus | 'all')[] = [
  'all', 'pending', 'deposit_paid', 'scheduled', 'in_progress', 'completed', 'cancelled', 'refunded',
];

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewInvoice, setViewInvoice] = useState<OpsInvoice | null>(null);
  const [voidTarget, setVoidTarget] = useState<OpsInvoice | null>(null);

  const { data, isLoading, refetch } = useOpsInvoices(statusFilter, search || undefined);
  const updateStatus = useUpdateInvoiceStatus();
  const { success, error: toastError } = useToast();

  const invoices = data?.invoices ?? [];
  const stats = data?.stats ?? { totalInvoiced: 0, outstanding: 0, paid: 0 };

  const sorted = useMemo(() => {
    return [...invoices].sort((a, b) => sortDir === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice);
  }, [invoices, sortDir]);

  const overdueCount = invoices.filter(i =>
    !['completed', 'cancelled', 'refunded'].includes(i.status) &&
    i.scheduledStartDate &&
    new Date(i.scheduledStartDate) < new Date()
  ).length;

  function handleMarkPaid(inv: OpsInvoice) {
    updateStatus.mutate(
      { invoiceId: inv.id, status: 'completed' },
      {
        onSuccess: () => success('Invoice marked as paid'),
        onError: (err) => toastError('Failed to update', err.message),
      }
    );
  }

  function handleVoid() {
    if (!voidTarget) return;
    updateStatus.mutate(
      { invoiceId: voidTarget.id, status: 'cancelled' },
      {
        onSuccess: () => {
          success('Invoice voided');
          setVoidTarget(null);
        },
        onError: (err) => toastError('Failed to void', err.message),
      }
    );
  }

  function handleExportCSV() {
    const headers = ['Confirmation #', 'Customer', 'Total', 'Balance Due', 'Status', 'Tier', 'Financing', 'Created'];
    const rows = invoices.map(i => [
      i.confirmationNumber,
      i.customerName || '\u2014',
      `$${i.totalPrice}`,
      `$${i.balanceDue}`,
      i.status,
      i.selectedTier,
      i.financingUsed || 'none',
      formatDate(i.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'invoices.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${invoices.length} orders \u00B7 $${stats.totalInvoiced.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={isLoading || invoices.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {isLoading ? '\u2014' : `$${stats.totalInvoiced.toLocaleString()}`}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {isLoading ? '\u2014' : `$${stats.outstanding.toLocaleString()}`}
          </p>
        </CardContent></Card>
        <Card className={overdueCount > 0 ? 'border-red-200' : ''}><CardContent className="p-4">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider flex items-center gap-1">
            {overdueCount > 0 && <AlertCircle className="h-3 w-3" />}
            Overdue
          </p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-red-600">
            {isLoading ? '\u2014' : overdueCount}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-green-600">
            {isLoading ? '\u2014' : `$${stats.paid.toLocaleString()}`}
          </p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {statusFilter === 'all' ? 'Status' : statusLabel(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUSES.map(s => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All Statuses' : statusLabel(s)}
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
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">{invoices.length === 0 ? 'No orders yet' : 'No orders match your filter'}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">
                    <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      Total <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((inv) => {
                  const isTerminal = ['completed', 'cancelled', 'refunded'].includes(inv.status);
                  return (
                    <TableRow key={inv.id} className="cursor-pointer" onClick={() => setViewInvoice(inv)}>
                      <TableCell className="font-medium text-primary">{inv.confirmationNumber}</TableCell>
                      <TableCell className="font-medium">{inv.customerName || '\u2014'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{inv.propertyAddress}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">${inv.totalPrice.toLocaleString()}</TableCell>
                      <TableCell className={`text-right tabular-nums ${inv.balanceDue > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                        {inv.balanceDue > 0 ? `$${inv.balanceDue.toLocaleString()}` : '\u2014'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[inv.status] || STATUS_STYLES.pending}`}>
                          {statusLabel(inv.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs capitalize">{inv.selectedTier}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewInvoice(inv); }}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {!isTerminal && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleMarkPaid(inv); }}>
                                  <CheckCircle className="h-4 w-4 mr-2" /> Mark Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(ev) => { ev.stopPropagation(); setVoidTarget(inv); }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" /> Void Invoice
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>{sorted.length} of {invoices.length} orders</span>
            </div>
          </>
        )}
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order {viewInvoice?.confirmationNumber}</DialogTitle></DialogHeader>
          {viewInvoice && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewInvoice.customerName || '\u2014'}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewInvoice.customerEmail}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Property</p><p className="font-medium">{viewInvoice.propertyAddress}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium tabular-nums">${viewInvoice.totalPrice.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Deposit</p><p className="font-medium tabular-nums">${viewInvoice.depositAmount.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Balance Due</p><p className="font-medium tabular-nums">${viewInvoice.balanceDue.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Paid</p><p className="font-medium tabular-nums text-green-600">${viewInvoice.paidAmount.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewInvoice.status] || STATUS_STYLES.pending}`}>{statusLabel(viewInvoice.status)}</span></div>
                <div><p className="text-xs text-muted-foreground">Tier</p><p className="font-medium capitalize">{viewInvoice.selectedTier}</p></div>
                <div><p className="text-xs text-muted-foreground">Financing</p><p className="font-medium">{viewInvoice.financingUsed || 'None'}</p></div>
                <div><p className="text-xs text-muted-foreground">Scheduled</p><p className="font-medium">{formatDate(viewInvoice.scheduledStartDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewInvoice.createdAt)}</p></div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInvoice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <Dialog open={!!voidTarget} onOpenChange={() => setVoidTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to void invoice {voidTarget?.confirmationNumber}? This will cancel the order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Voiding...' : 'Void Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
