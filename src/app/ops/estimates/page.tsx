'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Eye, Trash2, Send, Copy } from 'lucide-react';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';

interface Estimate {
  id: string;
  customer: string;
  address: string;
  amount: number;
  status: string;
  created: string;
  sent: string | null;
  signed: string | null;
}

const INITIAL_ESTIMATES: Estimate[] = [
  { id: 'EST-1042', customer: 'John Davis', address: '2187 Herndon Ave, Clovis, CA', amount: 18500, status: 'sent', created: 'Feb 8, 2026', sent: 'Feb 9, 2026', signed: null },
  { id: 'EST-1041', customer: 'Sarah Miller', address: '1 Carriage Dr, Kansas City, MO', amount: 19000, status: 'viewed', created: 'Feb 7, 2026', sent: 'Feb 8, 2026', signed: null },
  { id: 'EST-1040', customer: 'Mike Torres', address: '2726 Askew Ave, Kansas City, MO', amount: 6000, status: 'signed', created: 'Feb 5, 2026', sent: 'Feb 5, 2026', signed: 'Feb 6, 2026' },
  { id: 'EST-1039', customer: 'Maria Lopez', address: '9 Sugar Bowl Ln, Gulf Breeze, FL', amount: 27000, status: 'sent', created: 'Feb 3, 2026', sent: 'Feb 4, 2026', signed: null },
  { id: 'EST-1038', customer: 'Robert Chen', address: '445 Elm Street, Denver, CO', amount: 15000, status: 'signed', created: 'Jan 28, 2026', sent: 'Jan 29, 2026', signed: 'Jan 30, 2026' },
  { id: 'EST-1037', customer: 'Amanda White', address: '214 N 3rd St, River Falls, WI', amount: 22000, status: 'draft', created: 'Feb 10, 2026', sent: null, signed: null },
  { id: 'EST-1036', customer: 'James Wilson', address: '1220 Maple Ave, Austin, TX', amount: 18500, status: 'expired', created: 'Jan 15, 2026', sent: 'Jan 16, 2026', signed: null },
  { id: 'EST-1035', customer: 'Lisa Brown', address: '13790 Marine Dr, White Rock, BC', amount: 17000, status: 'rejected', created: 'Jan 20, 2026', sent: 'Jan 21, 2026', signed: null },
];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  viewed: 'bg-purple-50 text-purple-700 border-purple-200',
  signed: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-amber-50 text-amber-700 border-amber-200',
};

const STATUSES = ['all', 'draft', 'sent', 'viewed', 'signed', 'rejected', 'expired'];

export default function EstimatesPage() {
  const { success } = useToast();
  const [estimates, setEstimates] = useState(INITIAL_ESTIMATES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewEstimate, setViewEstimate] = useState<Estimate | null>(null);

  // Form state
  const [formCustomer, setFormCustomer] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const filtered = useMemo(() => {
    let result = estimates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.customer.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    result = [...result].sort((a, b) => sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount);
    return result;
  }, [estimates, search, statusFilter, sortDir]);

  const totalAmount = estimates.reduce((s, e) => s + e.amount, 0);
  const signed = estimates.filter(e => e.status === 'signed');
  const pending = estimates.filter(e => ['sent', 'viewed'].includes(e.status));

  function handleCreate() {
    if (!formCustomer.trim() || !formAddress.trim() || !formAmount.trim()) return;
    const nextNum = Math.max(...estimates.map(e => parseInt(e.id.split('-')[1]))) + 1;
    const newEst: Estimate = {
      id: `EST-${nextNum}`,
      customer: formCustomer.trim(),
      address: formAddress.trim(),
      amount: parseInt(formAmount),
      status: 'draft',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sent: null,
      signed: null,
    };
    setEstimates(prev => [newEst, ...prev]);
    setShowNewDialog(false);
    setFormCustomer(''); setFormAddress(''); setFormAmount('');
    success('Estimate created', `${newEst.id} for ${newEst.customer}`);
  }

  function handleSendEstimate(est: Estimate) {
    setEstimates(prev => prev.map(e =>
      e.id === est.id ? { ...e, status: 'sent', sent: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : e
    ));
    success('Estimate sent', `${est.id} sent to ${est.customer}`);
  }

  function handleDuplicate(est: Estimate) {
    const nextNum = Math.max(...estimates.map(e => parseInt(e.id.split('-')[1]))) + 1;
    const dup: Estimate = { ...est, id: `EST-${nextNum}`, status: 'draft', sent: null, signed: null, created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    setEstimates(prev => [dup, ...prev]);
    success('Estimate duplicated', `${dup.id} created from ${est.id}`);
  }

  function handleDelete(est: Estimate) {
    setEstimates(prev => prev.filter(e => e.id !== est.id));
    setViewEstimate(null);
    success('Estimate deleted', `${est.id} removed`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Estimates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Proposals and estimates for all jobs</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setFormCustomer(''); setFormAddress(''); setFormAmount(''); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4" />
          New Estimate
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Estimates</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{estimates.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${totalAmount.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signed</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{signed.length}</p>
          <p className="text-xs text-green-600 mt-0.5">${signed.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{pending.length}</p>
          <p className="text-xs text-blue-600 mt-0.5">${pending.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Signed</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="cursor-pointer" onClick={() => setViewEstimate(e)}>
                <TableCell className="font-medium text-primary">{e.id}</TableCell>
                <TableCell className="font-medium">{e.customer}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{e.address}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">${e.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[e.status]}`}>
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{e.created}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{e.sent || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{e.signed || '—'}</TableCell>
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
                      {e.status === 'draft' && (
                        <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleSendEstimate(e); }}>
                          <Send className="h-4 w-4 mr-2" /> Send to Customer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleDuplicate(e); }}>
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(e); }}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No estimates match your search</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {estimates.length}</span>
        </div>
      </Card>

      {/* New Estimate Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Estimate</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={formCustomer} onChange={e => setFormCustomer(e.target.value)} placeholder="John Davis" />
            </div>
            <div className="space-y-2">
              <Label>Property Address</Label>
              <Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="123 Main St, City, ST" />
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="18500" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formCustomer.trim() || !formAddress.trim() || !formAmount.trim()}>Create Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Estimate Dialog */}
      <Dialog open={!!viewEstimate} onOpenChange={() => setViewEstimate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Estimate {viewEstimate?.id}</DialogTitle></DialogHeader>
          {viewEstimate && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewEstimate.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium tabular-nums">${viewEstimate.amount.toLocaleString()}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{viewEstimate.address}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewEstimate.status]}`}>{viewEstimate.status.charAt(0).toUpperCase() + viewEstimate.status.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{viewEstimate.created}</p></div>
                <div><p className="text-xs text-muted-foreground">Sent</p><p className="font-medium">{viewEstimate.sent || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Signed</p><p className="font-medium">{viewEstimate.signed || '—'}</p></div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            {viewEstimate?.status === 'draft' && (
              <Button variant="outline" onClick={() => { handleSendEstimate(viewEstimate!); setViewEstimate(null); }}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            )}
            <Button variant="outline" onClick={() => { handleDuplicate(viewEstimate!); setViewEstimate(null); }}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(viewEstimate!)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
