'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Eye, Trash2, Send, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import {
  useOpsMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial,
} from '@/hooks/ops/use-ops-queries';
import type { MaterialOrder } from '@/types/ops';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const STATUSES = ['all', 'draft', 'sent', 'confirmed', 'delivered', 'cancelled'];
const SUPPLIERS = ['all', 'ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'];

export default function MaterialsPage() {
  const { success, error: showError } = useToast();
  const { data: orders = [], isLoading, refetch } = useOpsMaterials();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState<MaterialOrder | null>(null);

  // Form state
  const [formJob, setFormJob] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formTotal, setFormTotal] = useState('');

  async function handleRefresh() {
    try {
      await refetch();
      success('Refreshed');
    } catch {
      showError('Failed to refresh');
    }
  }

  const filtered = useMemo(() => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.job.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (supplierFilter !== 'all') result = result.filter(o => o.supplier === supplierFilter);
    result = [...result].sort((a, b) => sortDir === 'asc' ? Number(a.total) - Number(b.total) : Number(b.total) - Number(a.total));
    return result;
  }, [orders, search, statusFilter, supplierFilter, sortDir]);

  const totalSpend = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter(o => ['draft', 'sent', 'confirmed'].includes(o.status));

  async function handleCreate() {
    if (!formJob.trim() || !formSupplier.trim() || !formTotal.trim()) return;
    try {
      await createMaterial.mutateAsync({
        job: formJob.trim(),
        supplier: formSupplier.trim(),
        total: formTotal.trim(),
      });
      setShowNewDialog(false);
      setFormJob(''); setFormSupplier(''); setFormTotal('');
      success('Order created', `Material order for ${formJob.trim()}`);
    } catch {
      // Error handled by mutation
    }
  }

  async function handleSendOrder(order: MaterialOrder) {
    try {
      await updateMaterial.mutateAsync({
        id: order.id,
        status: 'sent',
        orderedAt: new Date().toISOString(),
      });
      success('Order sent', `${order.id.slice(0, 8)} sent to ${order.supplier}`);
    } catch {
      // Error handled by mutation
    }
  }

  async function handleDelete(order: MaterialOrder) {
    try {
      await deleteMaterial.mutateAsync(order.id);
      setViewOrder(null);
      success('Order deleted', `Order removed`);
    } catch {
      // Error handled by mutation
    }
  }

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Material Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${orders.length} orders · $${totalSpend.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setFormJob(''); setFormSupplier(''); setFormTotal(''); setShowNewDialog(true); }}>
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spend</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : `$${totalSpend.toLocaleString()}`}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Orders</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : pendingOrders.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : orders.filter(o => o.status === 'delivered').length}</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">No material orders yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Create your first material order to start tracking suppliers and deliveries.
            </p>
            <Button size="sm" className="mt-4 gap-2" onClick={() => { setFormJob(''); setFormSupplier(''); setFormTotal(''); setShowNewDialog(true); }}>
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {supplierFilter === 'all' ? 'Supplier' : supplierFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SUPPLIERS.map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSupplierFilter(s)}>
                    {s === 'all' ? 'All Suppliers' : s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">
                    <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      Total <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => setViewOrder(o)}>
                    <TableCell className="font-medium text-primary">{o.id.slice(0, 8)}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{o.job}</TableCell>
                    <TableCell className="text-muted-foreground">{o.supplier}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">${Number(o.total).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[o.status]}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(o.orderedAt)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(o.deliveryAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewOrder(o); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {o.status === 'draft' && (
                            <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleSendOrder(o); }}>
                              <Send className="h-4 w-4 mr-2" /> Send to Supplier
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(o); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders match your search</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {orders.length}</span>
            </div>
          </Card>
        </>
      )}

      {/* New Order Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Material Order</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Job Address</Label>
              <Input value={formJob} onChange={e => setFormJob(e.target.value)} placeholder="445 Elm St, Denver" />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={formSupplier} onChange={e => setFormSupplier(e.target.value)} placeholder="ABC Supply Co." />
            </div>
            <div className="space-y-2">
              <Label>Total ($)</Label>
              <Input type="number" value={formTotal} onChange={e => setFormTotal(e.target.value)} placeholder="4200" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!formJob.trim() || !formSupplier.trim() || !formTotal.trim() || createMaterial.isPending}
            >
              {createMaterial.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order {viewOrder?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {viewOrder && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Job</p><p className="font-medium">{viewOrder.job}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{viewOrder.supplier}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium tabular-nums">${Number(viewOrder.total).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewOrder.status]}`}>{viewOrder.status.charAt(0).toUpperCase() + viewOrder.status.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Ordered</p><p className="font-medium">{formatDate(viewOrder.orderedAt)}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery</p><p className="font-medium">{formatDate(viewOrder.deliveryAt)}</p></div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            {viewOrder?.status === 'draft' && (
              <Button variant="outline" onClick={() => { handleSendOrder(viewOrder!); setViewOrder(null); }}>
                <Send className="h-4 w-4 mr-2" /> Send Order
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => viewOrder && handleDelete(viewOrder)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
