'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, AlertCircle, Eye, Trash2, Download, Send, Copy } from 'lucide-react';
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

interface Invoice {
  id: string;
  customer: string;
  job: string;
  amount: number;
  status: string;
  due: string;
  method: string;
  paid?: number;
}

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-2042', customer: 'Mike Torres', job: 'Job #1036', amount: 6000, status: 'paid', due: 'Feb 15, 2026', method: 'Credit Card' },
  { id: 'INV-2041', customer: 'Maria Lopez', job: 'Job #1030', amount: 15000, status: 'partial', due: 'Feb 20, 2026', method: 'ACH', paid: 7500 },
  { id: 'INV-2040', customer: 'John Davis', job: 'Job #1042', amount: 18500, status: 'sent', due: 'Feb 28, 2026', method: '—' },
  { id: 'INV-2039', customer: 'Sarah Miller', job: 'Job #1038', amount: 19000, status: 'draft', due: '—', method: '—' },
  { id: 'INV-2038', customer: 'Robert Chen', job: 'Job #1025', amount: 18500, status: 'overdue', due: 'Jan 31, 2026', method: '—' },
  { id: 'INV-2037', customer: 'James Wilson', job: 'Job #1020', amount: 22100, status: 'paid', due: 'Jan 15, 2026', method: 'Check' },
  { id: 'INV-2036', customer: 'Lisa Brown', job: 'Job #1018', amount: 17000, status: 'paid', due: 'Jan 10, 2026', method: 'Credit Card' },
];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
};

const STATUSES = ['all', 'draft', 'sent', 'paid', 'partial', 'overdue'];

export default function InvoicesPage() {
  const { success } = useToast();
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Form state
  const [formCustomer, setFormCustomer] = useState('');
  const [formJob, setFormJob] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDue, setFormDue] = useState('');

  const filtered = useMemo(() => {
    let result = invoices;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.id.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q) ||
        i.job.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }
    result = [...result].sort((a, b) => sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount);
    return result;
  }, [invoices, search, statusFilter, sortDir]);

  const outstanding = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status));
  const outstandingTotal = outstanding.reduce((s, i) => {
    if (i.status === 'partial') return s + i.amount - (i.paid || 0);
    return s + i.amount;
  }, 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  function handleCreate() {
    if (!formCustomer.trim() || !formAmount.trim()) return;
    const nextNum = Math.max(...invoices.map(i => parseInt(i.id.split('-')[1]))) + 1;
    const newInv: Invoice = {
      id: `INV-${nextNum}`,
      customer: formCustomer.trim(),
      job: formJob.trim() || '—',
      amount: parseInt(formAmount),
      status: 'draft',
      due: formDue.trim() || '—',
      method: '—',
    };
    setInvoices(prev => [newInv, ...prev]);
    setShowNewDialog(false);
    setFormCustomer(''); setFormJob(''); setFormAmount(''); setFormDue('');
    success('Invoice created', `${newInv.id} for ${newInv.customer}`);
  }

  function handleSend(inv: Invoice) {
    setInvoices(prev => prev.map(i =>
      i.id === inv.id ? { ...i, status: 'sent' } : i
    ));
    success('Invoice sent', `${inv.id} sent to ${inv.customer}`);
  }

  function handleMarkPaid(inv: Invoice) {
    setInvoices(prev => prev.map(i =>
      i.id === inv.id ? { ...i, status: 'paid', method: 'Manual', paid: i.amount } : i
    ));
    success('Invoice paid', `${inv.id} marked as paid`);
  }

  function handleDelete(inv: Invoice) {
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
    setViewInvoice(null);
    success('Invoice deleted', `${inv.id} removed`);
  }

  function handleExportCSV() {
    const headers = ['Invoice #', 'Customer', 'Job', 'Amount', 'Status', 'Due Date', 'Method'];
    const rows = invoices.map(i => [i.id, i.customer, i.job, `$${i.amount}`, i.status, i.due, i.method]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'invoices.csv'; a.click();
    URL.revokeObjectURL(url);
    success('CSV exported', `${invoices.length} invoices exported`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage billing and invoices</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setFormCustomer(''); setFormJob(''); setFormAmount(''); setFormDue(''); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${outstandingTotal.toLocaleString()}</p>
        </CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" />Overdue</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-red-600">${overdueTotal.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-green-600">${paidTotal.toLocaleString()}</p>
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
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Job</TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer" onClick={() => setViewInvoice(inv)}>
                <TableCell className="font-medium text-primary">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.customer}</TableCell>
                <TableCell className="text-muted-foreground">{inv.job}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">${inv.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[inv.status]}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className={`text-xs ${inv.status === 'overdue' ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {inv.due}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{inv.method}</TableCell>
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
                      {inv.status === 'draft' && (
                        <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleSend(inv); }}>
                          <Send className="h-4 w-4 mr-2" /> Send to Customer
                        </DropdownMenuItem>
                      )}
                      {['sent', 'partial', 'overdue'].includes(inv.status) && (
                        <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleMarkPaid(inv); }}>
                          <Copy className="h-4 w-4 mr-2" /> Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(inv); }}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices match your search</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {invoices.length}</span>
        </div>
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={formCustomer} onChange={e => setFormCustomer(e.target.value)} placeholder="John Davis" />
            </div>
            <div className="space-y-2">
              <Label>Job Reference</Label>
              <Input value={formJob} onChange={e => setFormJob(e.target.value)} placeholder="Job #1042" />
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="18500" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input value={formDue} onChange={e => setFormDue(e.target.value)} placeholder="Feb 28, 2026" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formCustomer.trim() || !formAmount.trim()}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invoice {viewInvoice?.id}</DialogTitle></DialogHeader>
          {viewInvoice && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewInvoice.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Job</p><p className="font-medium">{viewInvoice.job}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium tabular-nums">${viewInvoice.amount.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[viewInvoice.status]}`}>{viewInvoice.status.charAt(0).toUpperCase() + viewInvoice.status.slice(1)}</span></div>
                <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium">{viewInvoice.due}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment Method</p><p className="font-medium">{viewInvoice.method}</p></div>
                {viewInvoice.paid !== undefined && (
                  <div><p className="text-xs text-muted-foreground">Amount Paid</p><p className="font-medium tabular-nums text-green-600">${viewInvoice.paid.toLocaleString()}</p></div>
                )}
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            {viewInvoice?.status === 'draft' && (
              <Button variant="outline" onClick={() => { handleSend(viewInvoice!); setViewInvoice(null); }}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            )}
            {viewInvoice && ['sent', 'partial', 'overdue'].includes(viewInvoice.status) && (
              <Button variant="outline" onClick={() => { handleMarkPaid(viewInvoice!); setViewInvoice(null); }}>Mark as Paid</Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => viewInvoice && handleDelete(viewInvoice)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
