'use client';

import { useState, useMemo } from 'react';
import { Search, MoreHorizontal, ArrowUpDown, Eye, RefreshCw, Archive, Trash2 } from 'lucide-react';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useOpsEstimates, useUpdateEstimateStatus, useDeleteEstimate } from '@/hooks/ops/use-ops-queries';
import { useToast } from '@/components/ui/Toast';
import { DocumentPreview } from '@/components/features/ops/DocumentPreview';
import type { OpsEstimate, QuoteStatus } from '@/types/ops';

const STATUS_STYLES: Record<string, string> = {
  preliminary: 'bg-muted text-muted-foreground',
  measured: 'bg-blue-50 text-blue-700 border-blue-200',
  selected: 'bg-purple-50 text-purple-700 border-purple-200',
  financed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  signed: 'bg-green-50 text-green-700 border-green-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUSES: (QuoteStatus | 'all')[] = ['all', 'preliminary', 'measured', 'selected', 'financed', 'scheduled', 'signed', 'converted'];

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(val: number | null | undefined) {
  if (val == null) return '\u2014';
  return `$${val.toLocaleString()}`;
}

export default function EstimatesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewEstimate, setViewEstimate] = useState<OpsEstimate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OpsEstimate | null>(null);

  const { data: estimates = [], isLoading, refetch } = useOpsEstimates(statusFilter, search || undefined);
  const updateStatus = useUpdateEstimateStatus();
  const deleteEstimate = useDeleteEstimate();
  const { success, error: toastError } = useToast();

  async function handleRefresh() {
    try {
      await refetch();
      success('Refreshed');
    } catch {
      toastError('Failed to refresh');
    }
  }

  const sorted = useMemo(() => {
    return [...estimates].sort((a, b) => {
      const va = a.totalPrice ?? 0;
      const vb = b.totalPrice ?? 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [estimates, sortDir]);

  const totalValue = estimates.reduce((s, e) => s + (e.totalPrice ?? 0), 0);
  const signed = estimates.filter(e => e.status === 'signed' || e.status === 'converted');
  const signedValue = signed.reduce((s, e) => s + (e.totalPrice ?? 0), 0);
  const active = estimates.filter(e => ['measured', 'selected', 'financed', 'scheduled'].includes(e.status));
  const activeValue = active.reduce((s, e) => s + (e.totalPrice ?? 0), 0);

  function handleArchive(e: OpsEstimate) {
    updateStatus.mutate(
      { estimateId: e.id, status: 'converted' },
      {
        onSuccess: () => success('Estimate archived'),
        onError: (err) => toastError('Failed to archive', err.message),
      }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteEstimate.mutate(deleteTarget.id, {
      onSuccess: () => {
        success('Estimate deleted');
        setDeleteTarget(null);
      },
      onError: (err) => toastError('Failed to delete', err.message),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Estimates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${estimates.length} quotes \u00B7 ${formatCurrency(totalValue)} total`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Quotes</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : estimates.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : formatCurrency(totalValue)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signed / Converted</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : signed.length}</p>
          {!isLoading && signedValue > 0 && <p className="text-xs text-green-600 mt-0.5">{formatCurrency(signedValue)}</p>}
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Pipeline</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : active.length}</p>
          {!isLoading && activeValue > 0 && <p className="text-xs text-blue-600 mt-0.5">{formatCurrency(activeValue)}</p>}
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search estimates..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">{estimates.length === 0 ? 'No quotes yet' : 'No quotes match your filter'}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">
                    <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => setViewEstimate(e)}>
                    <TableCell className="font-medium">{e.customer}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{e.address}, {e.city}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(e.totalPrice)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[e.status] || STATUS_STYLES.preliminary}`}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs capitalize">{e.selectedTier || '\u2014'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(e.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewEstimate(e); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {e.status !== 'converted' && (
                            <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleArchive(e); }}>
                              <Archive className="h-4 w-4 mr-2" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(ev) => { ev.stopPropagation(); setDeleteTarget(e); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>{sorted.length} of {estimates.length} quotes</span>
            </div>
          </>
        )}
      </Card>

      {/* Estimate Document Preview */}
      <Dialog open={!!viewEstimate} onOpenChange={() => setViewEstimate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {viewEstimate && (
            <DocumentPreview
              type="estimate"
              data={{
                id: viewEstimate.id,
                customer: viewEstimate.customer,
                propertyAddress: viewEstimate.address,
                city: viewEstimate.city,
                state: viewEstimate.state,
                zip: viewEstimate.zip,
                sqftTotal: viewEstimate.sqftTotal,
                selectedTier2: viewEstimate.selectedTier,
                totalPrice: viewEstimate.totalPrice ?? 0,
                depositAmount: viewEstimate.depositAmount ?? undefined,
                expiresAt: viewEstimate.expiresAt,
                status: viewEstimate.status,
                createdAt: viewEstimate.createdAt,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Estimate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this estimate for {deleteTarget?.customer}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEstimate.isPending}
            >
              {deleteEstimate.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
