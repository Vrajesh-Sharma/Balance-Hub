import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw, Brain, Wind, Heart } from 'lucide-react';

const breathingPatterns = [
  {
    name: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8',
    inhale: 4,
    hold: 7,
    exhale: 8,
  },
  {
    name: 'Box Breathing',
    description: 'Equal duration for inhale, hold, exhale, and hold',
    inhale: 4,
    hold: 4,
    exhale: 4,
  },
];

const quickTips = [
  {
    title: 'Take a Walk',
    description: 'A 10-minute walk can help clear your mind and reduce stress levels.',
    icon: Wind,
  },
  {
    title: 'Deep Breathing',
    description: 'Practice deep breathing exercises to activate your relaxation response.',
    icon: Brain,
  },
  {
    title: 'Mindful Moment',
    description: 'Take a moment to focus on your senses and ground yourself.',
    icon: Heart,
  },
];

export default function StressHub() {
  const [isBreathing, setIsBreathing] = React.useState(false);
  const [currentPhase, setCurrentPhase] = React.useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedPattern, setSelectedPattern] = React.useState(breathingPatterns[0]);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let interval: number;
    if (isBreathing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          const maxProgress = currentPhase === 'inhale' 
            ? selectedPattern.inhale 
            : currentPhase === 'hold'
              ? selectedPattern.hold
              : selectedPattern.exhale;

          if (newProgress >= maxProgress) {
            setCurrentPhase((prev) => {
              if (prev === 'inhale') return 'hold';
              if (prev === 'hold') return 'exhale';
              return 'inhale';
            });
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, currentPhase, selectedPattern]);

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      setCurrentPhase('inhale');
      setProgress(0);
    }
  };

  const resetBreathing = () => {
    setIsBreathing(false);
    setCurrentPhase('inhale');
    setProgress(0);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <h2 className="text-2xl font-bold mb-6">Breathing Exercises</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              {breathingPatterns.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => {
                    setSelectedPattern(pattern);
                    resetBreathing();
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedPattern.name === pattern.name
                      ? 'bg-cyan-500 bg-opacity-20 border border-cyan-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <h3 className="font-medium">{pattern.name}</h3>
                  <p className="text-sm text-gray-400">{pattern.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-current text-gray-700"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-current text-cyan-500"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={
                    2 * Math.PI * 88 *
                    (1 -
                      progress /
                        (currentPhase === 'inhale'
                          ? selectedPattern.inhale
                          : currentPhase === 'hold'
                          ? selectedPattern.hold
                          : selectedPattern.exhale))
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{currentPhase}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={toggleBreathing}
                className="bg-cyan-500 hover:bg-cyan-600 p-3 rounded-full transition-colors"
              >
                {isBreathing ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={resetBreathing}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {quickTips.map((tip) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <tip.icon className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
            <p className="text-gray-300">{tip.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <h2 className="text-2xl font-bold mb-6">Guided Meditation</h2>
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/ZToicYcHIOU"
            title="Guided Meditation"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
}