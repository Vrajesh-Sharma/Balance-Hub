import React from 'react';
import { motion } from 'framer-motion';
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
  Tag
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

export default function Journal() {
  const [showNewEntryModal, setShowNewEntryModal] = React.useState(false);
  const [selectedPrompt, setSelectedPrompt] = React.useState('');
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
      setSelectedPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Work-Life Journal</h1>
          <p className="text-gray-400">Document your journey and track your growth</p>
        </div>
        <button
          onClick={() => setShowNewEntryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Entry
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500 bg-opacity-10 p-4 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">All Categories</option>
              {journalData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const MoodIcon = moodIcons[entry.mood as keyof typeof moodIcons] || Meh;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-cyan-500" />
                        <span className="text-gray-400">
                          {format(new Date(entry.date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      {entry.category && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
                          <Tag size={16} />
                          <span className="text-sm">{entry.category}</span>
                        </div>
                      )}
                    </div>
                    <MoodIcon size={24} className="text-cyan-500" />
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl h-fit">
          <h2 className="text-lg font-semibold mb-4">Writing Prompts</h2>
          <div className="space-y-3">
            {journalData.prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => {
                  setShowNewEntryModal(true);
                  setNewEntry(prev => ({ ...prev, content: prompt.question }));
                }}
                className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <p className="text-sm text-gray-300">{prompt.question}</p>
                <span className="text-xs text-cyan-500 mt-1">{prompt.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showNewEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl"
          >
            <h2 className="text-xl font-bold mb-4">New Journal Entry</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2"
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
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2 min-h-[200px]"
                  placeholder="Write your thoughts here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mood</label>
                <div className="flex gap-4">
                  {journalData.moods.map((mood) => {
                    const Icon = moodIcons[mood.id as keyof typeof moodIcons];
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => setNewEntry({ ...newEntry, mood: mood.id })}
                        className={`p-3 rounded-lg transition-colors ${
                          newEntry.mood === mood.id
                            ? 'bg-cyan-500 bg-opacity-20 border border-cyan-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <Icon size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <BookOpen size={20} />
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}