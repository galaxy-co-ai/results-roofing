'use client';

import { useState, useMemo } from 'react';
import { Search, MoreHorizontal, ArrowUpDown, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Payment {
  id: string;
  date: string;
  customer: string;
  invoice: string;
  amount: number;
  method: string;
  payStatus: string;
  fundStatus: string;
}

const INITIAL_PAYMENTS: Payment[] = [
  { id: '1', date: 'Feb 10, 2026', customer: 'Mike Torres', invoice: 'INV-2042', amount: 6000, method: 'Credit Card', payStatus: 'approved', fundStatus: 'funded' },
  { id: '2', date: 'Feb 8, 2026', customer: 'Maria Lopez', invoice: 'INV-2041', amount: 7500, method: 'ACH', payStatus: 'approved', fundStatus: 'pending' },
  { id: '3', date: 'Feb 5, 2026', customer: 'James Wilson', invoice: 'INV-2037', amount: 22100, method: 'Check', payStatus: 'approved', fundStatus: 'funded' },
  { id: '4', date: 'Feb 2, 2026', customer: 'Lisa Brown', invoice: 'INV-2036', amount: 17000, method: 'Credit Card', payStatus: 'approved', fundStatus: 'funded' },
  { id: '5', date: 'Jan 28, 2026', customer: 'Robert Chen', invoice: 'INV-2035', amount: 8500, method: 'Credit Card', payStatus: 'failed', fundStatus: '—' },
  { id: '6', date: 'Jan 25, 2026', customer: 'Amanda White', invoice: 'INV-2034', amount: 12000, method: 'ACH', payStatus: 'approved', fundStatus: 'funded' },
  { id: '7', date: 'Jan 20, 2026', customer: 'John Davis', invoice: 'INV-2033', amount: 15000, method: 'Credit Card', payStatus: 'refunded', fundStatus: '—' },
];

const PAY_STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
};

const FUND_STATUS_STYLES: Record<string, string> = {
  funded: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  '—': '',
};

const PAY_STATUSES = ['all', 'approved', 'pending', 'failed', 'refunded'];
const METHODS = ['all', 'Credit Card', 'ACH', 'Check'];

export default function PaymentsPage() {
  const { success } = useToast();
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);

  const filtered = useMemo(() => {
    let result = payments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.customer.toLowerCase().includes(q) ||
        p.invoice.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(p => p.payStatus === statusFilter);
    if (methodFilter !== 'all') result = result.filter(p => p.method === methodFilter);
    result = [...result].sort((a, b) => sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount);
    return result;
  }, [payments, search, statusFilter, methodFilter, sortDir]);

  const approvedPayments = payments.filter(p => p.payStatus === 'approved');
  const totalReceived = approvedPayments.reduce((s, p) => s + p.amount, 0);
  const failedTotal = payments.filter(p => p.payStatus === 'failed').reduce((s, p) => s + p.amount, 0);
  function handleDelete(p: Payment) {
    setPayments(prev => prev.filter(pay => pay.id !== p.id));
    setViewPayment(null);
    success('Payment removed', `Payment from ${p.customer} removed`);
  }

  function handleExportCSV() {
    const headers = ['Date', 'Customer', 'Invoice', 'Amount', 'Method', 'Payment Status', 'Funding'];
    const rows = payments.map(p => [p.date, p.customer, p.invoice, `$${p.amount}`, p.method, p.payStatus, p.fundStatus]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
    success('CSV exported', `${payments.length} payments exported`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track all payment activity</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Received</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-green-600">${totalReceived.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Funding</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${payments.filter(p => p.fundStatus === 'pending').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-red-600">${failedTotal.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Transaction</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${approvedPayments.length ? Math.round(totalReceived / approvedPayments.length).toLocaleString() : '0'}</p>
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
              {methodFilter === 'all' ? 'Method' : methodFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {METHODS.map(m => (
              <DropdownMenuItem key={m} onClick={() => setMethodFilter(m)}>
                {m === 'all' ? 'All Methods' : m}
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
            {PAY_STATUSES.map(s => (
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
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Funding</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setViewPayment(p)}>
                <TableCell className="text-muted-foreground text-xs">{p.date}</TableCell>
                <TableCell className="font-medium">{p.customer}</TableCell>
                <TableCell className="text-primary font-medium">{p.invoice}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">${p.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{p.method}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${PAY_STATUS_STYLES[p.payStatus]}`}>
                    {p.payStatus.charAt(0).toUpperCase() + p.payStatus.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {p.fundStatus !== '—' ? (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${FUND_STATUS_STYLES[p.fundStatus]}`}>
                      {p.fundStatus.charAt(0).toUpperCase() + p.fundStatus.slice(1)}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(p); }}>
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payments match your search</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {payments.length}</span>
        </div>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
          {viewPayment && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewPayment.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Invoice</p><p className="font-medium text-primary">{viewPayment.invoice}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium tabular-nums">${viewPayment.amount.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{viewPayment.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Method</p><p className="font-medium">{viewPayment.method}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${PAY_STATUS_STYLES[viewPayment.payStatus]}`}>{viewPayment.payStatus.charAt(0).toUpperCase() + viewPayment.payStatus.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Funding</p><p className="font-medium">{viewPayment.fundStatus}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
