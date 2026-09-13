import React from 'react';
import { format } from 'date-fns';
import { ScheduleSlot, ActivityType } from '../../../soft-computing/types';

interface ScheduleViewProps {
  slots: ScheduleSlot[];
  title: string;
  className?: string;
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  work: '#3b82f6',
  sleep: '#8b5cf6',
  exercise: '#10b981',
  personal: '#f59e0b',
  hobby: '#ec4899',
  meeting: '#ef4444',
  break: '#6b7280',
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

export default function ScheduleView({ slots, title, className = '' }: ScheduleViewProps) {
  return (
    <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
            style={{ borderLeft: `4px solid ${ACTIVITY_COLORS[slot.activity]}` }}
          >
            <div className="w-20 text-right text-sm text-gray-400 font-mono">
              {format(new Date(`2000-01-01T${String(Math.floor(slot.start)).padStart(2, '0')}:${(slot.start % 1) * 60}:00`), 'h:mm a')} -{' '}
              {format(new Date(`2000-01-01T${String(Math.floor(slot.end)).padStart(2, '0')}:${(slot.end % 1) * 60}:00`), 'h:mm a')}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
              style={{ backgroundColor: ACTIVITY_COLORS[slot.activity] }}
            >
              {ACTIVITY_LABELS[slot.activity].charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium capitalize">{ACTIVITY_LABELS[slot.activity]}</p>
              <p className="text-sm text-gray-400">
                {(slot.end - slot.start).toFixed(1)} hrs {slot.isFixed && '(Fixed)'}
              </p>
            </div>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="text-center text-gray-400 py-8">No schedule generated</div>
        )}
      </div>
    </div>
  );
}