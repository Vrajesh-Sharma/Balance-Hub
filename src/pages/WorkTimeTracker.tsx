import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Timer, Target, Pencil, Trash2 } from 'lucide-react';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Timer className="h-10 w-10 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold">Work Time Tracker</h1>
              <p className="text-gray-400">Track your weekly work hours goal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <Target className="h-5 w-5 text-cyan-400" />
              <span>Goal: {weeklyGoal} hrs/week</span>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit Goal"
            >
              <Pencil className="h-5 w-5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Time Log Form */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          <form onSubmit={handleLogTime} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Punch In Time</label>
              <input
                type="time"
                value={punchIn}
                onChange={(e) => setPunchIn(e.target.value)}
                className="w-full bg-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Punch Out Time</label>
              <input
                type="time"
                value={punchOut}
                onChange={(e) => setPunchOut(e.target.value)}
                className="w-full bg-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="h-5 w-5" />
                Log Time
              </button>
            </div>
          </form>
        </div>

        {/* Progress Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg text-center font-medium ${
            messageType === 'success' 
              ? 'bg-green-900/50 text-green-400 border border-green-400'
              : messageType === 'warning'
                ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400'
                : 'bg-red-900/50 text-red-400 border border-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Time Logs */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Time Logs</h2>
          <div className="space-y-4">
            {timeLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg group"
              >
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="font-medium">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-gray-400">
                      {log.punchIn} - {log.punchOut}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">{log.duration.toFixed(1)} hrs</p>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {timeLogs.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No time logs yet. Start by logging your work hours!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {weeklyGoal === 0 ? 'Set' : 'Update'} Weekly Work Hours Goal
              </h2>
            </div>
            <form onSubmit={handleSetGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Weekly Hours Goal</label>
                <input
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className="w-full bg-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-400"
                  min="1"
                  max="168"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
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