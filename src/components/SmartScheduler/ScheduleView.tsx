import { format } from 'date-fns';
import { ScheduleSlot, ActivityType } from '../../soft-computing/types';

interface ScheduleViewProps {
  slots: ScheduleSlot[];
  title: string;
  className?: string;
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  work: '#437066',
  sleep: '#664e81',
  exercise: '#047857',
  personal: '#b45309',
  hobby: '#9d4a6b',
  meeting: '#b5371a',
  break: '#5c5345',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  work: 'Work',
  sleep: 'Sleep',
  exercise: 'Exercise',
  personal: 'Personal',
  hobby: 'Hobby',
  meeting: 'Meeting',
  break: 'Break',
};

const formatTime = (time: number) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time % 1) * 60);
  const normalizedHours = hours % 24;
  const date = new Date(2000, 0, 1, normalizedHours, minutes);
  return format(date, 'h:mm a');
};

export default function ScheduleView({ slots, title, className = '' }: ScheduleViewProps) {
  return (
    <div className={`card p-4 sm:p-6 min-w-0 ${className}`}>
      <h3 className="text-heading-sm font-semibold text-charcoal-900 mb-4">{title}</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 bg-cream-100 border border-border rounded-lg"
            style={{ borderLeft: `4px solid ${ACTIVITY_COLORS[slot.activity]}` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: ACTIVITY_COLORS[slot.activity] }}
              aria-hidden="true"
            >
              {ACTIVITY_LABELS[slot.activity].charAt(0)}
            </div>
            <div className="flex-1 min-w-[8rem]">
              <p className="font-medium text-charcoal-900 capitalize">{ACTIVITY_LABELS[slot.activity]}</p>
              <p className="text-sm text-charcoal-700">
                {(slot.end - slot.start).toFixed(1)} hrs {slot.isFixed && '(Fixed)'}
              </p>
            </div>
            <div className="text-sm text-charcoal-800 font-mono sm:text-right whitespace-nowrap">
              {`${formatTime(slot.start)} - ${formatTime(slot.end)}`}
            </div>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="text-center text-charcoal-700 py-8">No schedule generated</div>
        )}
      </div>
    </div>
  );
}
