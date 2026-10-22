import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Clock, Download, Calendar, Plus, Trash2, AlertCircle, Brain } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { mockApi, smartSchedulerData } from '../lib/dummyData';
import { evaluateBalance } from '../soft-computing/fuzzy';
import { FiredRule } from '../soft-computing/types';
import { balanceTrackerData } from '../lib/staticData';

const { activityTypes, colors: COLORS } = balanceTrackerData;

const formatHours = (value: number) => Number(value.toFixed(1));

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1cbc0',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(65, 58, 49, 0.12)',
  color: '#23201c',
};

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
  const [fuzzyBalanceScore, setFuzzyBalanceScore] = React.useState<number | null>(null);
  const [fuzzyStressScore, setFuzzyStressScore] = React.useState<number | null>(null);
  const [fuzzyFiredRules, setFuzzyFiredRules] = React.useState<FiredRule[]>([]);

  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());

  React.useEffect(() => {
    loadActivities();
    loadFuzzyEvaluation();
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

  const loadFuzzyEvaluation = async () => {
    try {
      const inputs = smartSchedulerData.getUserInputs();
      const result = evaluateBalance(inputs);
      setFuzzyBalanceScore(result.balanceScore);
      setFuzzyStressScore(result.stressScore);
      setFuzzyFiredRules(result.firedRules);
    } catch (err) {
      console.error('Failed to run fuzzy evaluation:', err);
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
  const simpleBalanceScore = activityTypes.length > 0 && totalHoursToday > 0
    ? Math.round(100 - Math.abs((workHoursToday / totalHoursToday) * 100 - 50) * 2)
    : 0;

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Use fuzzy logic balance score if available, otherwise fall back to simple calculation
  const displayBalanceScore = fuzzyBalanceScore !== null ? Math.round(fuzzyBalanceScore) : simpleBalanceScore;
  const balanceSubtext = fuzzyBalanceScore !== null 
    ? `Fuzzy Logic: Balance ${fuzzyBalanceScore.toFixed(1)}/100, Stress ${fuzzyStressScore?.toFixed(1) || 0}/100`
    : "Based on today's work/personal split (simple)";

  const metrics = [
    {
      label: "Today's Total",
      value: `${formatHours(totalHoursToday)} hrs`,
      subtext: "Today",
      icon: <Clock className="h-5 w-5" />,
      iconColor: "text-sage-700",
      iconBg: "bg-sage-100",
    },
    {
      label: "Weekly Total",
      value: `${formatHours(totalHoursWeek)} hrs`,
      subtext: "This week",
      icon: <Calendar className="h-5 w-5" />,
      iconColor: "text-lavender-700",
      iconBg: "bg-lavender-100",
    },
    {
      label: "Activities Logged",
      value: activities.length.toString(),
      subtext: "This week",
      icon: <Plus className="h-5 w-5" />,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Balance Score",
      value: `${displayBalanceScore}%`,
      subtext: balanceSubtext,
      icon: <Brain className="h-5 w-5" />,
      iconColor: "text-sage-700",
      iconBg: "bg-sage-100",
    },
  ];

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 lg:space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="page-title">Activity Tracker</h1>
            <p className="page-subtitle">See where your time goes and keep your day balanced.</p>
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
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
{metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-caption font-semibold text-charcoal-700 tracking-wide uppercase">{metric.label}</p>
                  <p className="text-heading-lg font-display font-bold text-charcoal-900 mt-1.5 truncate">{metric.value}</p>
                  <p className="text-caption text-charcoal-700 mt-0.5 break-words">{metric.subtext}</p>
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
            className="flex items-center gap-3 p-3.5 bg-coral-100 border border-coral-200 rounded-lg text-coral-700"
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
          className="card p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Plus className="h-5 w-5 text-sage-700" />
            <h2 className="text-heading-md font-semibold text-charcoal-900">Log New Activity</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label htmlFor="activity-type" className="label">Activity Type</label>
              <select
                id="activity-type"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="input"
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

            <div>
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-700 pointer-events-none text-sm">hrs</span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
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
        <div className="grid xl:grid-cols-2 gap-6">
          {/* Today's Balance Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-heading-md font-semibold text-charcoal-900">Today's Balance</h2>
              <span className="text-sm text-charcoal-600">{formatHours(totalHoursToday)} hrs total</span>
            </div>

            {pieChartData.length > 0 ? (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 24, right: 24, bottom: 8, left: 24 }}>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="48%"
                      labelLine={false}
                      innerRadius="40%"
                      outerRadius="65%"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ACTIVITY_COLOR_MAP[activityTypes.find(t => t.label === entry.name)?.value || ''] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${formatHours(value)} hrs`, '']}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{ color: '#23201c', fontWeight: 600 }}
                      itemStyle={{ color: '#413a31' }}
                    />
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 13, color: '#413a31' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-charcoal-700">
                <Clock className="h-10 w-10 mb-3 text-charcoal-700" />
                <p className="text-center text-body-md">No activity logged today</p>
                <p className="text-sm text-charcoal-600 mt-1">Log an activity above to start tracking your day</p>
              </div>
            )}
          </motion.div>

          {/* Weekly Overview Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-heading-md font-semibold text-charcoal-900">Weekly Overview</h2>
              <span className="text-sm text-charcoal-600">{formatHours(totalHoursWeek)} hrs total</span>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e2da" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#5c5345', fontSize: 12 }}
                    tickFormatter={(value) => String(formatHours(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#413a31', fontSize: 12, fontWeight: 500 }}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatHours(value), activityLabels[name] || name]}
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: '#23201c', fontWeight: 600 }}
                    itemStyle={{ color: '#413a31' }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 8, paddingBottom: 0, fontSize: 13, color: '#413a31' }}
                    formatter={(value) => activityLabels[value] || value}
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

        {/* Fuzzy Logic Evaluation Details */}
        {fuzzyBalanceScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.3 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-heading-md font-semibold text-charcoal-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-sage-700" />
                Fuzzy Logic Balance Evaluation
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-800">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#437066' }}></span>
                  Balance: {fuzzyBalanceScore.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d1421c' }}></span>
                  Stress: {fuzzyStressScore?.toFixed(1) || 0}
                </span>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fuzzyFiredRules.length === 0 ? (
                <p className="text-charcoal-700 text-center py-4">No rules fired significantly</p>
              ) : (
                fuzzyFiredRules.slice(0, 5).map((rule, index) => (
                  <div key={index} className="p-3 bg-cream-100 rounded-lg border-l-4 border-sage-600">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <p className="text-sm font-semibold text-sage-800 min-w-0 break-words">{rule.name}</p>
                      <span className="text-xs text-charcoal-700 px-2 py-0.5 bg-white border border-border rounded shrink-0">
                        Strength: {rule.strength.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-700">
                      <span>→ Balance: <span className="font-medium text-emerald-700">{rule.consequence.balance}</span></span>
                      <span>→ Stress: <span className="font-medium text-coral-700">{rule.consequence.stress}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {fuzzyFiredRules.length > 5 && (
              <p className="mt-3 text-xs text-charcoal-600 text-center">
                + {fuzzyFiredRules.length - 5} more rules fired
              </p>
            )}
          </motion.div>
        )}

        {/* Activity History */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="card overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <h2 className="text-heading-md font-semibold text-charcoal-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sage-700" />
                Recent Activities
              </h2>
            </div>

            <div className="divide-y divide-charcoal-200">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const typeInfo = activityTypes.find(t => t.value === activity.type);
                  const Icon = activityIcons[activity.type] || Calendar;
                  const iconColor = typeInfo ? ACTIVITY_COLOR_MAP[typeInfo.value] : '#5c5345';
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-5 sm:px-6 py-4 hover:bg-cream-100 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-cream-100 rounded-lg flex-shrink-0" style={{ color: iconColor }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal-900 truncate">{typeInfo?.label || activity.type}</p>
                          <p className="text-sm text-charcoal-600">{format(new Date(activity.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sage-700 text-base">{formatHours(activity.hours)} hrs</span>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={loading}
                          className="p-2 text-charcoal-600 hover:text-coral-700 hover:bg-coral-100 rounded-lg min-h-[40px] min-w-[40px] inline-flex items-center justify-center transition-colors disabled:opacity-50"
                          aria-label="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-5 sm:px-6 py-10 text-center text-charcoal-600">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-charcoal-700" />
                  <p className="text-body-md">No activities logged yet</p>
                  <p className="text-sm text-charcoal-600 mt-1">Your history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}