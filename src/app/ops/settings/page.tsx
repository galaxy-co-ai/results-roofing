'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Building2, GitBranch, Link2, Bell, Database,
  Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Download, Upload, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
  useCompanySettings, useSaveCompanySettings,
  usePipelineStages, useCreatePipelineStage, useUpdatePipelineStage,
  useDeletePipelineStage, useReorderPipelineStages,
  useNotificationPreferences, useUpdateNotificationPreference,
} from '@/hooks/ops/use-ops-queries';
import type { OpsPipelineStage } from '@/types/ops';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTEGRATIONS = [
  { name: 'Stripe', description: 'Payment processing', connected: true, icon: '💳', url: 'https://dashboard.stripe.com' },
  { name: 'Resend', description: 'Email delivery', connected: true, icon: '📧', url: 'https://resend.com/overview' },
  { name: 'SignalWire', description: 'SMS messaging', connected: false, icon: '📱', url: 'https://signalwire.com/docs' },
  { name: 'Google Solar', description: 'Satellite measurements', connected: true, icon: '🛰️', url: 'https://console.cloud.google.com/apis' },
  { name: 'Cal.com', description: 'Scheduling', connected: false, icon: '📅', url: 'https://cal.com/docs' },
  { name: 'Documenso', description: 'Document signing', connected: false, icon: '📝', url: 'https://documenso.com/docs' },
];

const NOTIFICATION_EVENTS = [
  { key: 'new_lead', label: 'New lead received' },
  { key: 'proposal_signed', label: 'Proposal signed' },
  { key: 'payment_received', label: 'Payment received' },
  { key: 'invoice_overdue', label: 'Invoice overdue' },
  { key: 'task_overdue', label: 'Task overdue' },
];

const TABS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data', icon: Database },
] as const;

