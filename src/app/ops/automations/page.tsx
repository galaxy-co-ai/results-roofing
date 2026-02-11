'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Zap, MoreHorizontal, Pause, Play, Eye, Trash2 } from 'lucide-react';
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

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  status: 'active' | 'paused';
  lastTriggered: string;
  runs: number;
}

const INITIAL_AUTOMATIONS: Automation[] = [
  { id: '1', name: 'Welcome Email', trigger: 'New lead created', actions: 'Send welcome email template', status: 'active', lastTriggered: '2 hours ago', runs: 142 },
  { id: '2', name: 'Appointment Reminder', trigger: 'Calendar event in 24h', actions: 'Send SMS reminder', status: 'active', lastTriggered: '6 hours ago', runs: 89 },
  { id: '3', name: 'Proposal Follow-up', trigger: 'Proposal sent + 3 days', actions: 'Send follow-up email, Create task', status: 'active', lastTriggered: '1 day ago', runs: 34 },
  { id: '4', name: 'Payment Received', trigger: 'Payment received', actions: 'Send receipt email, Update job stage', status: 'active', lastTriggered: '3 days ago', runs: 67 },
  { id: '5', name: 'Overdue Invoice', trigger: 'Invoice overdue + 7 days', actions: 'Send reminder email, Notify manager', status: 'active', lastTriggered: '5 days ago', runs: 12 },
  { id: '6', name: 'Job Complete Survey', trigger: 'Job enters Complete stage', actions: 'Send satisfaction survey email', status: 'paused', lastTriggered: '2 weeks ago', runs: 28 },
  { id: '7', name: 'Re-engagement Email', trigger: 'No activity for 30 days', actions: 'Send check-in email', status: 'paused', lastTriggered: '1 month ago', runs: 8 },
];

export default function AutomationsPage() {
  const { success } = useToast();
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewAutomation, setViewAutomation] = useState<Automation | null>(null);

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

  function handleCreate() {
    if (!formName.trim() || !formTrigger.trim() || !formActions.trim()) return;
    const newAuto: Automation = {
      id: String(Date.now()),
      name: formName.trim(),
      trigger: formTrigger.trim(),
      actions: formActions.trim(),
      status: 'active',
      lastTriggered: 'Never',
      runs: 0,
    };
    setAutomations(prev => [newAuto, ...prev]);
    setShowNewDialog(false);
    setFormName(''); setFormTrigger(''); setFormActions('');
    success('Automation created', `"${newAuto.name}" is now active`);
  }

  function handleToggle(auto: Automation) {
    const newStatus = auto.status === 'active' ? 'paused' : 'active';
    setAutomations(prev => prev.map(a =>
      a.id === auto.id ? { ...a, status: newStatus } : a
    ));
    success(newStatus === 'active' ? 'Automation activated' : 'Automation paused', `"${auto.name}" is now ${newStatus}`);
  }

  function handleDelete(auto: Automation) {
    setAutomations(prev => prev.filter(a => a.id !== auto.id));
    setViewAutomation(null);
    success('Automation deleted', `"${auto.name}" removed`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Automations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Workflow automations to save time</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setFormName(''); setFormTrigger(''); setFormActions(''); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{active.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Runs</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{totalRuns}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Saved</p>
          <p className="text-2xl font-bold tabular-nums mt-1">~{Math.round(totalRuns * 2.5)} min</p>
        </CardContent></Card>
      </div>

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
                <TableCell className="text-muted-foreground text-xs">{a.lastTriggered}</TableCell>
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

      {/* New Automation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Automation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formName.trim() || !formTrigger.trim() || !formActions.trim()}>Create Automation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Automation Dialog */}
      <Dialog open={!!viewAutomation} onOpenChange={() => setViewAutomation(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewAutomation?.name}</DialogTitle></DialogHeader>
          {viewAutomation && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
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
                <div><p className="text-xs text-muted-foreground">Last Triggered</p><p className="font-medium">{viewAutomation.lastTriggered}</p></div>
              </div>
            </div>
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
