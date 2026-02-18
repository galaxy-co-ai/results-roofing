'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  activeJobs: number;
  revenue: string;
  lastActive: string;
  avatar: string;
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Jake Sullivan', email: 'jake@resultsroofing.com', phone: '(816) 555-0100', role: 'Admin', activeJobs: 6, revenue: '$82,000', lastActive: 'Just now', avatar: 'JS' },
  { id: '2', name: 'Tyler Clark', email: 'tyler@resultsroofing.com', phone: '(816) 555-0101', role: 'Manager', activeJobs: 5, revenue: '$61,200', lastActive: '30 min ago', avatar: 'TC' },
  { id: '3', name: 'Anna Brooks', email: 'anna@resultsroofing.com', phone: '(816) 555-0102', role: 'Member', activeJobs: 3, revenue: '$41,000', lastActive: '2 hours ago', avatar: 'AB' },
  { id: '4', name: 'Marcus Johnson', email: 'marcus@resultsroofing.com', phone: '(816) 555-0103', role: 'Member', activeJobs: 2, revenue: '$28,500', lastActive: '1 day ago', avatar: 'MJ' },
  { id: '5', name: 'Rachel Kim', email: 'rachel@resultsroofing.com', phone: '(816) 555-0104', role: 'Member', activeJobs: 0, revenue: '$0', lastActive: '3 days ago', avatar: 'RK' },
];

const ROLE_STYLES: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  Manager: 'bg-blue-50 text-blue-700 border-blue-200',
  Member: 'bg-muted text-muted-foreground',
};

const ROLES = ['all', 'Admin', 'Manager', 'Member'];

export default function TeamPage() {
  const { success } = useToast();
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Member');

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

  function handleInvite() {
    if (!formName.trim() || !formEmail.trim()) return;
    const initials = formName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '—',
      role: formRole,
      activeJobs: 0,
      revenue: '$0',
      lastActive: 'Invited',
      avatar: initials,
    };
    setTeam(prev => [...prev, newMember]);
    setShowInviteDialog(false);
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('Member');
    success('Member invited', `Invitation sent to ${newMember.email}`);
  }

  function handleEdit() {
    if (!editMember || !formName.trim() || !formEmail.trim()) return;
    setTeam(prev => prev.map(m =>
      m.id === editMember.id ? { ...m, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim() || m.phone, role: formRole } : m
    ));
    setEditMember(null);
    success('Member updated', `${formName.trim()} updated`);
  }

  function handleDelete(member: TeamMember) {
    setTeam(prev => prev.filter(m => m.id !== member.id));
    setViewMember(null);
    success('Member removed', `${member.name} removed from team`);
  }

  function openEdit(member: TeamMember) {
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone);
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
          <p className="text-sm text-muted-foreground mt-1">{team.length} team members</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('Member'); setShowInviteDialog(true); }}>
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.slice(0, 3).map((member) => (
          <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewMember(member)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{member.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${ROLE_STYLES[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Jobs</p>
                      <p className="text-lg font-bold tabular-nums">{member.activeJobs}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                      <p className="text-lg font-bold tabular-nums">{member.revenue}</p>
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
              {roleFilter === 'all' ? 'Role' : roleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ROLES.map(r => (
              <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)}>
                {r === 'all' ? 'All Roles' : r}
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
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{m.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{m.email}</TableCell>
                <TableCell className="text-muted-foreground text-xs tabular-nums">{m.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${ROLE_STYLES[m.role]}`}>
                    {m.role}
                  </span>
                </TableCell>
                <TableCell className="text-center tabular-nums">{m.activeJobs}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{m.revenue}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{m.lastActive}</TableCell>
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
                  <Button variant="outline" className="w-full justify-start">{formRole}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setFormRole('Admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('Manager')}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('Member')}>Member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!formName.trim() || !formEmail.trim()}>Send Invite</Button>
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
                  <Button variant="outline" className="w-full justify-start">{formRole}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setFormRole('Admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('Manager')}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormRole('Member')}>Member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!formName.trim() || !formEmail.trim()}>Save Changes</Button>
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
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{viewMember.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{viewMember.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${ROLE_STYLES[viewMember.role]}`}>{viewMember.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-sm">{viewMember.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium text-sm tabular-nums">{viewMember.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Active Jobs</p><p className="font-medium text-sm tabular-nums">{viewMember.activeJobs}</p></div>
                <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium text-sm tabular-nums">{viewMember.revenue}</p></div>
                <div><p className="text-xs text-muted-foreground">Last Active</p><p className="font-medium text-sm">{viewMember.lastActive}</p></div>
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
