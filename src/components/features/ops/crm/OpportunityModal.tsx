'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Opportunity, PipelineStage } from '@/types/ops';

type ModalMode = 'view' | 'edit' | 'create';

interface OpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ModalMode;
  opportunity?: Opportunity | null;
  stages: PipelineStage[];
  pipelineId: string;
  onSave: (data: OpportunityFormData) => void;
  saving?: boolean;
}

export interface OpportunityFormData {
  name: string;
  pipelineStageId: string;
  monetaryValue: number;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'abandoned', label: 'Abandoned' },
] as const;

export function OpportunityModal({
  open,
  onOpenChange,
  mode,
  opportunity,
  stages,
  pipelineId: _pipelineId,
  onSave,
  saving = false,
}: OpportunityModalProps) {
  const [form, setForm] = useState<OpportunityFormData>({
    name: '',
    pipelineStageId: stages[0]?.id || '',
    monetaryValue: 0,
    contactId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'open',
  });

  // Sync form with opportunity data when modal opens
  useEffect(() => {
    if (mode === 'create') {
      setForm({
        name: '',
        pipelineStageId: stages[0]?.id || '',
        monetaryValue: 0,
        contactId: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        status: 'open',
      });
    } else if (opportunity) {
      setForm({
        name: opportunity.name,
        pipelineStageId: opportunity.pipelineStageId,
        monetaryValue: opportunity.monetaryValue || 0,
        contactId: opportunity.contactId,
        contactName: opportunity.contact?.name || '',
        contactEmail: opportunity.contact?.email || '',
        contactPhone: opportunity.contact?.phone || '',
        status: opportunity.status,
      });
    }
  }, [mode, opportunity, stages]);

  const isReadOnly = mode === 'view';

  const title =
    mode === 'create'
      ? 'New Deal'
      : mode === 'edit'
        ? 'Edit Deal'
        : opportunity?.name || 'Deal Details';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSave(form);
  };

  const stageName =
    stages.find((s) => s.id === form.pipelineStageId)?.name || 'Unknown';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {/* Deal Name */}
            <div className="space-y-1.5">
              <Label htmlFor="deal-name">Deal Name</Label>
              {isReadOnly ? (
                <p className="text-sm">{form.name}</p>
              ) : (
                <Input
                  id="deal-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Smith Roof Replacement"
                  required
                />
              )}
            </div>

            {/* Stage + Value row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deal-stage">Stage</Label>
                {isReadOnly ? (
                  <p className="text-sm">{stageName}</p>
                ) : (
                  <select
                    id="deal-stage"
                    value={form.pipelineStageId}
                    onChange={(e) =>
                      setForm({ ...form, pipelineStageId: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deal-value">Value ($)</Label>
                {isReadOnly ? (
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(form.monetaryValue)}
                  </p>
                ) : (
                  <Input
                    id="deal-value"
                    type="number"
                    min={0}
                    step={100}
                    value={form.monetaryValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monetaryValue: Number(e.target.value),
                      })
                    }
                  />
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="deal-status">Status</Label>
              {isReadOnly ? (
                <p className="text-sm capitalize">{form.status}</p>
              ) : (
                <select
                  id="deal-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as OpportunityFormData['status'],
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Contact Info */}
            <fieldset className="space-y-3 rounded-lg border p-4">
              <legend className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contact
              </legend>

              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                {isReadOnly ? (
                  <p className="text-sm">{form.contactName || '—'}</p>
                ) : (
                  <Input
                    id="contact-name"
                    value={form.contactName}
                    onChange={(e) =>
                      setForm({ ...form, contactName: e.target.value })
                    }
                    placeholder="Contact name"
                    required={mode === 'create'}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  {isReadOnly ? (
                    <p className="text-sm">
                      {form.contactEmail ? (
                        <a
                          href={`mailto:${form.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {form.contactEmail}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  ) : (
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) =>
                        setForm({ ...form, contactEmail: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">Phone</Label>
                  {isReadOnly ? (
                    <p className="text-sm">
                      {form.contactPhone ? (
                        <a
                          href={`tel:${form.contactPhone}`}
                          className="text-primary hover:underline"
                        >
                          {form.contactPhone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  ) : (
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) =>
                        setForm({ ...form, contactPhone: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  )}
                </div>
              </div>
            </fieldset>

            {/* Created date (view only) */}
            {isReadOnly && opportunity?.createdAt && (
              <div className="space-y-1.5">
                <Label>Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(opportunity.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Deal'
                    : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
