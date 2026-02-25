'use client';

import { useState, useMemo } from 'react';
import { Search, Zap, Play, Pause, RefreshCw, Mail, MessageSquare, Clock, Star, DollarSign, Cloud, Wrench, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/Toast';
import {
  useOpsAutomations, useCreateAutomation, useUpdateAutomation,
} from '@/hooks/ops/use-ops-queries';
import type { OpsAutomation } from '@/types/ops';

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  category: string;
  icon: React.ElementType;
}

const CATEGORY_STYLES: Record<string, string> = {
  leads: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduling: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  sales: 'bg-purple-50 text-purple-700 border-purple-200',
  reputation: 'bg-amber-50 text-amber-700 border-amber-200',
  billing: 'bg-green-50 text-green-700 border-green-200',
  operations: 'bg-slate-100 text-slate-700 border-slate-200',
  proactive: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

// TODO: wire up category icons when template cards render per-category icons
// const CATEGORY_ICONS: Record<string, React.ElementType> = {
//   leads: Users, scheduling: Clock, sales: DollarSign, reputation: Star,
//   billing: DollarSign, operations: Wrench, proactive: Cloud,
// };

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'new-lead-followup',
    name: 'New Lead Follow-Up',
    description: 'Sends SMS + email within 5 minutes of new lead submission',
    trigger: 'New lead created',
    actions: ['Send welcome SMS', 'Send intro email', 'Notify team'],
    category: 'leads',
    icon: MessageSquare,
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Sends reminders 24hr and 1hr before scheduled appointments',
    trigger: 'Appointment scheduled',
    actions: ['SMS reminder 24hr before', 'SMS reminder 1hr before'],
    category: 'scheduling',
    icon: Clock,
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-Up',
    description: 'Follows up 3 days after sending a quote if no response',
    trigger: 'Quote sent + 3 days with no response',
    actions: ['Send follow-up email', 'Send follow-up SMS'],
    category: 'sales',
    icon: Mail,
  },
  {
    id: 'review-request',
    name: 'Review Request',
    description: 'Asks for Google review 3 days after job completion',
    trigger: 'Job marked complete + 3 days',
    actions: ['Send review request SMS with link', 'Send review request email'],
    category: 'reputation',
    icon: Star,
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    description: 'Sends reminder when balance is due in 3 days',
    trigger: 'Invoice due date - 3 days',
    actions: ['Send payment reminder email', 'Send payment reminder SMS'],
    category: 'billing',
    icon: DollarSign,
  },
  {
    id: 'stale-lead-nurture',
    name: 'Stale Lead Nurture',
    description: 'Re-engages leads that haven\'t responded in 14 days',
    trigger: 'Lead inactive for 14 days',
    actions: ['Send nurture email', 'Move to nurture pipeline stage'],
    category: 'leads',
    icon: Users,
  },
  {
    id: 'job-completion-notification',
    name: 'Job Completion Notification',
    description: 'Notifies customer and sends warranty info when job is marked complete',
    trigger: 'Job status changed to complete',
    actions: ['Send completion email with warranty docs', 'Send satisfaction survey SMS'],
    category: 'operations',
    icon: Wrench,
  },
  {
    id: 'weather-alert',
    name: 'Storm Follow-Up',
    description: 'Sends check-in message to past customers after severe weather in their area',
    trigger: 'Weather alert in service area',
    actions: ['Send storm check-in SMS to customers in affected zip codes'],
    category: 'proactive',
    icon: Cloud,
  },
];

