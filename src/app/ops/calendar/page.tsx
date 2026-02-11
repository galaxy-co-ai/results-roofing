'use client';

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type EventType = 'appointment' | 'inspection' | 'installation' | 'follow-up';

interface CalEvent {
  time: string;
  title: string;
  type: EventType;
  address?: string;
}

const INITIAL_EVENTS: Record<number, CalEvent[]> = {
  3: [{ time: '9:00 AM', title: 'Roof Inspection', type: 'inspection', address: '2187 Herndon Ave' }],
  5: [
    { time: '10:00 AM', title: 'Estimate Appointment', type: 'appointment', address: '1 Carriage Dr' },
    { time: '2:00 PM', title: 'Follow-up Call', type: 'follow-up', address: 'John Davis' },
  ],
  8: [{ time: '7:00 AM', title: 'Installation - Day 1', type: 'installation', address: '445 Elm Street' }],
  9: [{ time: '7:00 AM', title: 'Installation - Day 2', type: 'installation', address: '445 Elm Street' }],
  11: [{ time: '2:00 PM', title: 'Roof Inspection', type: 'inspection', address: '123 Main St' }],
  12: [
    { time: '8:00 AM', title: 'Installation', type: 'installation', address: '789 Elm Ave' },
    { time: '3:00 PM', title: 'Estimate Appointment', type: 'appointment', address: '9 Sugar Bowl Ln' },
  ],
  15: [{ time: '10:00 AM', title: 'Follow-up', type: 'follow-up', address: 'Maria Lopez' }],
  18: [{ time: '9:00 AM', title: 'Inspection', type: 'inspection', address: '8812 Oak Park Blvd' }],
  22: [{ time: '7:00 AM', title: 'Installation - Day 1', type: 'installation', address: '2726 Askew Ave' }],
  23: [{ time: '7:00 AM', title: 'Installation - Day 2', type: 'installation', address: '2726 Askew Ave' }],
  24: [{ time: '7:00 AM', title: 'Installation - Day 3', type: 'installation', address: '2726 Askew Ave' }],
  26: [{ time: '11:00 AM', title: 'Estimate Appointment', type: 'appointment', address: '214 N 3rd St' }],
};

const TYPE_COLORS: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-800 border-blue-200',
  inspection: 'bg-purple-100 text-purple-800 border-purple-200',
  installation: 'bg-green-100 text-green-800 border-green-200',
  'follow-up': 'bg-amber-100 text-amber-800 border-amber-200',
};

