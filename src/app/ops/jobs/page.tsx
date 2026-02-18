'use client';

import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';

interface Job {
  id: string;
  address: string;
  city: string;
  value: number;
  tasks: [number, number];
  measured: boolean;
  proposal: 'none' | 'draft' | 'sent' | 'signed' | 'rejected';
  assignee: string;
  timeAgo: string;
}

const STAGE_LIST = [
  { name: 'New Lead', color: '#6B7A94' },
  { name: 'Appt Scheduled', color: '#1E6CFF' },
  { name: 'Measured', color: '#8B5CF6' },
  { name: 'Proposal Sent', color: '#F59E0B' },
  { name: 'Proposal Signed', color: '#10B981' },
  { name: 'Pre-Production', color: '#06B6D4' },
  { name: 'In Progress', color: '#EC4899' },
  { name: 'Complete', color: '#22C55E' },
];

const INITIAL_JOBS: Record<string, Job[]> = {
  'New Lead': [
    { id: '1042', address: '2187 Herndon Ave', city: 'Clovis, CA', value: 0, tasks: [0, 0], measured: false, proposal: 'none', assignee: 'JS', timeAgo: 'just now' },
    { id: '1041', address: '214 N 3rd St', city: 'River Falls, WI', value: 0, tasks: [2, 2], measured: false, proposal: 'none', assignee: 'AB', timeAgo: '4h ago' },
    { id: '1040', address: '8812 Oak Park Blvd', city: 'Houston, TX', value: 0, tasks: [0, 0], measured: false, proposal: 'none', assignee: 'TC', timeAgo: '6h ago' },
  ],
  'Appt Scheduled': [
    { id: '1038', address: '1 Carriage Dr', city: 'Kansas City, MO', value: 19000, tasks: [2, 3], measured: true, proposal: 'draft', assignee: 'JS', timeAgo: '3h ago' },
    { id: '1035', address: '13790 Marine Dr', city: 'White Rock, BC', value: 17000, tasks: [2, 3], measured: true, proposal: 'draft', assignee: 'JS', timeAgo: '3h ago' },
  ],
  'Proposal Sent': [
    { id: '1036', address: '2726 Askew Ave', city: 'Kansas City, MO', value: 6000, tasks: [4, 6], measured: true, proposal: 'sent', assignee: 'TC', timeAgo: '6h ago' },
    { id: '1034', address: '9 Sugar Bowl Ln', city: 'Gulf Breeze, FL', value: 27000, tasks: [6, 6], measured: true, proposal: 'sent', assignee: 'TC', timeAgo: '3d ago' },
  ],
  'Proposal Signed': [
    { id: '1030', address: '445 Elm Street', city: 'Denver, CO', value: 15000, tasks: [3, 5], measured: true, proposal: 'signed', assignee: 'AB', timeAgo: '1d ago' },
  ],
  'In Progress': [
    { id: '1025', address: '1220 Maple Ave', city: 'Austin, TX', value: 18500, tasks: [5, 8], measured: true, proposal: 'signed', assignee: 'JS', timeAgo: '2d ago' },
  ],
};

const ASSIGNEES = ['JS', 'TC', 'AB', 'MJ', 'RK'];

function ProposalBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    none: { label: 'No Proposal', className: 'bg-muted text-muted-foreground' },
    draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground' },
    sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    signed: { label: 'Signed', className: 'bg-green-50 text-green-700 border-green-200' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const badge = map[status] || map.none;
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border ${badge.className}`}>{badge.label}</span>;
}

export default function JobsPage() {
  const { success, info } = useToast();
  const [jobs, setJobs] = useState<Record<string, Job[]>>(INITIAL_JOBS);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewJob, setViewJob] = useState<{ job: Job; stage: string } | null>(null);

  // Drag state
  const [dragJob, setDragJob] = useState<{ job: Job; fromStage: string } | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Form state
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formAssignee, setFormAssignee] = useState('JS');

  function stageCounts(stageName: string) {
    const stageJobs = jobs[stageName] || [];
    return {
      count: stageJobs.length,
      value: stageJobs.reduce((s, j) => s + j.value, 0),
    };
  }

  function openNew() {
    setFormAddress('');
    setFormCity('');
    setFormValue('');
    setFormAssignee('JS');
    setShowNewDialog(true);
  }

  function handleCreate() {
    if (!formAddress.trim()) return;
    const newJob: Job = {
      id: String(1043 + Math.floor(Math.random() * 100)),
      address: formAddress.trim(),
      city: formCity.trim(),
      value: Number(formValue) || 0,
      tasks: [0, 0],
      measured: false,
      proposal: 'none',
      assignee: formAssignee,
      timeAgo: 'just now',
    };
    setJobs(prev => ({
      ...prev,
      'New Lead': [newJob, ...(prev['New Lead'] || [])],
    }));
    setShowNewDialog(false);
    success('Job created', `${newJob.address} added to New Lead`);
  }

  // Drag handlers
  function handleDragStart(job: Job, fromStage: string) {
    setDragJob({ job, fromStage });
  }

  function handleDragOver(e: React.DragEvent, stageName: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageName);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(e: React.DragEvent, toStage: string) {
    e.preventDefault();
    setDragOverStage(null);
    if (!dragJob || dragJob.fromStage === toStage) {
      setDragJob(null);
      return;
    }
    setJobs(prev => {
      const fromJobs = (prev[dragJob.fromStage] || []).filter(j => j.id !== dragJob.job.id);
      const toJobs = [dragJob.job, ...(prev[toStage] || [])];
      return { ...prev, [dragJob.fromStage]: fromJobs, [toStage]: toJobs };
    });
    success('Job moved', `${dragJob.job.address} → ${toStage}`);
    setDragJob(null);
  }

  function handleDragEnd() {
    setDragJob(null);
    setDragOverStage(null);
  }

  function handleDeleteJob(job: Job, stage: string) {
    setJobs(prev => ({
      ...prev,
      [stage]: (prev[stage] || []).filter(j => j.id !== job.id),
    }));
    setViewJob(null);
    success('Job deleted', `${job.address} removed`);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Jobs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your roofing pipeline</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search addresses or customers..." className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <Button variant="secondary" size="sm" className="h-7 gap-1.5 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => info('Coming soon', 'List view is under development')}>
            <List className="h-3.5 w-3.5" />
            List
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {STAGE_LIST.map((stage) => {
          const stageJobs = jobs[stage.name] || [];
          const { count, value } = stageCounts(stage.name);
          const isDragOver = dragOverStage === stage.name;

          return (
            <div
              key={stage.name}
              className={`flex-shrink-0 w-[280px] rounded-lg transition-colors ${isDragOver ? 'bg-blue-50/60 ring-2 ring-primary/30' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.name)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stage.name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
                    {count}
                  </span>
                </div>
                {value > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ${(value / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[60px]">
                {stageJobs.map((job) => (
                  <Card
                    key={job.id}
                    draggable
                    onDragStart={() => handleDragStart(job, stage.name)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-[3px] rounded-lg select-none ${
                      dragJob?.job.id === job.id ? 'opacity-40 scale-95' : ''
                    }`}
                    style={{ borderLeftColor: stage.color }}
                    onClick={() => setViewJob({ job, stage: stage.name })}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{job.address}</p>
                        <p className="text-xs text-muted-foreground">{job.city}</p>
                      </div>
                      {job.value > 0 && (
                        <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                          ${job.value.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        Tasks {job.tasks[0]}/{job.tasks[1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {job.measured && (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                          Measured
                        </span>
                      )}
                      <ProposalBadge status={job.proposal} />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <span className="text-[11px] text-muted-foreground">{job.timeAgo}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {job.assignee}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Card>
                ))}

                {stageJobs.length === 0 && (
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
              <Label htmlFor="job-address">Address *</Label>
              <Input id="job-address" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-city">City, State</Label>
                <Input id="job-city" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Kansas City, MO" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-value">Estimated Value ($)</Label>
                <Input id="job-value" type="number" value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formAssignee} onChange={e => setFormAssignee(e.target.value)}>
                {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Dialog */}
      <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job #{viewJob?.job.id}</DialogTitle>
            <DialogDescription>{viewJob?.job.address}, {viewJob?.job.city}</DialogDescription>
          </DialogHeader>
          {viewJob && (
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Stage</p>
                  <p className="text-sm font-medium mt-0.5">{viewJob.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Value</p>
                  <p className="text-sm font-medium mt-0.5">{viewJob.job.value > 0 ? `$${viewJob.job.value.toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Assignee</p>
                  <p className="text-sm font-medium mt-0.5">{viewJob.job.assignee}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</p>
                  <p className="text-sm font-medium mt-0.5">{viewJob.job.tasks[0]}/{viewJob.job.tasks[1]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Measured</p>
                  <p className="text-sm font-medium mt-0.5">{viewJob.job.measured ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Proposal</p>
                  <div className="mt-0.5"><ProposalBadge status={viewJob.job.proposal} /></div>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Move to Stage</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGE_LIST.map(s => (
                    <Button
                      key={s.name}
                      variant={s.name === viewJob.stage ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        if (s.name === viewJob.stage) return;
                        setJobs(prev => {
                          const from = (prev[viewJob.stage] || []).filter(j => j.id !== viewJob.job.id);
                          const to = [viewJob.job, ...(prev[s.name] || [])];
                          return { ...prev, [viewJob.stage]: from, [s.name]: to };
                        });
                        success('Job moved', `${viewJob.job.address} → ${s.name}`);
                        setViewJob({ ...viewJob, stage: s.name });
                      }}
                    >
                      <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
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
              onClick={() => viewJob && handleDeleteJob(viewJob.job, viewJob.stage)}
            >
              Delete
            </Button>
            <Button onClick={() => setViewJob(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
