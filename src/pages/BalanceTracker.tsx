import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Clock, Download, AlertCircle, Plus, Trash2, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, subDays } from 'date-fns';
import { mockApi } from '../lib/dummyData';
import { balanceTrackerData } from '../lib/staticData';

const { activityTypes, colors: COLORS } = balanceTrackerData;

const formatHours = (value: number) => Number(value.toFixed(1));

const activityLabels: Record<string, string> = {
  work: 'Work',
  personal: 'Personal',
  exercise: 'Exercise',
  hobbies: 'Hobbies',
};

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  work: () => <Clock className="h-4 w-4" />,
  personal: () => <Calendar className="h-4 w-4" />,
  exercise: () => <Clock className="h-4 w-4" />,
  hobbies: () => <Plus className="h-4 w-4" />,
};

export default function BalanceTracker() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);

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

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await mockApi.deleteActivity(id);
      if (error) throw error;
      await loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    } finally {
      setLoading(false);
    }
  };

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

  // Process data for charts
  const todayActivities = activities.filter(
    (activity) => activity.date === format(new Date(), 'yyyy-MM-dd')
  );

  const pieChartData = activityTypes.map((type) => ({
    name: type.label,
    value: formatHours(todayActivities.reduce((sum, activity) => 
      activity.type === type.value ? sum + activity.hours : sum
    , 0)),
  })).filter(d => d.value > 0);

  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weeklyData = weekDays.map((day) => {
    const dayActivities = activities.filter(
      (activity) => activity.date === format(day, 'yyyy-MM-dd')
    );

    return {
      day: format(day, 'EEE'),
      fullDate: format(day, 'MMM d'),
      ...Object.fromEntries(
        activityTypes.map((type) => [
          type.value,
          formatHours(dayActivities.reduce((sum, activity) => 
            activity.type === type.value ? sum + activity.hours : sum
          , 0)),
        ])
      ),
    };
  });

  const totalHoursToday = todayActivities.reduce((sum, a) => sum + a.hours, 0);
  const totalHoursWeek = activities.reduce((sum, a) => sum + a.hours, 0);

  // Recent activities for history
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="container-custom py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-sm font-display font-bold text-white">Activity Tracker</h1>
            <p className="text-dark-400 mt-1">Track and visualize your daily time allocation</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="btn-secondary btn-sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary btn-sm"
            >
              <Calendar className="h-4 w-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">Today's Total</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{formatHours(totalHoursToday)} hrs</p>
              </div>
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalHoursToday / 24 * 100, 100)}%` }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">Weekly Total</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{formatHours(totalHoursWeek)} hrs</p>
              </div>
              <div className="p-3 bg-secondary-500/10 rounded-xl text-secondary-400">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalHoursWeek / (24 * 7) * 100, 100)}%` }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-secondary-500 to-pink-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">Activities Logged</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{activities.length}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                <Plus className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-dark-400">
              This week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">Balance Score</p>
                <p className="text-3xl font-display font-bold text-white mt-1">
                  {activityTypes.length > 0 ? Math.round(100 - Math.abs(
                    (todayActivities.filter(a => a.type === 'work').reduce((s, a) => s + a.hours, 0) / Math.max(totalHoursToday, 1)) * 100 - 50
                  ) * 2) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-dark-400">
              Higher is more balanced
            </div>
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Log Activity Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-heading-md font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary-400" />
            Log New Activity
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4">
            <div className="md:col-span-5">
              <label htmlFor="activity-type" className="label">Activity Type</label>
              <div className="relative">
                <select
                  id="activity-type"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="input appearance-none pr-10"
                  required
                  disabled={loading}
                >
                  <option value="">Select activity type...</option>
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="hours" className="label">Hours</label>
              <div className="relative">
                <input
                  id="hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. 2.5"
                  step="0.5"
                  min="0.5"
                  max="24"
                  className="input pr-10"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none text-sm">
                  hrs
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex items-end">
              <button
                type="submit"
                disabled={loading || !selectedActivity || !hours}
                className="btn-primary w-full justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4"
                    >
                      <Clock className="h-4 w-4" />
                    </motion.span>
                    Logging...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    Log Activity
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Balance Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md font-bold text-white">Today's Balance</h2>
              <span className="text-sm text-dark-400">{formatHours(totalHoursToday)} hrs total</span>
            </div>
            
            {pieChartData.length > 0 ? (
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${formatHours(value)} hrs`}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className="flex items-center gap-2 text-dark-300">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[activityTypes.findIndex(t => t.label === value)] }} />
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-dark-400">
                <Clock className="h-12 w-12 mb-4 text-dark-600" />
                <p className="text-center">No activities logged today</p>
                <p className="text-sm mt-1">Log your first activity above to see the balance</p>
              </div>
            )}
          </motion.div>

          {/* Weekly Overview Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md font-bold text-white">Weekly Overview</h2>
              <span className="text-sm text-dark-400">{formatHours(totalHoursWeek)} hrs total</span>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => formatHours(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatHours(value), activityLabels[name] || name]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 600 }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 12, paddingBottom: 4 }}
                    formatter={(value) => (
                      <span className="flex items-center gap-2 text-dark-300 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[activityTypes.findIndex(t => t.value === value)] }} />
                        {activityLabels[value] || value}
                      </span>
                    )}
                  />
                  {activityTypes.map((type, index) => (
                    <Bar
                      key={type.value}
                      dataKey={type.value}
                      stackId="a"
                      fill={COLORS[index % COLORS.length]}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={32}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Activity History */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card overflow-hidden"
          >
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-heading-md font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-400" />
                Recent Activities
              </h2>
            </div>
            
            <div className="divide-y divide-dark-700">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const typeInfo = activityTypes.find(t => t.value === activity.type);
                  const Icon = activityIcons[activity.type] || Calendar;
                  const iconColor = typeInfo 
                    ? COLORS[activityTypes.findIndex(t => t.value === activity.type)] || '#8884d8'
                    : 'text-dark-400';
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-dark-800/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-dark-800 rounded-xl">
                          <Icon className={`h-5 w-5 ${typeInfo ? `text-[${iconColor}]` : 'text-dark-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{typeInfo?.label || activity.type}</p>
                          <p className="text-sm text-dark-400">{format(new Date(activity.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-primary-400 text-lg">{formatHours(activity.hours)} hrs</span>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={loading}
                          className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                          aria-label="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-dark-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-dark-600" />
                  <p>No activities logged yet</p>
                  <p className="text-sm mt-1">Your history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}