function getCalendarData(month: number, year: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export default function CalendarPage() {
  const { success } = useToast();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<Record<number, CalEvent[]>>(INITIAL_EVENTS);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewEvent, setViewEvent] = useState<{ day: number; event: CalEvent } | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('9:00 AM');
  const [formType, setFormType] = useState<EventType>('appointment');
  const [formAddress, setFormAddress] = useState('');
  const [formDay, setFormDay] = useState(1);

  const { firstDay, daysInMonth } = getCalendarData(currentMonth, currentYear);
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const today = isCurrentMonth ? now.getDate() : -1;
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const upcomingEvents = Object.entries(events)
    .filter(([day]) => isCurrentMonth ? Number(day) >= now.getDate() : true)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 5);

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

  function openNewEvent(day?: number) {
    setFormTitle('');
    setFormTime('9:00 AM');
    setFormType('appointment');
    setFormAddress('');
    setFormDay(day || (isCurrentMonth ? now.getDate() : 1));
    setShowNewDialog(true);
  }

  function handleCreate() {
    if (!formTitle.trim()) return;
    const newEvent: CalEvent = {
      title: formTitle.trim(),
      time: formTime,
      type: formType,
      address: formAddress.trim() || undefined,
    };
    setEvents(prev => ({
      ...prev,
      [formDay]: [...(prev[formDay] || []), newEvent],
    }));
    setShowNewDialog(false);
    success('Event created', `${newEvent.title} on ${monthName.split(' ')[0]} ${formDay}`);
  }

  function handleDeleteEvent(day: number, index: number) {
    setEvents(prev => {
      const dayEvents = [...(prev[day] || [])];
      dayEvents.splice(index, 1);
      const next = { ...prev };
      if (dayEvents.length === 0) {
        delete next[day];
      } else {
        next[day] = dayEvents;
      }
      return next;
    });
    setViewEvent(null);
    success('Event deleted', 'Event removed from calendar');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Team scheduling and appointments</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openNewEvent()}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
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
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r min-h-[100px] p-1 bg-muted/20" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = events[day] || [];
                const isToday = day === today;

                return (
                  <div
                    key={day}
                    className={`border-b border-r min-h-[100px] p-1 cursor-pointer ${isToday ? 'bg-blue-50/50' : 'hover:bg-muted/20'} transition-colors`}
                    onClick={() => openNewEvent(day)}
                  >
                    <span className={`inline-flex items-center justify-center text-xs w-6 h-6 rounded-full ${
                      isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground'
                    }`}>
                      {day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map((event, ei) => (
                        <div
                          key={ei}
                          className={`text-[10px] px-1 py-0.5 rounded truncate border cursor-pointer hover:opacity-80 ${TYPE_COLORS[event.type]}`}
                          onClick={(e) => { e.stopPropagation(); setViewEvent({ day, event }); }}
                        >
                          {event.time} {event.title}
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
                  <span className="text-[11px] text-muted-foreground capitalize">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Upcoming */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No upcoming events</p>
              )}
              {upcomingEvents.map(([day, dayEvents]) =>
                dayEvents.map((event, i) => (
                  <div
                    key={`${day}-${i}`}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setViewEvent({ day: Number(day), event })}
                  >
                    <div className="text-center min-w-[36px]">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase">
                        {new Date(currentYear, currentMonth, Number(day)).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold tabular-nums">{day}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                      {event.address && <p className="text-xs text-muted-foreground truncate">{event.address}</p>}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1.5 border ${TYPE_COLORS[event.type]}`} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Unscheduled Jobs</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="p-2 rounded-lg border border-dashed cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openNewEvent()}>
                <p className="text-sm font-medium">8812 Oak Park Blvd</p>
                <p className="text-xs text-muted-foreground">New Lead - Needs appointment</p>
              </div>
              <div className="p-2 rounded-lg border border-dashed cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openNewEvent()}>
                <p className="text-sm font-medium">13790 Marine Dr</p>
                <p className="text-xs text-muted-foreground">Proposal Signed - Schedule install</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Event Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
            <DialogDescription>Add an event to the calendar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input id="event-title" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Roof Inspection" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formDay} onChange={e => setFormDay(Number(e.target.value))}>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{monthName.split(' ')[0]} {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formTime} onChange={e => setFormTime(e.target.value)}>
                  {['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formType} onChange={e => setFormType(e.target.value as EventType)}>
                  <option value="appointment">Appointment</option>
                  <option value="inspection">Inspection</option>
                  <option value="installation">Installation</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-address">Address / Contact</Label>
                <Input id="event-address" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="123 Main St" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={!!viewEvent} onOpenChange={(open) => !open && setViewEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewEvent?.event.title}</DialogTitle>
            <DialogDescription>Event details</DialogDescription>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{new Date(currentYear, currentMonth, viewEvent.day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {viewEvent.event.time}</span>
              </div>
              {viewEvent.event.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewEvent.event.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[viewEvent.event.type]}`}>
                  {viewEvent.event.type.charAt(0).toUpperCase() + viewEvent.event.type.slice(1)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (viewEvent) {
                  const idx = (events[viewEvent.day] || []).indexOf(viewEvent.event);
                  if (idx >= 0) handleDeleteEvent(viewEvent.day, idx);
                }
              }}
            >
              Delete
            </Button>
            <Button onClick={() => setViewEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
