import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Timer, Target, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, startOfWeek, endOfWeek } from 'date-fns';

interface TimeLog {
  id: string;
  date: string;
  punchIn: string;
  punchOut: string;
  duration: number;
}

const WorkTimeTracker: React.FC = () => {
  const [weeklyGoal, setWeeklyGoal] = useState<number>(localStorage.getItem('weeklyGoal') ? Number(localStorage.getItem('weeklyGoal')) : 0);
  const [showGoalModal, setShowGoalModal] = useState(!localStorage.getItem('weeklyGoal'));
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'error'>('success');

  useEffect(() => {
    const savedLogs = localStorage.getItem('timeLogs');
    if (savedLogs) {
      setTimeLogs(JSON.parse(savedLogs));
    }
  }, []);

  const saveTimeLogs = (logs: TimeLog[]) => {
    localStorage.setItem('timeLogs', JSON.stringify(logs));
    setTimeLogs(logs);
  };

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('weeklyGoal', weeklyGoal.toString());
    setShowGoalModal(false);
    analyzeProgress();
  };

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchIn || !punchOut) return;

    const punchInDate = new Date(`2000-01-01T${punchIn}`);
    const punchOutDate = new Date(`2000-01-01T${punchOut}`);
    const duration = differenceInHours(punchOutDate, punchInDate) + 
                    (differenceInMinutes(punchOutDate, punchInDate) % 60) / 60;

    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      punchIn,
      punchOut,
      duration
    };

    const updatedLogs = [...timeLogs, newLog];
    saveTimeLogs(updatedLogs);
    setPunchIn('');
    setPunchOut('');
    analyzeProgress();
  };

  const analyzeProgress = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weekLogs = timeLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    const totalHours = weekLogs.reduce((sum, log) => sum + log.duration, 0);
    const remainingHours = weeklyGoal - totalHours;
    const daysLeft = 5 - weekLogs.length; // Assuming 5-day work week

    if (totalHours >= weeklyGoal) {
      setMessage(`Great job! You've reached your weekly goal of ${weeklyGoal} hours.`);
      setMessageType('success');
    } else if (daysLeft <= 0) {
      setMessage(`You're ${remainingHours.toFixed(1)} hours short of your weekly goal.`);
      setMessageType('error');
    } else {
      const requiredDaily = remainingHours / daysLeft;
      if (requiredDaily > 10) {
        setMessage(`Warning: You need to work ${requiredDaily.toFixed(1)} hours per day to reach your goal.`);
        setMessageType('warning');
      } else {
        setMessage(`You need ${remainingHours.toFixed(1)} more hours (${requiredDaily.toFixed(1)} hrs/day) to reach your goal.`);
        setMessageType('success');
      }
    }
  };

  const handleDeleteLog = (logId: string) => {
    const updatedLogs = timeLogs.filter(log => log.id !== logId);
    saveTimeLogs(updatedLogs);
    analyzeProgress();
  };

  React.useEffect(() => {
    if (!showGoalModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGoalModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showGoalModal]);

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Timer className="h-8 w-8 sm:h-10 sm:w-10 text-sage-700 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="page-title">Work Time Tracker</h1>
              <p className="page-subtitle">Track your weekly work hours goal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 min-h-[44px] bg-white border border-border rounded-xl text-charcoal-900">
              <Target className="h-5 w-5 text-sage-700" aria-hidden="true" />
              <span>Goal: {weeklyGoal} hrs/week</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="inline-flex h-11 w-11 items-center justify-center hover:bg-charcoal-100 rounded-xl transition-colors"
              title="Edit Goal"
              aria-label="Edit weekly goal"
            >
              <Pencil className="h-5 w-5 text-sage-700" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Time Log Form */}
        <div className="card p-4 sm:p-6 mb-6">
          <form onSubmit={handleLogTime} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="punch-in" className="label">Punch In Time</label>
              <input
                id="punch-in"
                type="time"
                value={punchIn}
                onChange={(e) => setPunchIn(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="punch-out" className="label">Punch Out Time</label>
              <input
                id="punch-out"
                type="time"
                value={punchOut}
                onChange={(e) => setPunchOut(e.target.value)}
                className="input"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary w-full">
                <Clock className="h-5 w-5" aria-hidden="true" />
                Log Time
              </button>
            </div>
          </form>
        </div>

        {/* Progress Message */}
        {message && (
          <div
            role="status"
            className={`mb-6 p-4 rounded-xl text-center font-medium border ${
              messageType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : messageType === 'warning'
                  ? 'bg-honey-50 text-amber-800 border-honey-300'
                  : 'bg-coral-50 text-coral-800 border-coral-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Time Logs */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-heading-md font-semibold text-charcoal-900 mb-4">Time Logs</h2>
          <div className="space-y-3">
            {timeLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-4 bg-cream-100 border border-border rounded-xl"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Clock className="h-5 w-5 text-sage-700 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal-900">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-charcoal-700">
                      {log.punchIn} - {log.punchOut}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <p className="font-semibold text-charcoal-900">{log.duration.toFixed(1)} hrs</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id)}
                    className="inline-flex h-10 w-10 items-center justify-center text-charcoal-700 hover:text-coral-700 hover:bg-coral-100 rounded-lg transition-colors"
                    title="Delete Log"
                    aria-label={`Delete log for ${format(new Date(log.date), 'MMM dd, yyyy')}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {timeLogs.length === 0 && (
              <div className="text-center text-charcoal-700 py-4">
                No time logs yet. Start by logging your work hours!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="goal-modal-title" className="text-heading-md font-bold text-charcoal-900 mb-4">
              {weeklyGoal === 0 ? 'Set' : 'Update'} Weekly Work Hours Goal
            </h2>
            <form onSubmit={handleSetGoal}>
              <div className="mb-4">
                <label htmlFor="weekly-goal" className="label">Weekly Hours Goal</label>
                <input
                  id="weekly-goal"
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className="input"
                  min="1"
                  max="168"
                  required
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {weeklyGoal === 0 ? 'Set' : 'Update'} Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};


export default WorkTimeTracker;
