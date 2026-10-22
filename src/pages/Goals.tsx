import React from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { mockApi } from '../lib/dummyData';

const categories = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'learning', label: 'Learning' },
];

export default function Goals() {
  const [showNewGoalModal, setShowNewGoalModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [goals, setGoals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newGoal, setNewGoal] = React.useState({
    title: '',
    deadline: '',
  });

  React.useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await mockApi.getGoals();
      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newGoal.title || !newGoal.deadline) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await mockApi.createGoal(
        newGoal.title,
        selectedCategory,
        newGoal.deadline
      );
      if (error) throw error;

      await loadGoals();
      setShowNewGoalModal(false);
      setNewGoal({ title: '', deadline: '' });
      setSelectedCategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await mockApi.updateGoalProgress(id, progress);
      if (error) throw error;
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!showNewGoalModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNewGoalModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showNewGoalModal]);

  return (
    <div className="page">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Goals &amp; Objectives</h1>
          <p className="page-subtitle">Set goals and track your progress toward them.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewGoalModal(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus size={20} aria-hidden="true" />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="alert-danger mb-6" role="alert">
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {goals.length === 0 && !loading && !error && (
        <div className="card p-8 sm:p-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-charcoal-600" aria-hidden="true" />
          <h2 className="text-heading-md font-semibold text-charcoal-900 mb-1">No goals yet</h2>
          <p className="text-charcoal-700">Add your first goal to start tracking progress.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-heading-sm font-semibold text-charcoal-900 mb-1 break-words">{goal.title}</h3>
                <span className="text-sm text-charcoal-700">
                  Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
                </span>
              </div>
              <span className="badge-primary shrink-0 capitalize">{goal.category}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-charcoal-800">
                <span>Progress</span>
                <span className="font-semibold">{goal.progress}%</span>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress for ${goal.title}`}>
                <div
                  className="progress-fill bg-sage-600"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                className="w-full accent-sage-600 h-6"
                aria-label={`Update progress for ${goal.title}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {showNewGoalModal && (
        <div className="modal-overlay" onClick={() => setShowNewGoalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-goal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-goal-title" className="text-heading-md font-bold text-charcoal-900 mb-4">Add New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label htmlFor="goal-title" className="label">Title</label>
                <input
                  id="goal-title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="goal-category" className="label">Category</label>
                <select
                  id="goal-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="goal-deadline" className="label">Deadline</label>
                <input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  <Target size={20} aria-hidden="true" />
                  Add Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
