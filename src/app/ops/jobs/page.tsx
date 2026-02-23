'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import {
  useOpsPipeline,
  useMoveOpportunity,
  useCreateOpportunity,
  useDeleteOpportunity,
} from '@/hooks/ops/use-ops-queries';
import type { Opportunity, PipelineStage } from '@/types/ops';

const STAGE_COLORS: Record<string, string> = {
  'New Lead': 'var(--ops-accent-crm)',
  'Contacted': 'var(--ops-accent-messaging)',
  'Quote Sent': 'var(--ops-accent-analytics)',
  'Negotiation': 'var(--ops-accent-negotiation)',
  'Won': 'var(--ops-accent-pipeline)',
  'Lost': 'var(--ops-accent-support)',
};

function getStageColor(name: string): string {
  return STAGE_COLORS[name] || 'var(--ops-accent-crm)';
}

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  won: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  abandoned: 'bg-muted text-muted-foreground',
};

export default function JobsPage() {
  const { success, error: showError } = useToast();
  const { data: pipelineData, isLoading, refetch } = useOpsPipeline();
  const moveOpportunity = useMoveOpportunity();
  const createOpportunity = useCreateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewOpp, setViewOpp] = useState<{ opp: Opportunity; stage: PipelineStage } | null>(null);

  // Drag state
  const [dragOpp, setDragOpp] = useState<{ opp: Opportunity; fromStageId: string } | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');

  const stages = pipelineData?.stages || [];
  const opportunities = pipelineData?.opportunities || [];

  // Group opportunities by stage
  const oppsByStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {};
    for (const stage of stages) {
      map[stage.id] = [];
    }
    for (const opp of opportunities) {
      const q = search.toLowerCase();
      if (q && !opp.name.toLowerCase().includes(q) && !(opp.contact?.name || '').toLowerCase().includes(q)) continue;
      if (map[opp.pipelineStageId]) {
        map[opp.pipelineStageId].push(opp);
      }
    }
    return map;
  }, [stages, opportunities, search]);

  function openNew() {
    setFormName('');
    setFormValue('');
    setShowNewDialog(true);
  }

  async function handleCreate() {
    if (!formName.trim()) return;
    const firstStage = stages[0];
    if (!firstStage) { showError('Error', 'No pipeline stages configured'); return; }
    try {
      await createOpportunity.mutateAsync({
        name: formName.trim(),
        pipelineId: firstStage.id.split('-')[0] || firstStage.id, // pipeline ID
        pipelineStageId: firstStage.id,
        contactId: '', // will be created without a contact link
        monetaryValue: Number(formValue) || 0,
      });
      setShowNewDialog(false);
      success('Job created', `${formName.trim()} added to ${firstStage.name}`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to create job');
    }
  }

  // Drag handlers
  function handleDragStart(opp: Opportunity) {
    setDragOpp({ opp, fromStageId: opp.pipelineStageId });
  }

  function handleDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStageId(stageId);
  }

  function handleDragLeave() {
    setDragOverStageId(null);
  }

  async function handleDrop(e: React.DragEvent, toStageId: string) {
    e.preventDefault();
    setDragOverStageId(null);
    if (!dragOpp || dragOpp.fromStageId === toStageId) {
      setDragOpp(null);
      return;
    }
    const stageName = stages.find(s => s.id === toStageId)?.name || 'stage';
    try {
      await moveOpportunity.mutateAsync({
        opportunityId: dragOpp.opp.id,
        stageId: toStageId,
      });
      success('Job moved', `${dragOpp.opp.name} → ${stageName}`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to move job');
    }
    setDragOpp(null);
  }

  function handleDragEnd() {
    setDragOpp(null);
    setDragOverStageId(null);
  }

  async function handleDeleteOpp(opp: Opportunity) {
    try {
      await deleteOpportunity.mutateAsync(opp.id);
      setViewOpp(null);
      success('Job deleted', `${opp.name} removed`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to delete job');
    }
  }

  async function handleMoveFromDialog(opp: Opportunity, toStageId: string) {
    const stageName = stages.find(s => s.id === toStageId)?.name || 'stage';
    try {
      await moveOpportunity.mutateAsync({ opportunityId: opp.id, stageId: toStageId });
      success('Job moved', `${opp.name} → ${stageName}`);
      const newStage = stages.find(s => s.id === toStageId);
      if (newStage) setViewOpp({ opp: { ...opp, pipelineStageId: toStageId }, stage: newStage });
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to move job');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Jobs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {opportunities.length} jobs across {stages.length} stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <Button variant="secondary" size="sm" className="h-7 gap-1.5 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {stages.map((stage) => {
          const stageOpps = oppsByStage[stage.id] || [];
          const totalValue = stageOpps.reduce((s, o) => s + (o.monetaryValue || 0), 0);
          const isDragOver = dragOverStageId === stage.id;
          const color = getStageColor(stage.name);

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-[280px] rounded-lg transition-colors ${isDragOver ? 'bg-blue-50/60 ring-2 ring-primary/30' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stage.name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
                    {stageOpps.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ${(totalValue / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              <div className="space-y-2 min-h-[60px]">
                {stageOpps.map((opp) => (
                  <Card
                    key={opp.id}
                    draggable
                    onDragStart={() => handleDragStart(opp)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-[3px] rounded-lg select-none ${
                      dragOpp?.opp.id === opp.id ? 'opacity-40 scale-95' : ''
                    }`}
                    style={{ borderLeftColor: color }}
                    onClick={() => setViewOpp({ opp, stage })}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{opp.name}</p>
                        {opp.contact?.name && (
                          <p className="text-xs text-muted-foreground">{opp.contact.name}</p>
                        )}
                      </div>
                      {(opp.monetaryValue || 0) > 0 && (
                        <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                          ${(opp.monetaryValue || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <span className="text-[11px] text-muted-foreground">{timeAgo(opp.createdAt)}</span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[opp.status] || STATUS_STYLES.open}`}>
                        {opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                      </span>
                    </div>
                  </Card>
                ))}

                {stageOpps.length === 0 && (
                  <div className={`border border-dashed rounded-lg p-4 text-center transition-colors ${isDragOver ? 'border-primary bg-blue-50/40' : ''}`}>
                    <p className="text-xs text-muted-foreground">{isDragOver ? 'Drop here' : 'No jobs'}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Job Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Job</DialogTitle>
            <DialogDescription>Add a new job to the pipeline</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-name">Job Name / Address *</Label>
              <Input id="job-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="123 Main St — Roof Replacement" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-value">Estimated Value ($)</Label>
              <Input id="job-value" type="number" value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="0" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createOpportunity.isPending}>
              {createOpportunity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Dialog */}
      <Dialog open={!!viewOpp} onOpenChange={(open) => !open && setViewOpp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewOpp?.opp.name}</DialogTitle>
            <DialogDescription>{viewOpp?.opp.contact?.name || 'No contact linked'}</DialogDescription>
          </DialogHeader>
          {viewOpp && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Stage</p>
                  <p className="text-sm font-medium mt-0.5">{viewOpp.stage.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Value</p>
                  <p className="text-sm font-medium mt-0.5 tabular-nums">
                    {(viewOpp.opp.monetaryValue || 0) > 0 ? `$${(viewOpp.opp.monetaryValue || 0).toLocaleString()}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border mt-0.5 ${STATUS_STYLES[viewOpp.opp.status] || STATUS_STYLES.open}`}>
                    {viewOpp.opp.status.charAt(0).toUpperCase() + viewOpp.opp.status.slice(1)}
                  </span>
                </div>
              </div>
              {viewOpp.opp.contact && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact Email</p>
                    <p className="text-sm font-medium mt-0.5">{viewOpp.opp.contact.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact Phone</p>
                    <p className="text-sm font-medium mt-0.5">{viewOpp.opp.contact.phone || '—'}</p>
                  </div>
                </div>
              )}
              <div>
                <Label className="mb-2 block">Move to Stage</Label>
                <div className="flex flex-wrap gap-1.5">
                  {stages.map(s => (
                    <Button
                      key={s.id}
                      variant={s.id === viewOpp.opp.pipelineStageId ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      disabled={moveOpportunity.isPending}
                      onClick={() => {
                        if (s.id === viewOpp.opp.pipelineStageId) return;
                        handleMoveFromDialog(viewOpp.opp, s.id);
                      }}
                    >
                      <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: getStageColor(s.name) }} />
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              disabled={deleteOpportunity.isPending}
              onClick={() => viewOpp && handleDeleteOpp(viewOpp.opp)}
            >
              {deleteOpportunity.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
            <Button onClick={() => setViewOpp(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
