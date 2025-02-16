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
        link: '/templates/daily-planner.pdf',
        fileName: 'daily-planner.pdf'
      },
      {
        title: 'Goal Tracking Sheet',
        description: 'Track your personal and professional goals effectively.',
        type: 'download',
        icon: Download,
        link: '/templates/goal-tracker.xlsx',
        fileName: 'goal-tracker.xlsx'
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
        link: 'https://kripalu.org/resources/power-rest-upside-downtime#:~:text=The%20spiritual%20benefits%20of%20resting,a%20felt%2Dsense%20of%20belonging.'
      },
      {
        title: 'Balance Through Boundaries',
        description: 'Setting healthy boundaries for work-life balance.',
        type: 'link',
        icon: LinkIcon,
        link: 'https://digital.akbizmag.com/issue/july-2022/find-balance-through-boundaries/'
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
        link: 'https://youtu.be/QtE00VP4W3Y?si=UH3d3JXSTm8NBibf'
      },
      {
        title: 'Time Management Techniques',
        description: 'Expert tips for managing your time effectively.',
        type: 'video',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=VUk6LXRZMMk'
      },
    ],
  },
];

export default function Resources() {
  const handleResourceClick = (item: typeof resources[0]['items'][0]) => {
    if (item.type === 'download') {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = item.link;
      link.download = item.fileName || '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open external links in new tab
      window.open(item.link, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
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
                    className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-600 p-2 rounded-lg">
                        <item.icon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                        <button 
                          onClick={() => handleResourceClick(item)}
                          className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          {item.type === 'download' ? (
                            <>
                              <Download className="h-4 w-4" />
                              Download Template
                            </>
                          ) : item.type === 'link' ? (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              Read Article
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Watch Video
                            </>
                          )}
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
        <button 
          onClick={() => window.open('https://thinkinginenglish.blog/2023/09/02/the-perfect-work-life-balance/', '_blank', 'noopener noreferrer')}
          className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <BookOpen className="h-5 w-5" />
          Join Discussion
        </button>
      </motion.div>
    </div>
  );
}