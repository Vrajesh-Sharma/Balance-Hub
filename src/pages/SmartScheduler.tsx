import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  RefreshCw, 
  Download, 
  BarChart2,
  Zap,
  AlertCircle,
  Loader2,
  Database
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { 
  runGeneticAlgorithm, 
  runBaselineComparisons,
  aggregateUserProfile,
  getDefaultPreferences,
  generateSyntheticProfile,
  schedulesToCurrentFormat,
} from '../soft-computing';
import { mockApi, smartSchedulerData } from '../lib/dummyData';
import FitnessChart from '../components/SmartScheduler/FitnessChart';
import ScheduleView from '../components/SmartScheduler/ScheduleView';
import FuzzyExplanation from '../components/SmartScheduler/FuzzyExplanation';
import ComparisonTable from '../components/SmartScheduler/ComparisonTable';

export default function SmartScheduler() {
  const [step, setStep] = React.useState<'idle' | 'loading' | 'running' | 'results' | 'error'>('idle');
  const [progress, setProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [optimizedSchedule, setOptimizedSchedule] = React.useState<any>(null);
  const [comparisonResults, setComparisonResults] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [useTestData, setUseTestData] = React.useState(false);
  const [convergence, setConvergence] = React.useState<number[]>([]);
  const [hasRealData, setHasRealData] = React.useState(false);

  React.useEffect(() => {
    setHasRealData(smartSchedulerData.hasRealData());
  }, []);

  const handleOptimize = async () => {
    setStep('loading');
    setError(null);
    setStatusMessage('Loading user data...');
    setProgress(10);

    try {
      let inputs: any;
      let prefs: any;
      let currentSchedule: any[] = [];

      if (!useTestData) {
        setStatusMessage('Fetching activities, work logs, journals, goals, and schedules...');
        setProgress(20);

        const [activitiesRes, goalsRes, journalRes, schedulesRes, workLogsRes] = await Promise.all([
          mockApi.getActivities(format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
          mockApi.getGoals(),
          mockApi.getJournalEntries(),
          mockApi.getSchedules(format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
          mockApi.getWorkLogs(format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
        ]);

        const activities = activitiesRes.data || [];
        const goals = goalsRes.data || [];
        const journal = journalRes.data || [];
        const schedules = schedulesRes.data || [];
        const workLogs = workLogsRes.data || [];

        if (activities.length === 0 && goals.length === 0 && journal.length === 0 && schedules.length === 0 && workLogs.length === 0) {
          setStep('error');
          setError('No user data found. Please add activities, schedules, goals, journal entries, or work time logs first.');
          return;
        }

        inputs = aggregateUserProfile(activities, workLogs, journal, goals, schedules, getDefaultPreferences());
        prefs = getDefaultPreferences();
        currentSchedule = schedulesToCurrentFormat(schedules);
      } else {
        const profile = generateSyntheticProfile(30);
        inputs = profile.inputs;
        prefs = profile.preferences;
        currentSchedule = schedulesToCurrentFormat(profile.schedules);
      }

      setStep('running');
      setStatusMessage('Running Fuzzy Logic evaluation...');
      setProgress(30);

      // Run fuzzy logic evaluation first
      const { evaluateBalance } = await import('../soft-computing/fuzzy');
      const fuzzyResult = evaluateBalance(inputs);
      console.log('Fuzzy Logic Result:', fuzzyResult);

      setStatusMessage('Optimizing schedule with Genetic Algorithm...');
      setProgress(50);

      const result = await runGeneticAlgorithm(inputs, prefs, {
        config: { populationSize: 100, generations: 150 },
        currentSchedule,
        onGeneration: (gen, best) => {
          setProgress(50 + Math.floor((gen / 150) * 40));
          setStatusMessage(`Generation ${gen}: Best fitness = ${best.toFixed(1)}`);
        },
        onComplete: (_best, conv) => {
          setConvergence(conv);
        },
      });

      setOptimizedSchedule(result);
      setProgress(90);
      setStatusMessage('Running baseline comparisons...');

      const comparisons = await runBaselineComparisons(inputs, prefs, currentSchedule);
      setComparisonResults(comparisons);

      setStep('results');
      setProgress(100);
      setStatusMessage('Optimization complete!');
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Optimization failed');
    }
  };

  const handleExport = () => {
    if (!optimizedSchedule) return;
    const csv = [
      ['Time', 'Activity', 'Duration (hrs)'].join(','),
      ...optimizedSchedule.slots.map((s: any) => 
        [`${format(new Date(`2000-01-01T${String(Math.floor(s.start)).padStart(2, '0')}:${(s.start % 1) * 60}:00`), 'h:mm a')} - ${format(new Date(`2000-01-01T${String(Math.floor(s.end)).padStart(2, '0')}:${(s.end % 1) * 60}:00`), 'h:mm a')}`, s.activity, (s.end - s.start).toFixed(1)].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-schedule-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title flex items-center gap-3">
            <Brain className="text-sage-700 shrink-0" size={28} aria-hidden="true" />
            Smart Schedule Optimizer
          </h1>
          <p className="page-subtitle">
            AI-powered daily schedule optimization using Fuzzy Logic + Genetic Algorithm
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={useTestData}
              onChange={(e) => setUseTestData(e.target.checked)}
              className="w-5 h-5 accent-sage-600 rounded border-border"
            />
            <span className="text-sm text-charcoal-900">Use test data (synthetic)</span>
          </label>
          {hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-sm text-emerald-800">
              <Database size={14} aria-hidden="true" />
              Real user data detected
            </span>
          )}
          {!hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-sm text-amber-800">
              <AlertCircle size={14} aria-hidden="true" />
              No real data - add activities/schedules first
            </span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert-danger mb-6 flex-wrap items-center"
          role="alert"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
          <button type="button" onClick={() => setStep('idle')} className="ml-auto text-sm font-semibold text-coral-800 hover:underline min-h-[44px] px-2">
            Try Again
          </button>
        </motion.div>
      )}

      {(step === 'loading' || step === 'running') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 card p-4 sm:p-6"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 text-sage-700 animate-spin shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-charcoal-900 break-words">{statusMessage}</p>
              <div className="w-full h-2 bg-charcoal-200 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-sage-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-charcoal-700 mt-1">{progress}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'results' && optimizedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:space-y-8"
        >
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="card p-4 sm:p-5 border-l-4 border-l-emerald-600"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal-700">Fitness Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-800">{optimizedSchedule.fitness.toFixed(1)}</p>
                </div>
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-800 shrink-0" aria-hidden="true" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4 sm:p-5 border-l-4 border-l-sage-600"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal-700">Balance Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-sage-800">{optimizedSchedule.balanceScore.toFixed(1)}</p>
                </div>
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-sage-800 shrink-0" aria-hidden="true" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4 sm:p-5 border-l-4 border-l-amber-500"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal-700">Productivity</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-800">{optimizedSchedule.productivityScore.toFixed(1)}</p>
                </div>
                <BarChart2 className="h-8 w-8 sm:h-10 sm:w-10 text-amber-800 shrink-0" aria-hidden="true" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-4 sm:p-5 border-l-4 border-l-coral-600"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal-700">Stress Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-coral-700">{optimizedSchedule.stressScore.toFixed(1)}</p>
                </div>
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-coral-700 shrink-0" aria-hidden="true" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FitnessChart convergence={convergence} />
            <FuzzyExplanation
              firedRules={optimizedSchedule.firedRules || []}
              balanceScore={optimizedSchedule.balanceScore}
              stressScore={optimizedSchedule.stressScore}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ScheduleView
              slots={optimizedSchedule.slots}
              title="Optimized Schedule"
            />
            {comparisonResults.length > 0 && (
              <ComparisonTable rows={comparisonResults} />
            )}
          </div>

          {comparisonResults.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {comparisonResults.slice(1, 3).map((result) => (
                <ScheduleView
                  key={result.name}
                  slots={result.schedule}
                  title={result.name}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={handleExport} className="btn-secondary">
              <Download size={20} aria-hidden="true" />
              Export Schedule (CSV)
            </button>
            <button type="button" onClick={handleOptimize} className="btn-primary">
              <RefreshCw size={20} aria-hidden="true" />
              Re-optimize
            </button>
          </div>
        </motion.div>
      )}

      {step === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 sm:p-8 text-center"
        >
          <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-sage-700 mx-auto mb-5" aria-hidden="true" />
          <h2 className="text-heading-lg sm:text-heading-xl font-bold text-charcoal-900 mb-3">Ready to Optimize Your Schedule?</h2>
          <p className="text-charcoal-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
            The Smart Schedule Optimizer analyzes your work patterns, sleep, exercise, stress levels, and goals
            using Fuzzy Logic, then generates an optimal daily schedule using a Genetic Algorithm that maximizes
            work-life balance and productivity while minimizing stress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8 max-w-3xl mx-auto text-left">
            {[
              { icon: Brain, title: 'Fuzzy Logic', desc: 'Evaluates balance & stress from vague inputs' },
              { icon: Zap, title: 'Genetic Algorithm', desc: 'Evolves optimal schedules over generations' },
              { icon: BarChart2, title: 'Baseline Comparison', desc: 'Compares against manual, template & greedy' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 bg-cream-100 border border-border rounded-xl">
                <Icon className="h-8 w-8 text-sage-700 mb-2" aria-hidden="true" />
                <h3 className="font-semibold text-charcoal-900">{title}</h3>
                <p className="text-sm text-charcoal-700 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleOptimize}
            className="btn-primary btn-lg w-full sm:w-auto whitespace-normal text-center"
            disabled={!hasRealData && !useTestData}
          >
            <Brain size={24} className="shrink-0" aria-hidden="true" />
            {useTestData ? 'Generate Optimized Schedule (Test Data)' : hasRealData ? 'Generate Optimized Schedule (Real Data)' : 'Add Data First'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
