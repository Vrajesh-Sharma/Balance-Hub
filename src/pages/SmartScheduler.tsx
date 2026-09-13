import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  RefreshCw, 
  Download, 
  BarChart2,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  runGeneticAlgorithm, 
  runBaselineComparisons,
  aggregateUserProfile,
  getDefaultPreferences,
  generateSyntheticProfile,
  schedulesToCurrentFormat,
} from '../soft-computing';
import { mockApi } from '../lib/dummyData';
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
  const [useRealData, setUseRealData] = React.useState(true);
  const [convergence, setConvergence] = React.useState<number[]>([]);

  const handleOptimize = async () => {
    setStep('loading');
    setError(null);
    setStatusMessage('Loading user data...');
    setProgress(10);

    try {
      let inputs: any;
      let prefs: any;
      let currentSchedule: any[] = [];

      if (useRealData) {
        const [activitiesRes, workLogsRes, journalRes, goalsRes, schedulesRes] = await Promise.all([
          mockApi.getActivities(format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
          mockApi.getSchedules(format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
        ].concat([
          Promise.resolve({ data: [], error: null }),
          Promise.resolve({ data: [], error: null }),
          Promise.resolve({ data: [], error: null }),
        ]));

        const activities = activitiesRes.data || [];
        const schedules = schedulesRes.data || [];
        const workLogs: any[] = [];
        const journal: any[] = [];
        const goals: any[] = [];

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

      setStatusMessage('Optimizing schedule with Genetic Algorithm...');
      setProgress(50);

      const result = await runGeneticAlgorithm(inputs, prefs, {
        config: { populationSize: 100, generations: 150 },
        onGeneration: (gen, best, avg) => {
          setProgress(50 + Math.floor((gen / 150) * 40));
          setStatusMessage(`Generation ${gen}: Best fitness = ${best.toFixed(1)}`);
        },
        onComplete: (best, conv) => {
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-cyan-500" size={28} />
            Smart Schedule Optimizer
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered daily schedule optimization using Fuzzy Logic + Genetic Algorithm
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRealData}
              onChange={(e) => setUseRealData(e.target.checked)}
              className="w-4 h-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm">Use real user data</span>
          </label>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg"
        >
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setStep('idle')} className="ml-auto text-sm text-red-400 hover:underline">
            Try Again
          </button>
        </motion.div>
      )}

      {(step === 'loading' || step === 'running') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            <div>
              <p className="font-medium">{statusMessage}</p>
              <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">{progress}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'results' && optimizedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Fitness Score</p>
                  <p className="text-3xl font-bold text-green-400">{optimizedSchedule.fitness.toFixed(1)}</p>
                </div>
                <Zap className="h-10 w-10 text-green-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 p-6 rounded-xl border-l-4 border-cyan-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Balance Score</p>
                  <p className="text-3xl font-bold text-cyan-400">{optimizedSchedule.balanceScore.toFixed(1)}</p>
                </div>
                <Brain className="h-10 w-10 text-cyan-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 p-6 rounded-xl border-l-4 border-yellow-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Productivity</p>
                  <p className="text-3xl font-bold text-yellow-400">{optimizedSchedule.productivityScore.toFixed(1)}</p>
                </div>
                <BarChart2 className="h-10 w-10 text-yellow-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Stress Score</p>
                  <p className="text-3xl font-bold text-red-400">{optimizedSchedule.stressScore.toFixed(1)}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FitnessChart convergence={convergence} />
            <FuzzyExplanation 
              firedRules={optimizedSchedule.firedRules || []} 
              balanceScore={optimizedSchedule.balanceScore}
              stressScore={optimizedSchedule.stressScore}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScheduleView 
              slots={optimizedSchedule.slots} 
              title="Optimized Schedule" 
            />
            {comparisonResults.length > 0 && (
              <ComparisonTable rows={comparisonResults} />
            )}
          </div>

          {comparisonResults.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisonResults.slice(1, 3).map((result, idx) => (
                <ScheduleView 
                  key={result.name}
                  slots={result.schedule} 
                  title={result.name}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Download size={20} />
              Export Schedule (CSV)
            </button>
            <button
              onClick={handleOptimize}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
              Re-optimize
            </button>
          </div>
        </motion.div>
      )}

      {step === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-xl text-center"
        >
          <Brain className="h-16 w-16 text-cyan-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Ready to Optimize Your Schedule?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            The Smart Schedule Optimizer analyzes your work patterns, sleep, exercise, stress levels, and goals 
            using Fuzzy Logic, then generates an optimal daily schedule using a Genetic Algorithm that maximizes 
            work-life balance and productivity while minimizing stress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto text-left">
            {[
              { icon: Brain, title: 'Fuzzy Logic', desc: 'Evaluates balance & stress from vague inputs' },
              { icon: Zap, title: 'Genetic Algorithm', desc: 'Evolves optimal schedules over generations' },
              { icon: BarChart2, title: 'Baseline Comparison', desc: 'Compares against manual, template & greedy' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 bg-gray-700 rounded-lg">
                <Icon className="h-8 w-8 text-cyan-500 mb-2" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleOptimize}
            className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors text-lg font-medium"
          >
            <Brain size={24} />
            Generate Optimized Schedule
          </button>
        </motion.div>
      )}
    </div>
  );
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}