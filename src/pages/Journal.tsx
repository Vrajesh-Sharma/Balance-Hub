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
  X,
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
  productive: 'text-amber-800 bg-honey-100 border-honey-300',
  happy: 'text-emerald-800 bg-emerald-100 border-emerald-300',
  neutral: 'text-sage-800 bg-sage-100 border-sage-300',
  stressed: 'text-coral-800 bg-coral-100 border-coral-300',
  tired: 'text-lavender-800 bg-lavender-100 border-lavender-300',
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

  React.useEffect(() => {
    if (!showNewEntryModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNewEntryModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showNewEntryModal]);

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
      const { error } = await mockApi.deleteJournalEntry(Number(id)) ;
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
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 lg:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-sage-700 shrink-0" aria-hidden="true" />
              Work-Life Journal
            </h1>
            <p className="page-subtitle">Document your journey and track your growth</p>
          </div>
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="btn-primary self-start sm:self-auto"
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
            className="card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-charcoal-700 text-sm font-medium">Total Entries</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1 truncate">{stats.total}</p>
              </div>
              <div className="p-2.5 sm:p-3 shrink-0 bg-sage-100 rounded-xl text-sage-700">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-charcoal-700 text-sm font-medium">This Week</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1 truncate">{stats.thisWeek}</p>
              </div>
              <div className="p-2.5 sm:p-3 shrink-0 bg-emerald-100 rounded-xl text-emerald-700">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-charcoal-700 text-sm font-medium">Categories</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1 truncate">{stats.categories}</p>
              </div>
              <div className="p-2.5 sm:p-3 shrink-0 bg-lavender-100 rounded-xl text-lavender-700">
                <Tag className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-charcoal-700 text-sm font-medium">Avg Length</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1 truncate">{stats.avgLength} chars</p>
              </div>
              <div className="p-2.5 sm:p-3 shrink-0 bg-honey-100 rounded-xl text-orange-700">
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
            className="flex items-center gap-3 p-4 bg-coral-100 border border-coral-200 rounded-xl text-coral-800"
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
          className="card p-4 sm:p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-600" size={20} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
                aria-label="Search entries"
              />
            </div>
            <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary btn-sm flex items-center gap-2 ${showFilters ? 'bg-sage-100 border-sage-300 text-sage-800' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full min-[480px]:w-auto min-w-[180px]"
                aria-label="Filter by category"
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
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="flex flex-wrap gap-3">
                  {journalData.moods.map((mood) => {
                    const Icon = moodIcons[mood.id as keyof typeof moodIcons];
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        className={`px-3 py-1.5 min-h-[36px] rounded-full text-sm font-medium border transition-all ${moodColors[mood.id as keyof typeof moodColors]}`}
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] items-start">
        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredEntries.map((entry, index) => {
                const MoodIcon = moodIcons[entry.mood as keyof typeof moodIcons] || Meh;
                const moodColor = moodColors[entry.mood as keyof typeof moodColors] || moodColors.neutral;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 sm:p-6 hover:bg-cream-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 bg-cream-100 rounded-xl border border-border shrink-0">
                          <span className="font-bold text-charcoal-900 text-lg">{format(new Date(entry.date), 'MMM')}</span>
                          <span className="font-display font-bold text-2xl text-sage-700">{format(new Date(entry.date), 'd')}</span>
                          <span className="text-xs text-charcoal-600">{format(new Date(entry.date), 'EEE')}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full border text-xs font-medium ${moodColor}`}>
                              <MoodIcon className="h-3 w-3 inline mr-1" />
                              {moodLabels[entry.mood as keyof typeof moodLabels]}
                            </span>
                            {entry.category && (
                              <span className="px-3 py-1 bg-charcoal-100 rounded-full text-xs text-charcoal-800 flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {entry.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="inline-flex h-10 w-10 items-center justify-center text-charcoal-700 hover:text-coral-700 hover:bg-coral-100 rounded-xl transition-colors"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-charcoal-800 whitespace-pre-wrap leading-relaxed break-words">{entry.content}</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-charcoal-700"
              >
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 text-charcoal-600" />
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">
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
          className="min-w-0"
        >
          <div className="card p-4 sm:p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md font-bold text-charcoal-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-700" />
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
                  className="w-full text-left p-4 rounded-xl transition-all duration-300 bg-cream-50 border border-border hover:border-sage-300 hover:bg-sage-50"
                >
                  <p className="text-sm text-charcoal-800 mb-2">{prompt.question}</p>
                  <span className="text-xs px-2 py-1 bg-sage-100 text-sage-800 rounded-full">{prompt.category}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowNewEntryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content max-w-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-entry-title"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between gap-3">
                <h2 id="new-entry-title" className="text-heading-md font-bold text-charcoal-900">New Journal Entry</h2>
                <button
                  onClick={() => setShowNewEntryModal(false)}
                  type="button"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="p-4 sm:p-6 space-y-6">
                <div>
                  <label htmlFor="entry-category" className="label">Category</label>
                  <select
                    id="entry-category"
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
                  <label htmlFor="entry-content" className="label">Content</label>
                  <textarea
                    id="entry-content"
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
                          aria-pressed={isSelected}
                          className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 min-w-[76px] flex-1 sm:flex-none ${color} ${isSelected ? 'ring-2 ring-sage-600 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                          <span className="text-sm font-medium capitalize">{moodLabels[mood.id as keyof typeof moodLabels]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
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