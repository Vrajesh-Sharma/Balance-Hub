import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Link as LinkIcon, Play } from 'lucide-react';

const resources = [
  {
    category: 'Templates',
    items: [
      {
        title: 'Daily Planner Template',
        description: 'A structured template for planning your day with balance in mind.',
        type: 'download',
        icon: Download,
      },
      {
        title: 'Goal Tracking Sheet',
        description: 'Track your personal and professional goals effectively.',
        type: 'download',
        icon: Download,
      },
    ],
  },
  {
    category: 'Recommended Reading',
    items: [
      {
        title: 'The Power of Rest',
        description: 'Learn why rest is crucial for productivity and well-being.',
        type: 'link',
        icon: LinkIcon,
      },
      {
        title: 'Balance Through Boundaries',
        description: 'Setting healthy boundaries for work-life balance.',
        type: 'link',
        icon: LinkIcon,
      },
    ],
  },
  {
    category: 'Video Resources',
    items: [
      {
        title: 'Mindfulness at Work',
        description: 'A guide to practicing mindfulness during your workday.',
        type: 'video',
        icon: Play,
      },
      {
        title: 'Time Management Techniques',
        description: 'Expert tips for managing your time effectively.',
        type: 'video',
        icon: Play,
      },
    ],
  },
];

export default function Resources() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold">Resource Hub</h2>
        </div>

        <div className="space-y-8">
          {resources.map((category) => (
            <div key={category.category}>
              <h3 className="text-xl font-bold mb-4">{category.category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-600 p-2 rounded-lg">
                        <item.icon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                        <button className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                          {item.type === 'download'
                            ? 'Download Template'
                            : item.type === 'link'
                            ? 'Read Article'
                            : 'Watch Video'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <h3 className="text-xl font-bold mb-4">Community Forum</h3>
        <p className="text-gray-300 mb-4">
          Join our community to discuss work-life balance strategies, share experiences,
          and get support from others on the same journey.
        </p>
        <button className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors">
          Join Discussion
        </button>
      </motion.div>
    </div>
  );
}