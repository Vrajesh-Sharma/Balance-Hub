import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, AlertCircle, Brain, Zap, Trash2, ChevronDown, X, Timer } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { mockApi } from '../lib/dummyData';
import { Link } from 'react-router-dom';

interface Schedule {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  category: string;
  template_name?: string;
}

const templates = [
  {
    name: 'Morning Routine',
    color: 'bg-sage-100 text-sage-800 border border-sage-300',
    schedule: [
      { time: '06:00', activity: 'Morning Workout', duration: 45 },
      { time: '07:00', activity: 'Breakfast & Planning', duration: 30 },
      { time: '08:00', activity: 'Deep Work Session', duration: 120 },
    ],
  },
  {
    name: 'Focus Day',
    color: 'bg-lavender-100 text-lavender-800 border border-lavender-300',
    schedule: [
      { time: '09:00', activity: 'Team Meeting', duration: 60 },
      { time: '10:30', activity: 'Project Work', duration: 180 },
      { time: '14:00', activity: 'Learning Session', duration: 90 },
    ],
  },
  {
    name: 'Balanced Day',
    color: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    schedule: [
      { time: '08:00', activity: 'Exercise', duration: 60 },
      { time: '10:00', activity: 'Work Block', duration: 180 },
      { time: '14:00', activity: 'Lunch & Walk', duration: 60 },
      { time: '15:30', activity: 'Personal Time', duration: 120 },
    ],
  },
  {
    name: 'Evening Wind-down',
    color: 'bg-honey-100 text-amber-800 border border-honey-300',
    schedule: [
      { time: '17:00', activity: 'Wrap Up Work', duration: 30 },
      { time: '17:30', activity: 'Light Exercise', duration: 45 },
      { time: '18:30', activity: 'Dinner', duration: 60 },
      { time: '19:30', activity: 'Reading/Hobby', duration: 90 },
      { time: '21:00', activity: 'Meditation', duration: 20 },
    ],
  },
];

