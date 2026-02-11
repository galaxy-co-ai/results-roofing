'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobs: number;
  ltv: number;
  lastActivity: string;
  source: string;
  status: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Davis', email: 'john.davis@email.com', phone: '(816) 555-0142', jobs: 2, ltv: 31500, lastActivity: '2 hours ago', source: 'Website', status: 'active' },
  { id: '2', name: 'Sarah Miller', email: 'sarah.m@email.com', phone: '(913) 555-0198', jobs: 1, ltv: 18200, lastActivity: '15 min ago', source: 'Referral', status: 'active' },
  { id: '3', name: 'Mike Torres', email: 'mtorres@email.com', phone: '(816) 555-0267', jobs: 1, ltv: 24800, lastActivity: '1 hour ago', source: 'Google Ads', status: 'active' },
  { id: '4', name: 'Maria Lopez', email: 'maria.l@email.com', phone: '(913) 555-0334', jobs: 3, ltv: 42000, lastActivity: '3 days ago', source: 'Referral', status: 'active' },
  { id: '5', name: 'Robert Chen', email: 'r.chen@email.com', phone: '(816) 555-0411', jobs: 1, ltv: 15600, lastActivity: '1 week ago', source: 'Website', status: 'lead' },
  { id: '6', name: 'Amanda White', email: 'a.white@email.com', phone: '(913) 555-0488', jobs: 0, ltv: 0, lastActivity: '2 days ago', source: 'Door Knock', status: 'lead' },
  { id: '7', name: 'James Wilson', email: 'jwilson@email.com', phone: '(816) 555-0555', jobs: 2, ltv: 38400, lastActivity: '5 days ago', source: 'Website', status: 'past' },
  { id: '8', name: 'Lisa Brown', email: 'lisa.b@email.com', phone: '(913) 555-0622', jobs: 1, ltv: 22100, lastActivity: '2 weeks ago', source: 'Google Ads', status: 'past' },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  lead: 'bg-blue-50 text-blue-700 border-blue-200',
  past: 'bg-muted text-muted-foreground',
};

const STATUSES = ['all', 'active', 'lead', 'past'];
const SOURCES = ['all', 'Website', 'Referral', 'Google Ads', 'Door Knock', 'Facebook'];

export default function CustomersPage() {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'ltv' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState('Website');
  const [formStatus, setFormStatus] = useState('lead');

  const filtered = useMemo(() => {
    let result = customers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || c.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
    if (sortField) {
      result = [...result].sort((a, b) => {
        const av = sortField === 'name' ? a.name.toLowerCase() : a.ltv;
        const bv = sortField === 'name' ? b.name.toLowerCase() : b.ltv;
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [customers, search, statusFilter, sourceFilter, sortField, sortDir]);

  function handleSort(field: 'name' | 'ltv') {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function openNew() {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSource('Website');
    setFormStatus('lead');
    setShowNewDialog(true);
  }

  function openEdit(c: Customer) {
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormSource(c.source);
    setFormStatus(c.status);
    setEditCustomer(c);
  }

  function handleCreate() {
    if (!formName.trim()) { error('Error', 'Name is required'); return; }
    const newCustomer: Customer = {
      id: String(Date.now()),
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      jobs: 0,
      ltv: 0,
      lastActivity: 'Just now',
      source: formSource,
      status: formStatus,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    setShowNewDialog(false);
    success('Customer created', `${newCustomer.name} added successfully`);
  }

  function handleUpdate() {
    if (!editCustomer || !formName.trim()) return;
    setCustomers(prev => prev.map(c =>
      c.id === editCustomer.id ? { ...c, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim(), source: formSource, status: formStatus } : c
    ));
    setEditCustomer(null);
    success('Customer updated', `${formName.trim()} saved`);
  }

  function handleDelete(c: Customer) {
    setCustomers(prev => prev.filter(x => x.id !== c.id));
    success('Customer deleted', `${c.name} removed`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers.length} total customers
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{customers.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{customers.filter(c => c.status === 'active').length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{customers.filter(c => c.status === 'lead').length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lifetime Revenue</p>
          <p className="text-2xl font-bold tabular-nums mt-1">${customers.reduce((s, c) => s + c.ltv, 0).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
              {sourceFilter === 'all' ? 'Source' : sourceFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SOURCES.map(s => (
              <DropdownMenuItem key={s} onClick={() => setSourceFilter(s)}>
                {s === 'all' ? 'All Sources' : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Jobs</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('ltv')}>
                <div className="flex items-center justify-end gap-1">Lifetime Value <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => setViewCustomer(c)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{c.phone}</TableCell>
                <TableCell className="text-center tabular-nums">{c.jobs}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">${c.ltv.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{c.lastActivity}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs font-normal">{c.source}</Badge></TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewCustomer(c); }}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(c); }}>
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
          <span>Showing 1-{filtered.length} of {customers.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled className="h-7 text-xs">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 text-xs">Next</Button>
          </div>
        </div>
      </Card>

      {/* New Customer Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
            <DialogDescription>Add a new customer to your CRM</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(xxx) xxx-xxxx" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formSource} onChange={e => setFormSource(e.target.value)}>
                  {SOURCES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                  {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formSource} onChange={e => setFormSource(e.target.value)}>
                  {SOURCES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                  {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && setViewCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewCustomer?.name}</DialogTitle>
            <DialogDescription>Customer details</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium mt-0.5">{viewCustomer.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium mt-0.5">{viewCustomer.phone || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Jobs</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">{viewCustomer.jobs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Lifetime Value</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">${viewCustomer.ltv.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border mt-1 ${STATUS_STYLES[viewCustomer.status]}`}>
                    {viewCustomer.status.charAt(0).toUpperCase() + viewCustomer.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Source</p>
                  <p className="text-sm font-medium mt-0.5">{viewCustomer.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Activity</p>
                  <p className="text-sm font-medium mt-0.5">{viewCustomer.lastActivity}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setViewCustomer(null); if (viewCustomer) openEdit(viewCustomer); }}>Edit</Button>
            <Button onClick={() => setViewCustomer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