const CATEGORIES = ['all', ...Array.from(new Set(AUTOMATION_TEMPLATES.map(t => t.category)))];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AutomationsPage() {
  const { success, error: showError } = useToast();
  const { data: automations = [], isLoading, refetch } = useOpsAutomations();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  async function handleRefresh() {
    try {
      await refetch();
      success('Refreshed');
    } catch {
      showError('Failed to refresh');
    }
  }

  // Map existing automations by templateId for quick lookup
  const automationsByTemplate = useMemo(() => {
    const map = new Map<string, OpsAutomation>();
    for (const a of automations) {
      if (a.templateId) map.set(a.templateId, a);
      // Also match by name for automations created before templateId existed
      const matchingTemplate = AUTOMATION_TEMPLATES.find(t => t.name === a.name);
      if (matchingTemplate && !map.has(matchingTemplate.id)) {
        map.set(matchingTemplate.id, a);
      }
    }
    return map;
  }, [automations]);

  const filteredTemplates = useMemo(() => {
    let result = AUTOMATION_TEMPLATES;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }
    return result;
  }, [search, categoryFilter]);

  const activeCount = Array.from(automationsByTemplate.values()).filter(a => a.status === 'active').length;
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);

  async function handleToggle(template: AutomationTemplate) {
    const existing = automationsByTemplate.get(template.id);
    if (existing) {
      // Toggle existing automation
      const newStatus = existing.status === 'active' ? 'paused' : 'active';
      try {
        await updateAutomation.mutateAsync({ id: existing.id, status: newStatus });
        success(
          newStatus === 'active' ? 'Automation activated' : 'Automation paused',
          `"${template.name}" is now ${newStatus}`
        );
      } catch {
        showError('Failed to update automation');
      }
    } else {
      // Create new automation from template
      try {
        await createAutomation.mutateAsync({
          name: template.name,
          templateId: template.id,
          trigger: template.trigger,
          actions: template.actions.join('; '),
        });
        success('Automation activated', `"${template.name}" is now running`);
      } catch {
        showError('Failed to activate automation');
      }
    }
  }

  function getTemplateStatus(templateId: string): 'active' | 'paused' | 'inactive' {
    const existing = automationsByTemplate.get(templateId);
    if (!existing) return 'inactive';
    return existing.status === 'active' ? 'active' : 'paused';
  }

  function getTemplateRuns(templateId: string): number {
    return automationsByTemplate.get(templateId)?.runs ?? 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Automations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${AUTOMATION_TEMPLATES.length} templates · ${activeCount} active`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Runs</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : totalRuns}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Saved</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{isLoading ? '\u2014' : `~${Math.round(totalRuns * 2.5)} min`}</p>
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
              {categoryFilter === 'all' ? 'Category' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {CATEGORIES.map(c => (
              <DropdownMenuItem key={c} onClick={() => setCategoryFilter(c)}>
                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const status = getTemplateStatus(template.id);
            const runs = getTemplateRuns(template.id);
            const Icon = template.icon;
            const isToggling = createAutomation.isPending || updateAutomation.isPending;

            return (
              <Card
                key={template.id}
                className={`transition-colors ${status === 'active' ? 'border-green-200 bg-green-50/30' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-sm leading-tight truncate">{template.name}</h3>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      CATEGORY_STYLES[template.category] || 'bg-muted text-muted-foreground'
                    }`}>
                      {template.category}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Zap className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{template.trigger}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Play className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span>{template.actions.length} action{template.actions.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {status !== 'inactive' && (
                        <span className="tabular-nums">{runs} run{runs !== 1 ? 's' : ''}</span>
                      )}
                      {status === 'active' && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active
                        </span>
                      )}
                      {status === 'paused' && (
                        <span className="flex items-center gap-1 text-muted-foreground font-medium">
                          <Pause className="h-3 w-3" />
                          Paused
                        </span>
                      )}
                    </div>
                    <Button
                      variant={status === 'active' ? 'outline' : 'default'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleToggle(template)}
                      disabled={isToggling}
                    >
                      {status === 'active' ? (
                        <><Pause className="h-3 w-3 mr-1" /> Pause</>
                      ) : status === 'paused' ? (
                        <><Play className="h-3 w-3 mr-1" /> Resume</>
                      ) : (
                        <><Play className="h-3 w-3 mr-1" /> Activate</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p className="text-sm">No automations match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
