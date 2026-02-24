'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw, Plus, Pencil, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody,
} from '@/components/ui/dialog';
import { useOpsCalendar, useCreateAppointment, useUpdateAppointment, useCancelAppointment } from '@/hooks/ops/use-ops-queries';
import { useToast } from '@/components/ui/Toast';
import type { OpsAppointment } from '@/types/ops';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_COLORS: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-800 border-blue-200',
  inspection: 'bg-purple-100 text-purple-800 border-purple-200',
  installation: 'bg-green-100 text-green-800 border-green-200',
  follow_up: 'bg-amber-100 text-amber-800 border-amber-200',
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getCalendarData(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

// Default form state for create/edit
const EMPTY_FORM = {
  type: 'installation' as string,
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  attendeeName: '',
  attendeeEmail: '',
  attendeePhone: '',
  address: '',
  notes: '',
  orderId: '',
};

export default function CalendarPage() {
  const now = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewEvent, setViewEvent] = useState<OpsAppointment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<OpsAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OpsAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const { data: appointments = [], isLoading, refetch } = useOpsCalendar(monthKey);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const { success, error: toastError } = useToast();

  const { firstDay, daysInMonth } = getCalendarData(currentMonth, currentYear);
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const today = isCurrentMonth ? now.getDate() : -1;
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group appointments by day of month
  const eventsByDay = useMemo(() => {
    const map: Record<number, OpsAppointment[]> = {};
    for (const apt of appointments) {
      const d = new Date(apt.scheduledStart);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(apt);
      }
    }
    return map;
  }, [appointments, currentMonth, currentYear]);

  // Upcoming events (from today or start of month)
  const upcoming = useMemo(() => {
    const cutoff = isCurrentMonth ? now.getDate() : 1;
    return appointments
      .filter(a => {
        const d = new Date(a.scheduledStart).getDate();
        return d >= cutoff && a.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
      .slice(0, 5);
  }, [appointments, isCurrentMonth, now]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }

  function goToday() {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowCreate(true);
  }

  function openEdit(apt: OpsAppointment) {
    const start = new Date(apt.scheduledStart);
    const end = new Date(apt.scheduledEnd);
    setForm({
      type: apt.type,
      date: start.toISOString().split('T')[0],
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      attendeeName: apt.attendeeName || '',
      attendeeEmail: apt.attendeeEmail || '',
      attendeePhone: '',
      address: apt.address || '',
      notes: apt.notes || '',
      orderId: apt.orderId,
    });
    setEditEvent(apt);
    setViewEvent(null);
  }

  function handleCreate() {
    if (!form.orderId || !form.date || !form.startTime || !form.endTime) {
      toastError('Missing fields', 'Order ID, date, and times are required');
      return;
    }
    const scheduledStart = new Date(`${form.date}T${form.startTime}`).toISOString();
    const scheduledEnd = new Date(`${form.date}T${form.endTime}`).toISOString();

    createAppointment.mutate(
      {
        orderId: form.orderId,
        type: form.type,
        scheduledStart,
        scheduledEnd,
        attendeeName: form.attendeeName || undefined,
        attendeeEmail: form.attendeeEmail || undefined,
        attendeePhone: form.attendeePhone || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          success('Appointment created');
          setShowCreate(false);
        },
        onError: (err) => toastError('Failed to create', err.message),
      }
    );
  }

  function handleEdit() {
    if (!editEvent) return;
    const scheduledStart = new Date(`${form.date}T${form.startTime}`).toISOString();
    const scheduledEnd = new Date(`${form.date}T${form.endTime}`).toISOString();

    updateAppointment.mutate(
      {
        id: editEvent.id,
        type: form.type,
        scheduledStart,
        scheduledEnd,
        attendeeName: form.attendeeName || undefined,
        attendeeEmail: form.attendeeEmail || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          success('Appointment updated');
          setEditEvent(null);
        },
        onError: (err) => toastError('Failed to update', err.message),
      }
    );
  }

  function handleCancel() {
    if (!cancelTarget) return;
    cancelAppointment.mutate(
      { id: cancelTarget.id, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          success('Appointment cancelled');
          setCancelTarget(null);
          setCancelReason('');
        },
        onError: (err) => toastError('Failed to cancel', err.message),
      }
    );
  }

  // Shared form fields used in both create and edit dialogs
  const formFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="apt-type">Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger id="apt-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="installation">Installation</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apt-date">Date</Label>
          <Input id="apt-date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="apt-start">Start Time</Label>
          <Input id="apt-start" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apt-end">End Time</Label>
          <Input id="apt-end" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
        </div>
      </div>
      {!editEvent && (
        <div className="space-y-2">
          <Label htmlFor="apt-order">Order ID</Label>
          <Input id="apt-order" placeholder="Order UUID" value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="apt-name">Attendee Name</Label>
          <Input id="apt-name" placeholder="Name" value={form.attendeeName} onChange={e => setForm(f => ({ ...f, attendeeName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apt-email">Attendee Email</Label>
          <Input id="apt-email" type="email" placeholder="Email" value={form.attendeeEmail} onChange={e => setForm(f => ({ ...f, attendeeEmail: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-phone">Attendee Phone</Label>
        <Input id="apt-phone" placeholder="Phone" value={form.attendeePhone} onChange={e => setForm(f => ({ ...f, attendeePhone: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-notes">Notes</Label>
        <Input id="apt-notes" placeholder="Optional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? '...' : `${appointments.length} appointments this month`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Calendar Grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{monthName}</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={goToday}>Today</Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="h-24 flex-1" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-t border-l">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-b border-r min-h-[100px] p-1 bg-muted/20" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = eventsByDay[day] || [];
                    const isToday = day === today;

                    return (
                      <div
                        key={day}
                        className={`border-b border-r min-h-[100px] p-1 ${isToday ? 'bg-blue-50/50' : ''}`}
                      >
                        <span className={`inline-flex items-center justify-center text-xs w-6 h-6 rounded-full ${
                          isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground'
                        }`}>
                          {day}
                        </span>
                        <div className="mt-0.5 space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[10px] px-1 py-0.5 rounded truncate border cursor-pointer hover:opacity-80 ${TYPE_COLORS[event.type] || TYPE_COLORS.appointment}`}
                              onClick={() => setViewEvent(event)}
                            >
                              {formatTime(event.scheduledStart)} {event.attendeeName || event.type}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-sm border ${cls}`} />
                      <span className="text-[11px] text-muted-foreground capitalize">{type.replace('_', '-')}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No upcoming appointments</p>
              ) : (
                upcoming.map((apt) => {
                  const d = new Date(apt.scheduledStart);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setViewEvent(apt)}
                    >
                      <div className="text-center min-w-[36px]">
                        <div className="text-[10px] font-medium text-muted-foreground uppercase">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold tabular-nums">{d.getDate()}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{apt.attendeeName || apt.type}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(apt.scheduledStart)}</p>
                        {apt.address && <p className="text-xs text-muted-foreground truncate">{apt.address}</p>}
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 border ${TYPE_COLORS[apt.type] || TYPE_COLORS.appointment}`} />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Month Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium tabular-nums">{appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span className="font-medium tabular-nums">{appointments.filter(a => a.status === 'scheduled').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium tabular-nums">{appointments.filter(a => a.status === 'completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span className="font-medium tabular-nums">{appointments.filter(a => a.status === 'cancelled').length}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Event Dialog */}
      <Dialog open={!!viewEvent} onOpenChange={(open) => !open && setViewEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewEvent?.attendeeName || viewEvent?.type}</DialogTitle>
            <DialogDescription>Appointment details</DialogDescription>
          </DialogHeader>
          {viewEvent && (
            <DialogBody className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(viewEvent.scheduledStart).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {formatTime(viewEvent.scheduledStart)} – {formatTime(viewEvent.scheduledEnd)}
                </span>
              </div>
              {viewEvent.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewEvent.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[viewEvent.type] || TYPE_COLORS.appointment}`}>
                  {viewEvent.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  viewEvent.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                  viewEvent.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {viewEvent.status.charAt(0).toUpperCase() + viewEvent.status.slice(1)}
                </div>
              </div>
              {viewEvent.attendeeEmail && (
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{viewEvent.attendeeEmail}</p></div>
              )}
              {viewEvent.notes && (
                <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{viewEvent.notes}</p></div>
              )}
            </DialogBody>
          )}
          <DialogFooter>
            {viewEvent && viewEvent.status !== 'cancelled' && viewEvent.status !== 'completed' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCancelTarget(viewEvent); setViewEvent(null); }}
                >
                  <Ban className="h-4 w-4 mr-2" /> Cancel Appointment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(viewEvent)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
              </>
            )}
            <Button onClick={() => setViewEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {formFields}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createAppointment.isPending}>
              {createAppointment.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {formFields}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateAppointment.isPending}>
              {updateAppointment.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment for {cancelTarget?.attendeeName || cancelTarget?.type}?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason (optional)</Label>
              <Input
                id="cancel-reason"
                placeholder="Why is this being cancelled?"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelTarget(null); setCancelReason(''); }}>Keep Appointment</Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
