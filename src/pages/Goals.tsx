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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Goals & Objectives</h1>
        <button
          onClick={() => setShowNewGoalModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500 bg-opacity-10 p-4 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{goal.title}</h3>
                <span className="text-sm text-gray-400">
                  Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
                </span>
              </div>
              <span className="px-2 py-1 text-sm rounded-full bg-gray-700">
                {goal.category}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg p-2"
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
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <Target size={20} />
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