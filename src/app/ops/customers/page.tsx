'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Pencil, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/components/ui/Toast';
import { useOpsContacts, useCreateContact, useDeleteContact } from '@/hooks/ops/use-ops-queries';
import type { OpsContact } from '@/types/ops';

const SOURCES = ['all', 'Website', 'Referral', 'Google Ads', 'Door Knock', 'Facebook', 'Manual'];

function contactName(c: OpsContact): string {
  if (c.name) return c.name;
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown';
}

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CustomersPage() {
  const { success, error: showError } = useToast();
  const { data: contacts = [], isLoading, refetch } = useOpsContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewContact, setViewContact] = useState<OpsContact | null>(null);

  // Form state
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formSource, setFormSource] = useState('Website');

  const filtered = useMemo(() => {
    let result = contacts.filter((c) => {
      const q = search.toLowerCase();
      const name = contactName(c).toLowerCase();
      const matchesSearch = !q || name.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
      const matchesSource = sourceFilter === 'all' || (c.source || '').toLowerCase() === sourceFilter.toLowerCase();
      return matchesSearch && matchesSource;
    });
    if (sortField === 'name') {
      result = [...result].sort((a, b) => {
        const av = contactName(a).toLowerCase();
        const bv = contactName(b).toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [contacts, search, sourceFilter, sortField, sortDir]);

  function handleSort() {
    if (sortField === 'name') {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField('name');
      setSortDir('asc');
    }
  }

  function openNew() {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormState('');
    setFormSource('Website');
    setShowNewDialog(true);
  }

  async function handleCreate() {
    if (!formFirstName.trim() && !formLastName.trim()) { showError('Error', 'Name is required'); return; }
    try {
      await createContact.mutateAsync({
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        source: formSource,
      });
      setShowNewDialog(false);
      success('Customer created', `${formFirstName.trim()} ${formLastName.trim()} added`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to create customer');
    }
  }

  async function handleDelete(c: OpsContact) {
    try {
      await deleteContact.mutateAsync(c.id);
      success('Customer deleted', `${contactName(c)} removed`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to delete customer');
    }
  }

  const uniqueSources = useMemo(() => {
    const s = new Set(contacts.map(c => c.source).filter(Boolean));
    return ['all', ...Array.from(s)];
  }, [contacts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${contacts.length} total customers`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Contacts</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : contacts.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">With Email</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : contacts.filter(c => c.email).length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">With Phone</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : contacts.filter(c => c.phone).length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sources</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : new Set(contacts.map(c => c.source).filter(Boolean)).size}</p>
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
              {sourceFilter === 'all' ? 'Source' : sourceFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {uniqueSources.map(s => (
              <DropdownMenuItem key={s} onClick={() => setSourceFilter(s as string)}>
                {s === 'all' ? 'All Sources' : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">{contacts.length === 0 ? 'No customers yet' : 'No customers match your filters'}</p>
            {contacts.length === 0 && (
              <Button size="sm" className="mt-3 gap-2" onClick={openNew}>
                <Plus className="h-4 w-4" />
                Add your first customer
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={handleSort}>
                    <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setViewContact(c)}>
                    <TableCell className="font-medium">{contactName(c)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{c.phone || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{timeAgo(c.dateAdded)}</TableCell>
                    <TableCell>
                      {c.source ? <Badge variant="outline" className="text-xs font-normal">{c.source}</Badge> : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewContact(c); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
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
              <span>Showing {filtered.length} of {contacts.length}</span>
            </div>
          </>
        )}
      </Card>

      {/* New Customer Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
            <DialogDescription>Add a new customer to your CRM</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={formFirstName} onChange={e => setFormFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formLastName} onChange={e => setFormLastName(e.target.value)} placeholder="Smith" />
              </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Austin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={formState} onChange={e => setFormState(e.target.value)} placeholder="TX" />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formSource} onChange={e => setFormSource(e.target.value)}>
                  {SOURCES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createContact.isPending}>
              {createContact.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={!!viewContact} onOpenChange={(open) => !open && setViewContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewContact ? contactName(viewContact) : ''}</DialogTitle>
            <DialogDescription>Customer details</DialogDescription>
          </DialogHeader>
          {viewContact && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium mt-0.5">{viewContact.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium mt-0.5">{viewContact.phone || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium mt-0.5">
                    {[viewContact.city, viewContact.state].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Source</p>
                  <p className="text-sm font-medium mt-0.5">{viewContact.source || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Added</p>
                  <p className="text-sm font-medium mt-0.5">{timeAgo(viewContact.dateAdded)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {viewContact.tags?.length ? viewContact.tags.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    )) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                </div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button onClick={() => setViewContact(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
