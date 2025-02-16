import React from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { mockApi } from '../lib/dummyData';

const templates = [
  {
    name: 'Morning Routine',
    schedule: [
      { time: '06:00', activity: 'Morning Workout' },
      { time: '07:00', activity: 'Breakfast & Planning' },
      { time: '08:00', activity: 'Deep Work Session' },
    ],
  },
  {
    name: 'Focus Day',
    schedule: [
      { time: '09:00', activity: 'Team Meeting' },
      { time: '10:00', activity: 'Project Work' },
      { time: '14:00', activity: 'Learning Session' },
    ],
  },
  {
    name: 'Balanced Day',
    schedule: [
      { time: '08:00', activity: 'Exercise' },
      { time: '10:00', activity: 'Work Block' },
      { time: '15:00', activity: 'Personal Time' },
    ],
  },
];

export default function HabitPlanner() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  const [schedules, setSchedules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { data, error } = await mockApi.getSchedules(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      if (error) throw error;
      setSchedules(data || []);
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

  const applyTemplate = async (template: typeof templates[0]) => {
    setLoading(true);
    setError(null);
    try {
      const baseDate = format(selectedDate, 'yyyy-MM-dd');
      const schedulePromises = template.schedule.map((item) => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 45); // Default duration of 45 minutes

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Habit Planner</h1>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Schedule
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500 bg-opacity-10 p-4 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-xl">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          events={schedules.map((schedule) => ({
            title: schedule.title,
            start: schedule.start_time,
            end: schedule.end_time,
            backgroundColor: '#0891b2', // cyan-600
          }))}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
        />
      </div>

      {showTemplateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
            }
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Add Schedule for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            <div className="space-y-4">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon size={24} className="text-cyan-500 shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-400">
                      {template.schedule.length} activities
                    </p>
                  </div>
                </button>
              ))}

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}