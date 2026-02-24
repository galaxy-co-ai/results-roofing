'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Zap, MoreHorizontal, Pause, Play, Eye, Trash2, RefreshCw } from 'lucide-react';
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
  useOpsAutomations, useCreateAutomation, useUpdateAutomation, useDeleteAutomation,
} from '@/hooks/ops/use-ops-queries';
import type { OpsAutomation } from '@/types/ops';

export default function AutomationsPage() {
  const { success } = useToast();
  const { data: automations = [], isLoading, refetch } = useOpsAutomations();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewAutomation, setViewAutomation] = useState<OpsAutomation | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTrigger, setFormTrigger] = useState('');
  const [formActions, setFormActions] = useState('');

  const filtered = useMemo(() => {
    let result = automations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.trigger.toLowerCase().includes(q) ||
        a.actions.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    return result;
  }, [automations, search, statusFilter]);

  const active = automations.filter(a => a.status === 'active');
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);

  async function handleCreate() {
    if (!formName.trim() || !formTrigger.trim() || !formActions.trim()) return;
    try {
      await createAutomation.mutateAsync({
        name: formName.trim(),
        trigger: formTrigger.trim(),
        actions: formActions.trim(),
      });
      setShowNewDialog(false);
      setFormName(''); setFormTrigger(''); setFormActions('');
      success('Automation created', `"${formName.trim()}" is now active`);
    } catch {
      // Error handled by mutation
    }
  }

  async function handleToggle(auto: OpsAutomation) {
    const newStatus = auto.status === 'active' ? 'paused' : 'active';
    try {
      await updateAutomation.mutateAsync({ id: auto.id, status: newStatus });
      success(
        newStatus === 'active' ? 'Automation activated' : 'Automation paused',
        `"${auto.name}" is now ${newStatus}`
      );
    } catch {
      // Error handled by mutation
    }
  }

  async function handleDelete(auto: OpsAutomation) {
    try {
      await deleteAutomation.mutateAsync(auto.id);
      setViewAutomation(null);
      success('Automation deleted', `"${auto.name}" removed`);
    } catch {
      // Error handled by mutation
    }
  }

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Automations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${automations.length} automations · ${active.length} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setFormName(''); setFormTrigger(''); setFormActions(''); setShowNewDialog(true); }}>
            <Plus className="h-4 w-4" />
            New Automation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : active.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Runs</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : totalRuns}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Saved</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '—' : `~${Math.round(totalRuns * 2.5)} min`}</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : automations.length === 0 ? (
        <Card>
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">No automations yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Create your first automation to streamline workflows like follow-ups, reminders, and notifications.
            </p>
            <Button size="sm" className="mt-4 gap-2" onClick={() => { setFormName(''); setFormTrigger(''); setFormActions(''); setShowNewDialog(true); }}>
              <Plus className="h-4 w-4" />
              New Automation
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search automations..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('paused')}>Paused</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action(s)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => setViewAutomation(a)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${a.status === 'active' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{a.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{a.trigger}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">{a.actions}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                        a.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground'
                      }`}>
                        {a.status === 'active' ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.runs}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(a.lastTriggeredAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewAutomation(a); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); handleToggle(a); }}>
                            {a.status === 'active' ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Activate</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(a); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No automations match your search</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* New Automation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Automation</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Follow-up Email" />
            </div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Input value={formTrigger} onChange={e => setFormTrigger(e.target.value)} placeholder="Proposal sent + 3 days" />
            </div>
            <div className="space-y-2">
              <Label>Action(s)</Label>
              <Input value={formActions} onChange={e => setFormActions(e.target.value)} placeholder="Send follow-up email" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!formName.trim() || !formTrigger.trim() || !formActions.trim() || createAutomation.isPending}
            >
              {createAutomation.isPending ? 'Creating...' : 'Create Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Automation Dialog */}
      <Dialog open={!!viewAutomation} onOpenChange={() => setViewAutomation(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewAutomation?.name}</DialogTitle></DialogHeader>
          {viewAutomation && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                    viewAutomation.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground'
                  }`}>
                    {viewAutomation.status === 'active' ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                    {viewAutomation.status.charAt(0).toUpperCase() + viewAutomation.status.slice(1)}
                  </span>
                </div>
                <div><p className="text-xs text-muted-foreground">Total Runs</p><p className="font-medium tabular-nums">{viewAutomation.runs}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Trigger</p><p className="font-medium">{viewAutomation.trigger}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Action(s)</p><p className="font-medium">{viewAutomation.actions}</p></div>
                <div><p className="text-xs text-muted-foreground">Last Triggered</p><p className="font-medium">{formatDate(viewAutomation.lastTriggeredAt)}</p></div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { handleToggle(viewAutomation!); setViewAutomation(null); }}>
              {viewAutomation?.status === 'active' ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Activate</>}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => viewAutomation && handleDelete(viewAutomation)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
