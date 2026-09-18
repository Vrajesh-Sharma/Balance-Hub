import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Calendar,
  Search,
  Filter,
  Zap,
  Smile,
  Meh,
  Frown,
  Battery,
  AlertCircle,
  Tag,
  Pen,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { mockApi } from '../lib/dummyData';
import { journalData } from '../lib/staticData';

const moodIcons = {
  productive: Zap,
  happy: Smile,
  neutral: Meh,
  stressed: Frown,
  tired: Battery,
};

const moodColors = {
  productive: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  happy: 'text-green-400 bg-green-500/10 border-green-500/20',
  neutral: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  stressed: 'text-red-400 bg-red-500/10 border-red-500/20',
  tired: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const moodLabels = {
  productive: 'Productive',
  happy: 'Happy',
  neutral: 'Neutral',
  stressed: 'Stressed',
  tired: 'Tired',
};

export default function Journal() {
  const [showNewEntryModal, setShowNewEntryModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newEntry, setNewEntry] = React.useState({
    content: '',
    mood: 'neutral',
    category: '',
  });
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await mockApi.getJournalEntries();
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.content || !newEntry.category) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await mockApi.createJournalEntry(
        newEntry.content,
        newEntry.mood,
        newEntry.category,
        format(new Date(), 'yyyy-MM-dd')
      );
      if (error) throw error;

      await loadEntries();
      setShowNewEntryModal(false);
      setNewEntry({ content: '', mood: 'neutral', category: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      const { error } = await mockApi.deleteJournalEntry(id);
      if (error) throw error;
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery 
      ? entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? entry.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: entries.length,
    thisWeek: entries.filter(e => new Date(e.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    categories: new Set(entries.map(e => e.category)).size,
    avgLength: entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.content.length, 0) / entries.length) : 0,
  };

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
            <h1 className="text-display-sm font-display font-bold text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary-400" />
              Work-Life Journal
            </h1>
            <p className="text-dark-400 mt-1">Document your journey and track your growth</p>
          </div>
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5" />
            New Entry
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">Total Entries</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">This Week</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{stats.thisWeek}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                <Calendar className="h-6 w-6" />
              </div>
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
                <p className="text-dark-400 text-sm font-medium">Categories</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{stats.categories}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Tag className="h-6 w-6" />
              </div>
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
                <p className="text-dark-400 text-sm font-medium">Avg Length</p>
                <p className="text-3xl font-display font-bold text-white mt-1">{stats.avgLength} chars</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                <Pen className="h-6 w-6" />
              </div>
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

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary btn-sm flex items-center gap-2 ${showFilters ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto min-w-[180px]"
              >
                <option value="">All Categories</option>
                {journalData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-dark-700"
              >
                <div className="flex flex-wrap gap-3">
                  {journalData.moods.map((mood) => {
                    const Icon = moodIcons[mood.id as keyof typeof moodIcons];
                    return (
                      <button
                        key={mood.id}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${moodColors[mood.id as keyof typeof moodColors]}`}
                      >
                        <Icon className="h-4 w-4 inline mr-1" />
                        {moodLabels[mood.id as keyof typeof moodLabels]}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-dark-700">
              {filteredEntries.map((entry, index) => {
                const MoodIcon = moodIcons[entry.mood as keyof typeof moodIcons] || Meh;
                const moodColor = moodColors[entry.mood as keyof typeof moodColors] || moodColors.neutral;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-6 hover:bg-dark-800/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 bg-dark-800 rounded-xl border border-dark-700">
                          <span className="font-bold text-white text-lg">{format(new Date(entry.date), 'MMM')}</span>
                          <span className="font-display font-bold text-2xl text-primary-400">{format(new Date(entry.date), 'd')}</span>
                          <span className="text-xs text-dark-400">{format(new Date(entry.date), 'EEE')}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${moodColor}`}>
                              <MoodIcon className="h-3 w-3 inline mr-1" />
                              {moodLabels[entry.mood as keyof typeof moodLabels]}
                            </span>
                            {entry.category && (
                              <span className="px-3 py-1 bg-dark-700 rounded-full text-xs text-dark-300 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {entry.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-dark-300 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-dark-400"
              >
                <BookOpen className="h-16 w-16 mx-auto mb-6 text-dark-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery || selectedCategory ? 'No matching entries' : 'Start your journal'}
                </h3>
                <p className="mb-6 max-w-md mx-auto">
                  {searchQuery || selectedCategory
                    ? 'Try adjusting your search or filters'
                    : 'Document your thoughts, track your mood, and build a habit of reflection.'}
                </p>
                {!searchQuery && !selectedCategory && (
                  <button
                    onClick={() => setShowNewEntryModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-5 w-5" />
                    Write First Entry
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Writing Prompts Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden lg:block"
        >
          <div className="card p-6 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Writing Prompts
              </h2>
            </div>
            <div className="space-y-3">
              {journalData.prompts.map((prompt) => (
                <motion.button
                  key={prompt.id}
                  onClick={() => {
                    setShowNewEntryModal(true);
                    setNewEntry(prev => ({ ...prev, content: prompt.question }));
                  }}
                  whileHover={{ x: 4 }}
                  className="w-full text-left p-4 rounded-xl transition-all duration-300 bg-dark-800/50 border border-dark-700 hover:border-primary-500/30 hover:bg-primary-500/5"
                >
                  <p className="text-sm text-dark-300 mb-2">{prompt.question}</p>
                  <span className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded-full">{prompt.category}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewEntryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                <h2 className="text-heading-md font-bold text-white">New Journal Entry</h2>
                <button
                  onClick={() => setShowNewEntryModal(false)}
                  className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"
                >
                  <ChevronUp className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="p-6 space-y-6">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select category...</option>
                    {journalData.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Content</label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    className="input min-h-[200px] resize-y"
                    placeholder="Write your thoughts here..."
                    required
                  />
                </div>

                <div>
                  <label className="label">Mood</label>
                  <div className="flex flex-wrap gap-3">
                    {journalData.moods.map((mood) => {
                      const Icon = moodIcons[mood.id as keyof typeof moodIcons];
                      const isSelected = newEntry.mood === mood.id;
                      const color = moodColors[mood.id as keyof typeof moodColors];
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setNewEntry({ ...newEntry, mood: mood.id })}
                          className={`p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 min-w-[80px] ${isSelected ? `border-2 ${color.replace('border-', 'border-2 ')}` : `border ${color} hover:border-opacity-50`}`}
                        >
                          <Icon className={`h-7 w-7 ${color.split(' ')[0]}`} />
                          <span className="text-sm font-medium capitalize">{moodLabels[mood.id as keyof typeof moodLabels]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                  <button
                    type="button"
                    onClick={() => setShowNewEntryModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-5 w-5"
                        >
                          <Pen className="h-5 w-5" />
                        </motion.span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-5 w-5" />
                        Save Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}