export default function HabitPlanner() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('month');
  const calendarRef = React.useRef<FullCalendar>(null);

  React.useEffect(() => {
    loadSchedules();
  }, [currentMonth]);

  React.useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(new Date());
    }
  }, []);

  React.useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api && viewMode === 'month') {
      api.gotoDate(new Date());
    }
  }, [viewMode]);

  React.useEffect(() => {
    if (!showTemplateModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTemplateModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showTemplateModal]);

  const loadSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = startOfMonth(subMonths(currentMonth, 1));
      const end = endOfMonth(addMonths(currentMonth, 1));

      const { data, error } = await mockApi.getSchedules(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      if (error) throw error;
      // Map ScheduleEvent[] to Schedule[] - add default category if missing
      const mappedSchedules: Schedule[] = (data || []).map(s => ({
        ...s,
        category: s.template_name || 'personal',
      }));
      setSchedules(mappedSchedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setShowTemplateModal(true);
  };

  const handleEventClick = (info: any) => {
    if (confirm(`Delete "${info.event.title}"?`)) {
      deleteEvent(info.event.id);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await mockApi.deleteSchedule(id);
      if (error) throw error;
      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const applyTemplate = async (template: typeof templates[0]) => {
    setLoading(true);
    setError(null);
    try {
      const schedulePromises = template.schedule.map((item) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + item.duration);

        return mockApi.createSchedule(
          item.activity,
          format(startTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          format(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          template.name
        );
      });

      await Promise.all(schedulePromises);
      await loadSchedules();
      setShowTemplateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (start: string, end: string) => {
    return `${format(new Date(start), 'HH:mm')} - ${format(new Date(end), 'HH:mm')}`;
  };

  const calendarEvents = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.title,
    start: schedule.start_time,
    end: schedule.end_time,
    backgroundColor: '#437066',
    borderColor: '#385a52',
    extendedProps: {
      category: schedule.category,
    },
  }));

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 lg:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="page-title">Habit Planner</h1>
            <p className="page-subtitle">Plan and visualize your daily routines</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/smart-scheduler"
              className="btn-primary btn-sm"
            >
              <Brain className="h-4 w-4" />
              Optimize with AI
            </Link>
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setShowTemplateModal(true);
              }}
              className="btn-secondary btn-sm"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 bg-coral-100 border border-coral-200 rounded-lg text-coral-800"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Calendar View Toggle */}
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode('month');
                calendarRef.current?.getApi().changeView('dayGridMonth');
              }}
              className={viewMode === 'month' ? 'nav-link-active' : 'nav-link-inactive'}
            >
              Month
            </button>
            <button
              onClick={() => {
                setViewMode('week');
                calendarRef.current?.getApi().changeView('timeGridWeek');
              }}
              className={viewMode === 'week' ? 'nav-link-active' : 'nav-link-inactive'}
            >
              Week
            </button>
          </div>
          
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  calendarRef.current?.getApi().prev();
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                aria-label="Previous period"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
              <span className="font-semibold text-charcoal-900 min-w-[130px] sm:min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => {
                  calendarRef.current?.getApi().next();
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                aria-label="Next period"
              >
                <ChevronDown className="h-5 w-5 -rotate-90" />
              </button>
            </div>
            <button
              onClick={() => {
                calendarRef.current?.getApi().today();
              }}
              className="btn-secondary btn-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card overflow-x-auto"
        >
          <div className={`planner-calendar p-2 sm:p-4 ${viewMode === 'week' ? 'min-w-[640px]' : 'min-w-[320px]'}`}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={viewMode === 'month' ? 'dayGridMonth' : 'timeGridWeek'}
            initialDate={new Date()}
            now={new Date()}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            events={calendarEvents}
            height="auto"
            headerToolbar={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false,
            }}
            eventDisplay="block"
            slotEventOverlap={false}
            eventContent={(eventInfo) => (
              <div className="p-1.5 h-full flex flex-col justify-between">
                <span className="text-xs font-medium truncate">
                  {eventInfo.timeText}
                </span>

                <span className="text-xs truncate">
                  {eventInfo.event.title}
                </span>

                {eventInfo.event.extendedProps.category && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-center truncate">
                    {eventInfo.event.extendedProps.category}
                  </span>
                )}
              </div>
            )}
            dayHeaderClassNames="bg-cream-100 text-charcoal-700 font-medium py-2"
            dayCellClassNames={(arg) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const cellDate = new Date(arg.date);
              cellDate.setHours(0, 0, 0, 0);

              if (cellDate.getTime() === today.getTime()) {
                return 'bg-sage-50 border-border';
              }

              return 'border-border';
            }}
            datesSet={(info) => {
              setCurrentMonth(info.view.currentStart);
            }}
          />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-charcoal-700 tracking-wide uppercase">This Month</p>
                <p className="text-heading-lg font-display font-bold text-charcoal-900 mt-1.5 truncate">{schedules.length}</p>
                <p className="text-caption text-charcoal-600 mt-0.5">Schedules</p>
              </div>
              <div className="p-2.5 rounded-lg bg-sage-100 text-sage-700 flex-shrink-0">
                <CalendarIcon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-charcoal-700 tracking-wide uppercase">Hours Scheduled</p>
                <p className="text-heading-lg font-display font-bold text-charcoal-900 mt-1.5 truncate">
                  {schedules.reduce((sum, s) => {
                    const start = new Date(s.start_time);
                    const end = new Date(s.end_time);
                    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}
                </p>
                <p className="text-caption text-charcoal-600 mt-0.5">Total hours</p>
              </div>
              <div className="p-2.5 rounded-lg bg-lavender-100 text-lavender-700 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-charcoal-700 tracking-wide uppercase">Categories</p>
                <p className="text-heading-lg font-display font-bold text-charcoal-900 mt-1.5 truncate">
                  {new Set(schedules.map(s => s.category)).size}
                </p>
                <p className="text-caption text-charcoal-600 mt-0.5">Active</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                <Brain className="h-5 w-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-charcoal-700 tracking-wide uppercase">Avg/Day</p>
                <p className="text-heading-lg font-display font-bold text-charcoal-900 mt-1.5 truncate">
                  {(schedules.length / Math.max(new Set(schedules.map(s => s.start_time.split('T')[0])).size, 1)).toFixed(1)}
                </p>
                <p className="text-caption text-charcoal-600 mt-0.5">Per day</p>
              </div>
              <div className="p-2.5 rounded-lg bg-lavender-100 text-lavender-700 flex-shrink-0">
                <Timer className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Events List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-heading-md font-bold text-charcoal-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-sage-700" />
              Upcoming Schedule
            </h2>
          </div>
          
          <div className="divide-y divide-border">
            {schedules
              .filter(s => new Date(s.start_time) >= new Date())
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .slice(0, 10)
              .map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-cream-100 transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center justify-center min-w-[56px] px-3 py-2 bg-cream-100 rounded-lg border border-border shrink-0">
                      <span className="font-medium text-charcoal-900 text-sm">{format(new Date(schedule.start_time), 'MMM')}</span>
                      <span className="font-display font-bold text-xl text-sage-700">{format(new Date(schedule.start_time), 'd')}</span>
                      <span className="text-xs text-charcoal-600">{format(new Date(schedule.start_time), 'EEE')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-charcoal-900 truncate">{schedule.title}</p>
                      <p className="text-sm text-charcoal-700 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{formatEventTime(schedule.start_time, schedule.end_time)}</span>
                        {schedule.category && (
                          <>
                            <span className="text-charcoal-700">·</span>
                            <span className="px-2 py-0.5 bg-charcoal-100 rounded text-xs">{schedule.category}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(schedule.id)}
                    className="p-2 text-charcoal-600 hover:text-coral-700 hover:bg-coral-100 rounded-lg transition-colors inline-flex items-center justify-center min-h-[40px] min-w-[40px] md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            {schedules.length === 0 && (
              <div className="p-10 text-center text-charcoal-600">
                <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-charcoal-700" />
                <p className="text-body-md">No schedules yet</p>
                <p className="text-sm text-charcoal-700 mt-1">Click any date to add your first habit</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Template Modal */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowTemplateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="modal-content max-w-lg"
                role="dialog"
                aria-modal="true"
                aria-label="Add schedule"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h2 className="text-heading-md font-bold text-charcoal-900 min-w-0">
                    Add Schedule for {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  {templates.map((template) => (
                    <motion.button
                      key={template.name}
                      onClick={() => applyTemplate(template)}
                      disabled={loading}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-lg transition-all duration-200 bg-cream-100 border border-border hover:border-sage-300 hover:bg-sage-50 disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${template.color} shrink-0`}>
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-charcoal-900">{template.name}</h3>
                          <p className="text-sm text-charcoal-700 mt-1">
                            {template.schedule.length} activities · {template.schedule.reduce((sum, s) => sum + s.duration, 0)} min total
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {template.schedule.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-border rounded text-xs text-charcoal-700">
                                {item.time} {item.activity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Zap className="h-5 w-5 text-sage-700 shrink-0 self-center" />
                      </div>
                    </motion.button>
                  ))}

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setShowTemplateModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}