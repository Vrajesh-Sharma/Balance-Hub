import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Download, 
  Play, 
  FileText,
  ExternalLink,
  ChevronRight,
  Clock,
  Users,
  Brain,
  Heart,
  Sparkles,
  Search,
} from 'lucide-react';

const resources = [
  {
    category: 'Templates & Tools',
    icon: FileText,
    color: 'bg-sage-100 text-sage-800 border-sage-300',
    items: [
      {
        title: 'Daily Planner Template',
        description: 'A structured template for planning your day with balance in mind. Includes time-blocking, priorities, and reflection sections.',
        type: 'download',
        icon: Download,
        link: '/templates/daily-planner.pdf',
        fileName: 'daily-planner.pdf',
        tags: ['PDF', 'Printable'],
        time: '2 min read',
      },
      {
        title: 'Goal Tracking Sheet',
        description: 'Track your personal and professional goals effectively with milestones, progress bars, and review checkpoints.',
        type: 'download',
        icon: Download,
        link: '/templates/goal-tracker.xlsx',
        fileName: 'goal-tracker.xlsx',
        tags: ['Excel', 'Editable'],
        time: '5 min setup',
      },
      {
        title: 'Weekly Review Template',
        description: 'Reflect on your week, celebrate wins, identify blockers, and plan for the week ahead.',
        type: 'download',
        icon: Download,
        link: '/templates/weekly-review.pdf',
        fileName: 'weekly-review.pdf',
        tags: ['PDF', 'Guided'],
        time: '10 min',
      },
      {
        title: 'Habit Tracker',
        description: 'Build lasting habits with this customizable tracker. Supports daily, weekly, and monthly habits.',
        type: 'download',
        icon: Download,
        link: '/templates/habit-tracker.pdf',
        fileName: 'habit-tracker.pdf',
        tags: ['PDF', 'Customizable'],
        time: '3 min setup',
      },
    ],
  },
  {
    category: 'Recommended Reading',
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    items: [
      {
        title: 'The Power of Rest',
        description: 'Learn why rest is crucial for productivity and well-being. Scientific insights on recovery and performance.',
        type: 'link',
        icon: ExternalLink,
        link: 'https://kripalu.org/resources/power-rest-upside-downtime',
        tags: ['Article', 'Science-backed'],
        time: '8 min read',
      },
      {
        title: 'Balance Through Boundaries',
        description: 'Setting healthy boundaries for work-life balance. Practical strategies for saying no and protecting your time.',
        type: 'link',
        icon: ExternalLink,
        link: 'https://digital.akbizmag.com/issue/july-2022/find-balance-through-boundaries/',
        tags: ['Article', 'Actionable'],
        time: '6 min read',
      },
      {
        title: 'Deep Work by Cal Newport',
        description: 'Summary and key takeaways from the bestseller on focused success in a distracted world.',
        type: 'link',
        icon: ExternalLink,
        link: 'https://www.calnewport.com/books/deep-work/',
        tags: ['Book Summary', 'Productivity'],
        time: '12 min read',
      },
      {
        title: 'Atomic Habits Cheat Sheet',
        description: 'Quick reference guide for James Clear\'s habit formation framework with implementation tips.',
        type: 'link',
        icon: ExternalLink,
        link: 'https://jamesclear.com/atomic-habits-cheat-sheet',
        tags: ['Cheat Sheet', 'Reference'],
        time: '5 min read',
      },
    ],
  },
  {
    category: 'Video Resources',
    icon: Play,
    color: 'bg-coral-100 text-coral-800 border-coral-300',
    items: [
      {
        title: 'Mindfulness at Work',
        description: 'A guide to practicing mindfulness during your workday. Simple techniques for stress reduction.',
        type: 'video',
        icon: Play,
        link: 'https://youtu.be/QtE00VP4W3Y',
        tags: ['Guided', '10 min'],
        time: '10 min',
      },
      {
        title: 'Time Management Techniques',
        description: 'Expert tips for managing your time effectively. Covers Pomodoro, time blocking, and prioritization.',
        type: 'video',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=VUk6LXRZMMk',
        tags: ['Tutorial', '20 min'],
        time: '20 min',
      },
      {
        title: 'The Science of Sleep',
        description: 'Understanding sleep cycles and optimizing your rest for better performance and health.',
        type: 'video',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=5MuIMqhT8DM',
        tags: ['Science', 'Health'],
        time: '15 min',
      },
      {
        title: 'Building Better Routines',
        description: 'How to design morning and evening routines that stick. Behavioral psychology principles.',
        type: 'video',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=8QxvMkvlmW4',
        tags: ['Psychology', 'Habits'],
        time: '18 min',
      },
    ],
  },
  {
    category: 'Mental Wellness',
    icon: Brain,
    color: 'bg-lavender-100 text-lavender-800 border-lavender-300',
    items: [
      {
        title: '5-Minute Breathing Exercise',
        description: 'Quick box breathing technique for instant calm. Perfect for stressful moments.',
        type: 'link',
        icon: Sparkles,
        link: '/wellness/breathing-box',
        tags: ['Guided', 'Quick'],
        time: '5 min',
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Full body relaxation technique to release tension and improve sleep quality.',
        type: 'link',
        icon: Sparkles,
        link: '/wellness/pmr-guide',
        tags: ['Guided', 'Sleep'],
        time: '15 min',
      },
      {
        title: 'Cognitive Reframing Worksheet',
        description: 'CBT-based worksheet for identifying and reframing negative thought patterns.',
        type: 'download',
        icon: Download,
        link: '/templates/cognitive-reframing.pdf',
        fileName: 'cognitive-reframing.pdf',
        tags: ['Worksheet', 'CBT'],
        time: '10 min',
      },
    ],
  },
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleResourceClick = (item: typeof resources[0]['items'][0]) => {
    if (item.type === 'download') {
      const link = document.createElement('a');
      link.href = item.link;
      link.download = item.fileName || '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(item.link, '_blank', 'noopener noreferrer');
    }
  };

  const allItems = resources.flatMap((cat, catIndex) => 
    cat.items.map(item => ({ ...item, category: cat.category, categoryIndex: catIndex }))
  );

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              Resource Hub
            </h1>
            <p className="page-subtitle">Curated tools, guides, and content for your balance journey</p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-600" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
              aria-label="Search resources"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-2"
        >
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Resource categories">
            {resources.map((category, index) => (
              <button
                key={category.category}
                type="button"
                onClick={() => setActiveCategory(index)}
                role="tab"
                aria-selected={activeCategory === index}
                className={`px-3 sm:px-4 min-h-[44px] rounded-xl border text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  activeCategory === index
                    ? 'bg-sage-100 text-sage-800 border-sage-300'
                    : 'text-charcoal-800 border-transparent hover:bg-cream-100 hover:text-charcoal-900'
                }`}
              >
                <category.icon className="h-4 w-4" />
                {category.category}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === index ? 'bg-white text-sage-800' : 'bg-charcoal-100 text-charcoal-800'
                }`}>
                  {category.items.length}
                </span>
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 sm:px-4 min-h-[44px] rounded-xl text-sm font-medium text-amber-800 bg-honey-100 border border-honey-300 flex items-center gap-2"
                aria-label="Clear search"
              >
                <Sparkles className="h-4 w-4" />
                Search Results
                <span className="px-2 py-0.5 rounded-full text-xs bg-white text-amber-800">
                  {filteredItems.length}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {searchQuery ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.categoryIndex}-${item.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-interactive group min-w-0"
                >
                  <ResourceCard 
                    item={{ ...item, categoryColor: resources[item.categoryIndex].color }}
                    onClick={() => handleResourceClick(item)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources[activeCategory].items.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-interactive group min-w-0"
                >
                  <ResourceCard 
                    item={{ ...item, categoryColor: resources[activeCategory].color }}
                    onClick={() => handleResourceClick(item)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {(searchQuery && filteredItems.length === 0) || (!searchQuery && resources[activeCategory].items.length === 0) ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full p-8 sm:p-16 text-center"
            >
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 text-charcoal-600" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">
                {searchQuery ? 'No resources found' : 'No resources in this category'}
              </h3>
              <p className="text-charcoal-700 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all categories'
                  : 'Resources coming soon!'}
              </p>
            </motion.div>
          ) : null}
        </motion.div>

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="card p-5 sm:p-8 bg-sage-50 border-sage-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-heading-lg font-bold text-charcoal-900 mb-3">Join Our Community</h2>
                <p className="text-charcoal-700 mb-6">
                  Connect with others on their work-life balance journey. Share experiences, ask questions, and get support.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  <a
                    href="https://thinkinginenglish.blog/2023/09/02/the-perfect-work-life-balance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary group"
                  >
                    <Users className="h-5 w-5" />
                    Join Discussion
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button type="button" className="btn-secondary">
                    <Heart className="h-5 w-5" />
                    Share Your Story
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-left">
                <div>
                  <div className="text-3xl font-display font-bold text-sage-800">10K+</div>
                  <div className="text-charcoal-700 text-sm">Members</div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-lavender-800">500+</div>
                  <div className="text-charcoal-700 text-sm">Discussions</div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-emerald-800">24/7</div>
                  <div className="text-charcoal-700 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Collections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-heading-lg font-bold text-charcoal-900 mb-4 sm:mb-6">Featured Collections</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                icon: Clock, 
                title: 'Quick Reads', 
                desc: 'Resources under 5 minutes for busy days',
                count: '12 items',
                color: 'bg-honey-100 text-amber-800 border-honey-300',
              },
              { 
                icon: Sparkles, 
                title: 'Beginner Friendly', 
                desc: 'Start here if you\'re new to balance practices',
                count: '8 items',
                color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              },
              { 
                icon: Brain, 
                title: 'Deep Dives', 
                desc: 'Comprehensive guides for mastery',
                count: '6 items',
                color: 'bg-lavender-100 text-lavender-800 border-lavender-300',
              },
            ].map((collection, index) => (
              <motion.div
                key={collection.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card-interactive p-5 sm:p-6 group"
              >
                <div className={`p-3 rounded-xl mb-4 w-fit border ${collection.color}`}>
                  <collection.icon className="h-6 w-6" />
                </div>
                <h3 className="text-heading-sm font-bold text-charcoal-900 mb-2 group-hover:text-sage-700 transition-colors">{collection.title}</h3>
                <p className="text-body-sm text-charcoal-700 mb-3">{collection.desc}</p>
                <button type="button" className="text-sm font-semibold text-sage-700 hover:text-sage-900 flex items-center gap-1 group-hover:gap-2 transition-all min-h-[44px]">
                  Explore
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function ResourceCard({ item, onClick }: { 
  item: typeof resources[0]['items'][0] & { categoryColor: string };
  onClick: () => void;
}) {
  const Icon = item.icon;
  const typeLabels: Record<string, string> = {
    download: 'Download',
    link: 'Read Article',
    video: 'Watch Video',
  };
  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    download: Download,
    link: ExternalLink,
    video: Play,
  };

  return (
    <div
      className="p-5 sm:p-6 h-full cursor-pointer rounded-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${typeLabels[item.type]}: ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl border shrink-0 ${item.categoryColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-charcoal-100 rounded text-xs text-charcoal-800">
                {tag}
              </span>
            ))}
          </div>
          <h4 className="font-semibold text-charcoal-900 mb-1 group-hover:text-sage-700 transition-colors break-words">{item.title}</h4>
        </div>
      </div>
      <p className="text-charcoal-700 text-sm mb-4 leading-relaxed">{item.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-charcoal-700 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.time}
        </span>
        <span className="text-sm font-semibold text-sage-700 group-hover:text-sage-900 flex items-center gap-1 group-hover:gap-2 transition-all">
          {typeLabels[item.type]}
          {(() => {
            const TypeIcon = typeIcons[item.type];
            return <TypeIcon className="h-4 w-4" />;
          })()}
        </span>
      </div>
    </div>
  );
}