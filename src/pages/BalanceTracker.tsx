import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Clock, Download, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { mockApi } from '../lib/dummyData';
import { balanceTrackerData } from '../lib/staticData';

const { activityTypes, colors: COLORS } = balanceTrackerData;

export default function BalanceTracker() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = React.useState('');
  const [hours, setHours] = React.useState('');

  // Get the current week's start and end dates
  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());

  React.useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await mockApi.getActivities(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !hours) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await mockApi.logActivity(
        selectedActivity,
        parseFloat(hours),
        format(new Date(), 'yyyy-MM-dd')
      );
      if (error) throw error;
      
      setSelectedActivity('');
      setHours('');
      await loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const todayActivities = activities.filter(
    (activity) => activity.date === format(new Date(), 'yyyy-MM-dd')
  );

  const pieChartData = activityTypes.map((type) => ({
    name: type.label,
    value: todayActivities.reduce((sum, activity) => 
      activity.type === type.value ? sum + activity.hours : sum
    , 0),
  }));

  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weeklyData = weekDays.map((day) => {
    const dayActivities = activities.filter(
      (activity) => activity.date === format(day, 'yyyy-MM-dd')
    );

    return {
      day: format(day, 'EEE'),
      ...Object.fromEntries(
        activityTypes.map((type) => [
          type.value,
          dayActivities.reduce((sum, activity) => 
            activity.type === type.value ? sum + activity.hours : sum
          , 0),
        ])
      ),
    };
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Activity Type', 'Hours'].join(','),
      ...activities.map((activity) => 
        [activity.date, activity.type, activity.hours].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'activities.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activity Tracker</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Download size={20} />
          Export Data
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500 bg-opacity-10 p-4 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="bg-gray-700 rounded-lg p-2"
          required
        >
          <option value="">Select Activity Type</option>
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours"
          step="0.5"
          min="0.5"
          max="24"
          className="bg-gray-700 rounded-lg p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <Clock className="animate-spin" />
          ) : (
            <>
              <Clock size={20} />
              Log Activity
            </>
          )}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-4">Today's Balance</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-4">Weekly Overview</h2>
          <BarChart width={400} height={300} data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {activityTypes.map((type, index) => (
              <Bar
                key={type.value}
                dataKey={type.value}
                stackId="a"
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        </motion.div>
      </div>
    </div>
  );
}