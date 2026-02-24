'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  useOpsTeam, useInviteTeamMember, useUpdateTeamMember, useDeleteTeamMember,
} from '@/hooks/ops/use-ops-queries';
import type { OpsTeamMember } from '@/types/ops';

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  member: 'bg-muted text-muted-foreground',
};

const ROLES = ['all', 'admin', 'manager', 'member'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function capitalizeRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TeamPage() {
  const { success } = useToast();
  const { data: team = [], isLoading, refetch } = useOpsTeam();
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [viewMember, setViewMember] = useState<OpsTeamMember | null>(null);
  const [editMember, setEditMember] = useState<OpsTeamMember | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('member');

  const filtered = useMemo(() => {
    let result = team;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') result = result.filter(m => m.role === roleFilter);
    return result;
  }, [team, search, roleFilter]);

  async function handleInvite() {
    if (!formName.trim() || !formEmail.trim()) return;
    try {
      await inviteTeamMember.mutateAsync({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
      });
      setShowInviteDialog(false);
      setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('member');
      success('Member invited', `Invitation sent to ${formEmail.trim()}`);
    } catch {
      // Error handled by mutation
    }
  }

  async function handleEdit() {
    if (!editMember || !formName.trim() || !formEmail.trim()) return;
    try {
      await updateTeamMember.mutateAsync({
        id: editMember.id,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        role: formRole as OpsTeamMember['role'],
      });
      setEditMember(null);
      success('Member updated', `${formName.trim()} updated`);
    } catch {
      // Error handled by mutation
    }
  }

  async function handleDelete(member: OpsTeamMember) {
    try {
      await deleteTeamMember.mutateAsync(member.id);
      setViewMember(null);
      success('Member removed', `${member.name} removed from team`);
    } catch {
      // Error handled by mutation
    }
  }

  function openEdit(member: OpsTeamMember) {
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone || '');
    setFormRole(member.role);
    setEditMember(member);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Team
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${team.length} team member${team.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('member'); setShowInviteDialog(true); }}>
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : team.length === 0 ? (
        <Card>
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">No team members yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Invite your first team member to start tracking performance and assigning jobs.
            </p>
            <Button size="sm" className="mt-4 gap-2" onClick={() => { setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('member'); setShowInviteDialog(true); }}>
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Team Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.slice(0, 3).map((member) => (
              <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewMember(member)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{member.name}</h3>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${ROLE_STYLES[member.role]}`}>
                          {capitalizeRole(member.role)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Jobs</p>
                          <p className="text-lg font-bold tabular-nums">{member.activeJobs}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                          <p className="text-lg font-bold tabular-nums">${Number(member.revenue).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search team members..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {roleFilter === 'all' ? 'Role' : capitalizeRole(roleFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ROLES.map(r => (
                  <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)}>
                    {r === 'all' ? 'All Roles' : capitalizeRole(r)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Active Jobs</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} className="cursor-pointer" onClick={() => setViewMember(m)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{m.email}</TableCell>
                    <TableCell className="text-muted-foreground text-xs tabular-nums">{m.phone || '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${ROLE_STYLES[m.role]}`}>
                        {capitalizeRole(m.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{m.activeJobs}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">${Number(m.revenue).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(m.lastActiveAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(ev) => ev.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setViewMember(m); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); openEdit(m); }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); handleDelete(m); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No team members match your search</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="john@resultsroofing.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(816) 555-0105" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">{capitalizeRole(formRole)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setFormRole('admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('manager')}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('member')}>Member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button
              onClick={handleInvite}
              disabled={!formName.trim() || !formEmail.trim() || inviteTeamMember.isPending}
            >
              {inviteTeamMember.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Team Member</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">{capitalizeRole(formRole)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setFormRole('admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('manager')}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('member')}>Member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button
              onClick={handleEdit}
              disabled={!formName.trim() || !formEmail.trim() || updateTeamMember.isPending}
            >
              {updateTeamMember.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Dialog */}
      <Dialog open={!!viewMember} onOpenChange={() => setViewMember(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Team Member Profile</DialogTitle></DialogHeader>
          {viewMember && (
            <DialogBody className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(viewMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{viewMember.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${ROLE_STYLES[viewMember.role]}`}>{capitalizeRole(viewMember.role)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-sm">{viewMember.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium text-sm tabular-nums">{viewMember.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Jobs</p><p className="font-medium text-sm tabular-nums">{viewMember.activeJobs}</p></div>
                <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium text-sm tabular-nums">${Number(viewMember.revenue).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Last Active</p><p className="font-medium text-sm">{formatDate(viewMember.lastActiveAt)}</p></div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (viewMember) openEdit(viewMember); setViewMember(null); }}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => viewMember && handleDelete(viewMember)}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