type TabId = typeof TABS[number]['id'];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company');

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your ops dashboard</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && <CompanyTab />}
      {activeTab === 'pipeline' && <PipelineTab />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'data' && <DataTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: Company Info
// ---------------------------------------------------------------------------

function CompanyTab() {
  const { success, error } = useToast();
  const { data: settings, isLoading } = useCompanySettings();
  const saveMutation = useSaveCompanySettings();

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Sync from server data once loaded
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setPhone(settings.phone || '');
      setAddress(settings.address || '');
      setEmail(settings.email || '');
      setLicenseNumber(settings.licenseNumber || '');
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({ companyName, phone, address, email, licenseNumber });
      success('Saved', 'Company profile updated successfully');
    } catch {
      error('Error', 'Failed to save company profile');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Company Profile</CardTitle>
            <CardDescription>Your business information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">License #</Label>
            <Input id="license" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Pipeline Management
// ---------------------------------------------------------------------------

function PipelineTab() {
  const { success, error } = useToast();
  const { data: stages, isLoading } = usePipelineStages();
  const createMutation = useCreatePipelineStage();
  const updateMutation = useUpdatePipelineStage();
  const deleteMutation = useDeletePipelineStage();
  const reorderMutation = useReorderPipelineStages();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<OpsPipelineStage | null>(null);
  const [stageName, setStageName] = useState('');
  const [stageColor, setStageColor] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sortedStages = stages ? [...stages].sort((a, b) => a.position - b.position) : [];

  const openAddDialog = () => {
    setEditingStage(null);
    setStageName('');
    setStageColor('');
    setDialogOpen(true);
  };

  const openEditDialog = (stage: OpsPipelineStage) => {
    setEditingStage(stage);
    setStageName(stage.name);
    setStageColor(stage.color || '');
    setDialogOpen(true);
  };

  const handleSaveStage = async () => {
    if (!stageName.trim()) return;
    try {
      if (editingStage) {
        await updateMutation.mutateAsync({
          id: editingStage.id,
          name: stageName.trim(),
          color: stageColor || undefined,
        });
        success('Updated', `Stage "${stageName.trim()}" updated`);
      } else {
        await createMutation.mutateAsync({
          name: stageName.trim(),
          color: stageColor || undefined,
        });
        success('Created', `Stage "${stageName.trim()}" added`);
      }
      setDialogOpen(false);
    } catch {
      error('Error', editingStage ? 'Failed to update stage' : 'Failed to create stage');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      success('Deleted', 'Pipeline stage removed');
      setDeleteConfirmId(null);
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'Cannot delete this stage');
      setDeleteConfirmId(null);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sortedStages.length) return;

    const newOrder = sortedStages.map((s, i) => {
      if (i === index) return { id: s.id, position: sortedStages[swapIndex].position };
      if (i === swapIndex) return { id: s.id, position: sortedStages[index].position };
      return { id: s.id, position: s.position };
    });

    try {
      await reorderMutation.mutateAsync(newOrder);
    } catch {
      error('Error', 'Failed to reorder stages');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Pipeline Stages</CardTitle>
              <CardDescription>Customize your job pipeline workflow</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedStages.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors group">
                <span className="text-xs text-muted-foreground tabular-nums w-5">{i + 1}</span>
                {stage.color && (
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                )}
                <span className="text-sm flex-1">{stage.name}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost" size="sm" className="h-6 w-6 p-0"
                    onClick={() => handleReorder(i, 'up')}
                    disabled={i === 0 || reorderMutation.isPending}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="h-6 w-6 p-0"
                    onClick={() => handleReorder(i, 'down')}
                    disabled={i === sortedStages.length - 1 || reorderMutation.isPending}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="h-6 w-6 p-0"
                    onClick={() => openEditDialog(stage)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {deleteConfirmId === stage.id ? (
                    <div className="flex items-center gap-1 ml-1">
                      <Button
                        variant="destructive" size="sm" className="h-6 text-[11px] px-2"
                        onClick={() => handleDelete(stage.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-6 text-[11px] px-2"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/70 hover:text-destructive"
                      onClick={() => setDeleteConfirmId(stage.id)}
                      disabled={stage.isDefault}
                      title={stage.isDefault ? 'Default stages cannot be deleted' : 'Delete stage'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3 text-xs gap-1" onClick={openAddDialog}>
            <Plus className="h-3.5 w-3.5" />
            Add Stage
          </Button>
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{editingStage ? 'Edit Stage' : 'Add Pipeline Stage'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                placeholder="e.g. Insurance Review"
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveStage()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-color">Color (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="stage-color"
                  type="color"
                  className="w-10 h-8 p-0.5 cursor-pointer"
                  value={stageColor || '#3b82f6'}
                  onChange={e => setStageColor(e.target.value)}
                />
                <Input
                  placeholder="#3b82f6"
                  value={stageColor}
                  onChange={e => setStageColor(e.target.value)}
                  className="flex-1"
                />
                {stageColor && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setStageColor('')}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleSaveStage}
              disabled={!stageName.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingStage ? 'Update' : 'Add Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Integrations
// ---------------------------------------------------------------------------

function IntegrationsTab() {
  const [infoDialog, setInfoDialog] = useState<typeof INTEGRATIONS[number] | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Integrations</CardTitle>
              <CardDescription>Connected services and APIs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {INTEGRATIONS.map((int) => (
              <div key={int.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{int.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.description}</p>
                  </div>
                </div>
                {int.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Connected
                  </span>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setInfoDialog(int)}>
                    Set Up
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration info dialog */}
      <Dialog open={!!infoDialog} onOpenChange={() => setInfoDialog(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{infoDialog?.icon}</span>
              {infoDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {infoDialog?.name === 'SignalWire' &&
                'SignalWire provides SMS and voice messaging for customer communication. An API key and phone number are required to activate.'}
              {infoDialog?.name === 'Cal.com' &&
                'Cal.com handles appointment scheduling and booking. Requires a Cal.com account and API credentials.'}
              {infoDialog?.name === 'Documenso' &&
                'Documenso enables digital document signing for proposals and contracts. Requires an API key from your Documenso account.'}
            </p>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground">To set up this integration:</p>
              <ol className="mt-1.5 space-y-1 text-muted-foreground list-decimal list-inside text-xs">
                <li>Create an account at {infoDialog?.name}</li>
                <li>Generate API credentials</li>
                <li>Add the credentials to the environment variables</li>
              </ol>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setInfoDialog(null)}>Close</Button>
            <Button size="sm" className="gap-1.5" asChild>
              <a href={infoDialog?.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open {infoDialog?.name} Docs
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Notifications
// ---------------------------------------------------------------------------

function NotificationsTab() {
  const { error } = useToast();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreference();

  // Track "just saved" state per event+channel for the subtle indicator
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const getPreference = useCallback(
    (eventType: string) => preferences?.find(p => p.eventType === eventType),
    [preferences]
  );

  const handleToggle = async (eventType: string, field: 'emailEnabled' | 'smsEnabled', checked: boolean) => {
    try {
      await updateMutation.mutateAsync({ eventType, [field]: checked });
      const key = `${eventType}-${field}`;
      setSaved(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 1500);
    } catch {
      error('Error', 'Failed to update notification preference');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {NOTIFICATION_EVENTS.map(({ key, label }) => {
            const pref = getPreference(key);
            return (
              <div key={key} className="flex items-center justify-between p-2">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={pref?.emailEnabled ?? true}
                      onChange={e => handleToggle(key, 'emailEnabled', e.target.checked)}
                    />
                    Email
                    {saved[`${key}-emailEnabled`] && (
                      <span className="text-[10px] text-green-600 animate-in fade-in-0">Saved</span>
                    )}
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={pref?.smsEnabled ?? false}
                      onChange={e => handleToggle(key, 'smsEnabled', e.target.checked)}
                    />
                    SMS
                    {saved[`${key}-smsEnabled`] && (
                      <span className="text-[10px] text-green-600 animate-in fade-in-0">Saved</span>
                    )}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: Data Export / Import
// ---------------------------------------------------------------------------

function DataTab() {
  const { success, error, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/ops/settings/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-roofing-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('Exported', 'Data downloaded as CSV');
    } catch {
      error('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const res = await fetch('/api/ops/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      });
      if (!res.ok) throw new Error('Import failed');
      const result = await res.json();
      setImportResult(result);
      if (result.errors?.length) {
        info('Import complete', `${result.imported} contacts imported with ${result.errors.length} error(s)`);
      } else {
        success('Import complete', `${result.imported} contacts imported successfully`);
      }
    } catch {
      error('Error', 'Failed to import contacts');
    } finally {
      setImporting(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Data</CardTitle>
              <CardDescription>Import and export your data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Exporting...' : 'Export All Data (CSV)'}
            </Button>
            <Button
              variant="outline" size="sm" className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Importing...' : 'Import Contacts'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </div>

          {/* Import results */}
          {importResult && (
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">
                Import Results: {importResult.imported} contact{importResult.imported !== 1 ? 's' : ''} imported
              </p>
              {importResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-destructive">{importResult.errors.length} error(s):</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-auto">
                    {importResult.errors.map((err, i) => (
                      <li key={i} className="pl-2 border-l-2 border-destructive/30">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setImportResult(null)}>
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
