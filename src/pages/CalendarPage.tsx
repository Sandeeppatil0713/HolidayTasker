import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, CheckCircle2, Plane, Clock, Plus,
  ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format, isSameDay, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isToday, isSameMonth,
} from "date-fns";

interface Event {
  id: number;
  title: string;
  date: Date;
  type: "task" | "trip" | "deadline";
  time?: string;
  description?: string;
}

const sampleEvents: Event[] = [
  { id: 1, title: "Team standup",        date: new Date(2026, 2, 10), type: "task",     time: "10:00 AM", description: "Daily sync with team" },
  { id: 2, title: "Review Q4 report",    date: new Date(2026, 2, 10), type: "deadline", time: "2:00 PM",  description: "Final review before submission" },
  { id: 3, title: "Bali Trip",           date: new Date(2026, 2, 15), type: "trip",                       description: "7 days adventure" },
  { id: 4, title: "Project deadline",    date: new Date(2026, 2, 18), type: "deadline", time: "5:00 PM",  description: "Submit final deliverables" },
  { id: 5, title: "Dentist appointment", date: new Date(2026, 2, 20), type: "task",     time: "3:00 PM" },
  { id: 6, title: "Weekend getaway",     date: new Date(2026, 2, 22), type: "trip",                       description: "Mountain retreat" },
  { id: 7, title: "Client meeting",      date: new Date(2026, 2, 25), type: "task",     time: "11:00 AM", description: "Quarterly review" },
];

const EVENT_STYLES: Record<Event["type"], { bg: string; text: string; border: string; icon: React.ElementType }> = {
  task:     { bg: "bg-primary/10",     text: "text-primary",     border: "border-primary/20",     icon: CheckCircle2 },
  trip:     { bg: "bg-orange-100",      text: "text-orange-500",  border: "border-orange-200",     icon: Plane },
  deadline: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", icon: AlertCircle },
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events] = useState<Event[]>(sampleEvents);

  const selectedEvents = events.filter((e) => isSameDay(e.date, selectedDate));

  // Build full 6-week grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsOnDay = (day: Date) => events.filter((e) => isSameDay(e.date, day));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">Calendar</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks, trips, and deadlines</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Full-size calendar grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl card-glass p-5"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-heading text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents  = eventsOnDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const todayDay   = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative flex flex-col items-center rounded-xl p-1.5 min-h-[72px] transition-all text-left
                    ${isSelected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"}
                    ${!isCurrentMonth ? "opacity-30" : ""}
                  `}
                >
                  {/* Date number */}
                  <span className={`
                    text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                    ${todayDay && !isSelected ? "bg-accent text-accent-foreground" : ""}
                    ${isSelected ? "text-primary-foreground" : "text-foreground"}
                  `}>
                    {format(day, "d")}
                  </span>

                  {/* Event icons — max 3 */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const { icon: Icon, text, bg } = EVENT_STYLES[ev.type];
                      return (
                        <span
                          key={ev.id}
                          title={ev.title}
                          className={`
                            flex items-center justify-center w-5 h-5 rounded-full
                            ${isSelected ? "bg-white/20 text-primary-foreground" : `${bg} ${text}`}
                          `}
                        >
                          <Icon className="w-3 h-3" />
                        </span>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className={`text-[10px] font-bold ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border/40">
            {(Object.entries(EVENT_STYLES) as [Event["type"], typeof EVENT_STYLES[Event["type"]]][]).map(([type, s]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`flex items-center justify-center w-5 h-5 rounded-full ${s.bg} ${s.text}`}>
                  <s.icon className="w-3 h-3" />
                </span>
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* This Month stats */}
          <div className="rounded-xl card-glass p-5">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4">This Month</h3>
            <div className="space-y-3">
              {(["task", "trip", "deadline"] as Event["type"][]).map((type) => {
                const { icon: Icon, bg, text } = EVENT_STYLES[type];
                const labels = { task: "Tasks", trip: "Trips", deadline: "Deadlines" };
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg} ${text}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{labels[type]}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {events.filter((e) => e.type === type).length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected date events */}
          <div className="rounded-xl card-glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold font-heading text-foreground">
                {format(selectedDate, "MMM d, yyyy")}
              </h3>
            </div>
            {selectedEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedEvents.map((event) => {
                  const { icon: Icon, bg, text, border } = EVENT_STYLES[event.type];
                  return (
                    <div key={event.id} className={`p-3 rounded-lg border ${bg} ${text} ${border}`}>
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.title}</p>
                          {event.time && <p className="text-xs opacity-70 mt-0.5">{event.time}</p>}
                          {event.description && <p className="text-xs opacity-70 mt-1">{event.description}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events on this day</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl card-glass p-6"
      >
        <h2 className="text-lg font-semibold font-heading text-foreground mb-4">Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events
            .filter((e) => e.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 6)
            .map((event, i) => {
              const { icon: Icon, bg, text, border } = EVENT_STYLES[event.type];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                  className={`p-4 rounded-lg border ${bg} ${text} ${border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-background/40 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-1">{event.title}</p>
                      <p className="text-xs opacity-70">
                        {format(event.date, "MMM d, yyyy")}{event.time && ` • ${event.time}`}
                      </p>
                      {event.description && <p className="text-xs opacity-70 mt-1">{event.description}</p>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;

