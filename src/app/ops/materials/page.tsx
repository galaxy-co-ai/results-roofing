'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Eye, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';

interface Order {
  id: string;
  job: string;
  supplier: string;
  total: number;
  status: string;
  ordered: string;
  delivery: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: 'MO-1008', job: '445 Elm St, Denver', supplier: 'ABC Supply Co.', total: 4200, status: 'delivered', ordered: 'Feb 5, 2026', delivery: 'Feb 8, 2026' },
  { id: 'MO-1007', job: '2726 Askew Ave, KC', supplier: 'SRS Distribution', total: 3800, status: 'confirmed', ordered: 'Feb 7, 2026', delivery: 'Feb 12, 2026' },
  { id: 'MO-1006', job: '1220 Maple Ave, Austin', supplier: 'ABC Supply Co.', total: 5600, status: 'delivered', ordered: 'Jan 30, 2026', delivery: 'Feb 3, 2026' },
  { id: 'MO-1005', job: '9 Sugar Bowl Ln, FL', supplier: 'Beacon Roofing', total: 7200, status: 'sent', ordered: 'Feb 9, 2026', delivery: 'TBD' },
  { id: 'MO-1004', job: '13790 Marine Dr, BC', supplier: 'SRS Distribution', total: 4800, status: 'draft', ordered: '—', delivery: '—' },
  { id: 'MO-1003', job: '214 N 3rd St, WI', supplier: 'ABC Supply Co.', total: 3200, status: 'cancelled', ordered: 'Jan 22, 2026', delivery: '—' },
];

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
  const { success } = useToast();
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Form state
  const [formJob, setFormJob] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formTotal, setFormTotal] = useState('');

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
    result = [...result].sort((a, b) => sortDir === 'asc' ? a.total - b.total : b.total - a.total);
    return result;
  }, [orders, search, statusFilter, supplierFilter, sortDir]);

  const totalSpend = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => ['draft', 'sent', 'confirmed'].includes(o.status));

  function handleCreate() {
    if (!formJob.trim() || !formSupplier.trim() || !formTotal.trim()) return;
    const nextNum = Math.max(...orders.map(o => parseInt(o.id.split('-')[1]))) + 1;
    const newOrder: Order = {
      id: `MO-${nextNum}`,
      job: formJob.trim(),
      supplier: formSupplier.trim(),
      total: parseInt(formTotal),
      status: 'draft',
      ordered: '—',
      delivery: '—',
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowNewDialog(false);
    setFormJob(''); setFormSupplier(''); setFormTotal('');
    success('Order created', `${newOrder.id} for ${newOrder.job}`);
  }

  function handleSendOrder(order: Order) {
    setOrders(prev => prev.map(o =>
      o.id === order.id ? { ...o, status: 'sent', ordered: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : o
    ));
    success('Order sent', `${order.id} sent to ${order.supplier}`);
  }

  function handleDelete(order: Order) {
    setOrders(prev => prev.filter(o => o.id !== order.id));
    setViewOrder(null);
    success('Order deleted', `${order.id} removed`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Materials
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Material orders and supplier management</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setFormJob(''); setFormSupplier(''); setFormTotal(''); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spend</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${totalSpend.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Orders</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{pendingOrders.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{orders.filter(o => o.status === 'delivered').length}</p>
        </CardContent></Card>
      </div>

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
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setViewOrder(o)}>
                <TableCell className="font-medium text-primary">{o.id}</TableCell>
                <TableCell className="max-w-[180px] truncate">{o.job}</TableCell>
                <TableCell className="text-muted-foreground">{o.supplier}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">${o.total.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[o.status]}`}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{o.ordered}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{o.delivery}</TableCell>
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

      {/* New Order Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Material Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formJob.trim() || !formSupplier.trim() || !formTotal.trim()}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order {viewOrder?.id}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Job</p><p className="font-medium">{viewOrder.job}</p></div>
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{viewOrder.supplier}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium tabular-nums">${viewOrder.total.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewOrder.status]}`}>{viewOrder.status.charAt(0).toUpperCase() + viewOrder.status.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Ordered</p><p className="font-medium">{viewOrder.ordered}</p></div>
                <div><p className="text-xs text-muted-foreground">Delivery</p><p className="font-medium">{viewOrder.delivery}</p></div>
              </div>
            </div>
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
