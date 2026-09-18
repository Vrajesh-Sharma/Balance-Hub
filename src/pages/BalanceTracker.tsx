import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Clock, Download, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
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

const ACTIVITY_COLOR_MAP: Record<string, string> = {
  work: COLORS[0],
  personal: COLORS[1],
  exercise: COLORS[2],
  hobbies: COLORS[3],
};

export default function BalanceTracker() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);

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

  const todayActivities = activities.filter(
    (activity) => activity.date === format(new Date(), 'yyyy-MM-dd')
  );

  const pieChartData = activityTypes.map((type) => ({
    name: type.label,
    value: formatHours(todayActivities.reduce((sum, activity) =>
      activity.type === type.value ? sum + activity.hours : sum, 0)),
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
            activity.type === type.value ? sum + activity.hours : sum, 0)),
        ])
      ),
    };
  });

  const totalHoursToday = todayActivities.reduce((sum, a) => sum + a.hours, 0);
  const totalHoursWeek = activities.reduce((sum, a) => sum + a.hours, 0);

  const workHoursToday = todayActivities
    .filter(a => a.type === 'work')
    .reduce((s, a) => s + a.hours, 0);
  const balanceScore = activityTypes.length > 0 && totalHoursToday > 0
    ? Math.round(100 - Math.abs((workHoursToday / totalHoursToday) * 100 - 50) * 2)
    : 0;

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const metrics = [
    {
      label: "Today's Total",
      value: `${formatHours(totalHoursToday)} hrs`,
      subtext: "Today",
      icon: <Clock className="h-5 w-5" />,
      iconColor: "text-primary-400",
      iconBg: "bg-primary-500/10",
    },
    {
      label: "Weekly Total",
      value: `${formatHours(totalHoursWeek)} hrs`,
      subtext: "This week",
      icon: <Calendar className="h-5 w-5" />,
      iconColor: "text-secondary-400",
      iconBg: "bg-secondary-500/10",
    },
    {
      label: "Activities Logged",
      value: activities.length.toString(),
      subtext: "This week",
      icon: <Plus className="h-5 w-5" />,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
    },
    {
      label: "Balance Score",
      value: `${balanceScore}%`,
      subtext: "Based on today's work/personal split",
      icon: <Trash2 className="h-5 w-5" />,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="container-custom py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-10 lg:space-y-12"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-display-sm font-bold text-white tracking-tight">Activity Tracker</h1>
            <p className="text-body-md text-dark-400">See where your time goes and keep your day balanced.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="btn-secondary btn-sm"
              disabled={activities.length === 0}
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

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="bg-dark-900 border border-dark-700 rounded-xl p-5 hover:border-dark-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-caption font-medium text-dark-400 tracking-wide uppercase">{metric.label}</p>
                  <p className="text-heading-lg font-display font-bold text-white mt-1.5 truncate">{metric.value}</p>
                  <p className="text-caption text-dark-500 mt-0.5">{metric.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${metric.iconBg} ${metric.iconColor} flex-shrink-0`}>
                  {metric.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Log Activity Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          className="bg-dark-900 border border-dark-700 rounded-xl p-5 sm:p-6 hover:border-dark-600 transition-colors"
        >
          <div className="flex items-center gap-2 mb-5">
            <Plus className="h-5 w-5 text-primary-400" />
            <h2 className="text-heading-md font-semibold text-white">Log New Activity</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:gap-4 sm:items-end">
            <div className="sm:col-span-5">
              <label htmlFor="activity-type" className="label">Activity Type</label>
              <select
                id="activity-type"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="input appearance-none"
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
            </div>

            <div className="sm:col-span-3">
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none text-sm">hrs</span>
              </div>
            </div>

            <div className="sm:col-span-4 w-full sm:w-auto">
              <button
                type="submit"
                disabled={loading || !selectedActivity || !hours}
                className="btn-primary w-full sm:w-auto justify-center gap-2"
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="bg-dark-900 border border-dark-700 rounded-xl p-5 sm:p-6 hover:border-dark-600 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-heading-md font-semibold text-white">Today's Balance</h2>
              <span className="text-sm text-dark-400">{formatHours(totalHoursToday)} hrs total</span>
            </div>

            {pieChartData.length > 0 ? (
              <div className="h-64 sm:h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ACTIVITY_COLOR_MAP[activityTypes.find(t => t.label === entry.name)?.value || ''] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${formatHours(value)} hrs`, '']}
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
                        <span className="flex items-center gap-2 text-dark-300 text-sm">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ACTIVITY_COLOR_MAP[activityTypes.find(t => t.label === value)?.value || ''] || '#8884d8' }}
                          />
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-dark-400">
                <Clock className="h-10 w-10 mb-3 text-dark-600" />
                <p className="text-center text-body-md">No activity logged today</p>
                <p className="text-sm text-dark-500 mt-1">Log an activity above to start tracking your day</p>
              </div>
            )}
          </motion.div>

          {/* Weekly Overview Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            className="bg-dark-900 border border-dark-700 rounded-xl p-5 sm:p-6 hover:border-dark-600 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-heading-md font-semibold text-white">Weekly Overview</h2>
              <span className="text-sm text-dark-400">{formatHours(totalHoursWeek)} hrs total</span>
            </div>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => String(formatHours(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    width={55}
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
                    wrapperStyle={{ paddingTop: 8, paddingBottom: 4 }}
                    formatter={(value) => (
                      <span className="flex items-center gap-2 text-dark-300 text-sm">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ACTIVITY_COLOR_MAP[value] || '#8884d8' }}
                        />
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
                      maxBarSize={28}
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
            transition={{ duration: 0.25 }}
            className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden hover:border-dark-600 transition-colors"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-dark-700">
              <h2 className="text-heading-md font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-400" />
                Recent Activities
              </h2>
            </div>

            <div className="divide-y divide-dark-700">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const typeInfo = activityTypes.find(t => t.value === activity.type);
                  const Icon = activityIcons[activity.type] || Calendar;
                  const iconColor = typeInfo ? ACTIVITY_COLOR_MAP[typeInfo.value] : '#64748b';
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-5 sm:px-6 py-4 hover:bg-dark-800/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-dark-800 rounded-lg flex-shrink-0" style={{ color: iconColor }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{typeInfo?.label || activity.type}</p>
                          <p className="text-sm text-dark-400">{format(new Date(activity.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-primary-400 text-base">{formatHours(activity.hours)} hrs</span>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={loading}
                          className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          aria-label="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-5 sm:px-6 py-10 text-center text-dark-400">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-dark-600" />
                  <p className="text-body-md">No activities logged yet</p>
                  <p className="text-sm text-dark-500 mt-1">Your history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}