'use client';

import { Save, Building2, GitBranch, Link2, Bell, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/Toast';

const INTEGRATIONS = [
  { name: 'Stripe', description: 'Payment processing', connected: true, icon: '💳' },
  { name: 'Resend', description: 'Email delivery', connected: true, icon: '📧' },
  { name: 'SignalWire', description: 'SMS messaging', connected: false, icon: '📱' },
  { name: 'Google Solar', description: 'Satellite measurements', connected: true, icon: '🛰️' },
  { name: 'Cal.com', description: 'Scheduling', connected: false, icon: '📅' },
  { name: 'Documenso', description: 'Document signing', connected: false, icon: '📝' },
];

const PIPELINE_STAGES = [
  'New Lead', 'Appointment Scheduled', 'Measurement Complete', 'Proposal Sent',
  'Proposal Signed', 'Pre-Production', 'Materials Ordered', 'In Progress',
  'Punch List', 'Complete',
];

export default function SettingsPage() {
  const { info, success } = useToast();
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your ops dashboard</p>
      </div>

      {/* Company Profile */}
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
              <Input id="company" defaultValue="Results Roofing" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="(816) 555-0100" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="1234 Main St, Kansas City, MO 64108" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="info@resultsroofing.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License #</Label>
              <Input id="license" defaultValue="ROO-2024-1234" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="gap-2" onClick={() => success('Saved', 'Company profile updated successfully')}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
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
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors group">
                <span className="text-xs text-muted-foreground tabular-nums w-5">{i + 1}</span>
                <span className="text-sm flex-1">{stage}</span>
                <Button variant="ghost" size="sm" className="h-6 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => info('Coming soon', 'Pipeline stage editing is under development')}>
                  Edit
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => info('Coming soon', 'Adding pipeline stages is under development')}>
            + Add Stage
          </Button>
        </CardContent>
      </Card>

      {/* Integrations */}
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
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => info('Coming soon', `${int.name} integration is under development`)}>
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
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
            {['New lead received', 'Proposal signed', 'Payment received', 'Invoice overdue', 'Task overdue'].map((item) => (
              <div key={item} className="flex items-center justify-between p-2">
                <span className="text-sm">{item}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" /> Email
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded" /> SMS
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
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
        <CardContent>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => info('Coming soon', 'Data export is under development')}>Export All Data (CSV)</Button>
            <Button variant="outline" size="sm" onClick={() => info('Coming soon', 'Contact import is under development')}>Import Contacts</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
