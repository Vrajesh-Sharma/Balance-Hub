import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, Brain, Wind, Heart, Music, Volume2, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { stressHubData } from '../lib/staticData';

const breathingPatterns = stressHubData.breathingPatterns;
const quickTips = stressHubData.quickTips;

const phaseLabels = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
};

const phaseColors = {
  inhale: 'text-primary-400',
  hold: 'text-yellow-400',
  exhale: 'text-green-400',
};

const phaseBgColors = {
  inhale: 'bg-primary-500',
  hold: 'bg-yellow-500',
  exhale: 'bg-green-500',
};

export default function StressHub() {
  const [isBreathing, setIsBreathing] = React.useState(false);
  const [currentPhase, setCurrentPhase] = React.useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedPattern, setSelectedPattern] = React.useState(breathingPatterns[0]);
  const [progress, setProgress] = React.useState(0);
  const [showSettings, setShowSettings] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [hapticEnabled, setHapticEnabled] = React.useState(false);
  const [completedCycles, setCompletedCycles] = React.useState(0);
  const [totalSeconds, setTotalSeconds] = React.useState(0);

  const maxProgress = currentPhase === 'inhale' 
    ? selectedPattern.inhale 
    : currentPhase === 'hold'
      ? selectedPattern.hold
      : selectedPattern.exhale;

  const totalPatternTime = selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale;
  const overallProgress = ((selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale - maxProgress + progress) / totalPatternTime) * 100;

  React.useEffect(() => {
    let interval: number;
    if (isBreathing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= maxProgress) {
            setCurrentPhase((prev) => {
              if (prev === 'inhale') return 'hold';
              if (prev === 'hold') return 'exhale';
              return 'inhale';
            });
            if (currentPhase === 'exhale') {
              setCompletedCycles(c => c + 1);
              if (hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate(50);
              }
            }
            return 0;
          }
          return newProgress;
        });
        setTotalSeconds(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, currentPhase, selectedPattern, maxProgress, hapticEnabled]);

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
    setCompletedCycles(0);
    setTotalSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePatternChange = (pattern: typeof breathingPatterns[0]) => {
    setSelectedPattern(pattern);
    resetBreathing();
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
            <h1 className="text-display-sm font-display font-bold text-white">Stress Hub</h1>
            <p className="text-dark-400 mt-1">Find calm and restore balance with guided exercises</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary btn-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-md font-bold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary-400" />
                  Preferences
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-dark-500 hover:text-white hover:bg-dark-800 rounded-xl transition-colors"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-dark-400" />
                      <span className="font-medium text-white">Guided Audio</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-5 h-5 accent-primary-500 rounded border-dark-600 bg-dark-800 focus:ring-primary-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-dark-400" />
                      <span className="font-medium text-white">Haptic Feedback</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hapticEnabled}
                      onChange={(e) => setHapticEnabled(e.target.checked)}
                      className="w-5 h-5 accent-primary-500 rounded border-dark-600 bg-dark-800 focus:ring-primary-500"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Session Duration</label>
                    <select
                      className="input"
                      defaultValue="10"
                    >
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="20">20 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Background Sound</label>
                    <select
                      className="input"
                      defaultValue="none"
                    >
                      <option value="none">None</option>
                      <option value="rain">Rain</option>
                      <option value="ocean">Ocean Waves</option>
                      <option value="forest">Forest Ambience</option>
                      <option value="white-noise">White Noise</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing Exercise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-heading-lg font-bold text-white mb-2">Breathing Exercise</h2>
            <p className="text-dark-400">Select a pattern and follow the visual guide</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pattern Selector */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-bold text-white">Choose Pattern</h3>
              <div className="space-y-3">
                {breathingPatterns.map((pattern) => (
                  <motion.button
                    key={pattern.name}
                    onClick={() => handlePatternChange(pattern)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      selectedPattern.name === pattern.name
                        ? 'bg-primary-500/15 border border-primary-500/30'
                        : 'bg-dark-800/50 border border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`font-medium ${selectedPattern.name === pattern.name ? 'text-primary-400' : 'text-white'}`}>
                          {pattern.name}
                        </h4>
                        <p className="text-sm text-dark-400 mt-1">{pattern.description}</p>
                      </div>
                      {selectedPattern.name === pattern.name && (
                        <div className="flex items-center gap-2 text-primary-400">
                          <Brain className="h-5 w-5" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-dark-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${phaseBgColors.inhale}`} />
                        In {pattern.inhale}s
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${phaseBgColors.hold}`} />
                        Hold {pattern.hold}s
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${phaseBgColors.exhale}`} />
                        Out {pattern.exhale}s
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                  <div className="text-2xl font-display font-bold text-primary-400">{completedCycles}</div>
                  <div className="text-xs text-dark-500">Cycles</div>
                </div>
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                  <div className="text-2xl font-display font-bold text-secondary-400">{formatTime(totalSeconds)}</div>
                  <div className="text-xs text-dark-500">Time</div>
                </div>
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                  <div className="text-2xl font-display font-bold text-green-400">
                    {Math.round((completedCycles * totalPatternTime / Math.max(totalSeconds, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-dark-500">Focus</div>
                </div>
              </div>
            </div>

            {/* Breathing Visualization */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    className="stroke-current text-dark-700"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="110"
                    className={`stroke-current ${phaseBgColors[currentPhase]} transition-all duration-1000`}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 110}
                    strokeDashoffset={
                      2 * Math.PI * 110 *
                      (1 - progress / maxProgress)
                    }
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px currentColor)',
                    }}
                  />
                  {/* Pulse ring when breathing */}
                  {isBreathing && (
                    <motion.circle
                      cx="120"
                      cy="120"
                      r="110"
                      className={`stroke-current ${phaseBgColors[currentPhase]} opacity-30`}
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 110}
                      strokeLinecap="round"
                      animate={{ r: [110, 120], opacity: [0.3, 0] }}
                      transition={{ duration: maxProgress, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      key={currentPhase}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`${phaseColors[currentPhase]} text-4xl md:text-5xl font-display font-bold mb-2`}
                    >
                      {phaseLabels[currentPhase]}
                    </motion.div>
                    <motion.div
                      key={progress}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-7xl md:text-8xl font-display font-bold text-white font-mono tabular-nums"
                    >
                      {maxProgress - progress}
                    </motion.div>
                    <div className="text-dark-400 mt-2">seconds</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleBreathing}
                  className="p-4 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                  aria-label={isBreathing ? 'Pause' : 'Start'}
                >
                  {isBreathing ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetBreathing}
                  disabled={!isBreathing && progress === 0 && currentPhase === 'inhale'}
                  className="p-4 rounded-2xl bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-dark-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Reset"
                >
                  <RefreshCw className="h-8 w-8" />
                </motion.button>
              </div>

              {/* Phase indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {['inhale', 'hold', 'exhale'].map((phase, index) => (
                  <motion.div
                    key={phase}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentPhase === phase
                        ? `${phaseBgColors[phase]} w-8 shadow-lg shadow-[${phaseBgColors[phase]}]/50`
                        : 'bg-dark-700'
                    }`}
                    animate={{ scale: currentPhase === phase ? 1.2 : 1 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-lg font-bold text-white">Quick Stress Relief</h2>
            <button className="btn-secondary btn-sm">
              <Music className="h-4 w-4" />
              View All
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {quickTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card-hover p-6 group"
              >
                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl w-fit mb-4 group-hover:bg-primary-500/20 group-hover:border-primary-500/40 transition-all">
                  <tip.icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-heading-sm font-bold text-white mb-2">{tip.title}</h3>
                <p className="text-body-sm text-dark-400">{tip.description}</p>
                <button className="mt-4 text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Try it
                  <ChevronDown className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Guided Meditation Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-lg font-bold text-white">Guided Meditation</h2>
            <span className="badge-primary">
              <Music className="h-3 w-3 mr-1" />
              Audio
            </span>
          </div>

          <div className="card overflow-hidden">
            <div className="aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
              <iframe
                width="100%"
                height="100%"
                src={stressHubData.meditationVideo}
                title="Guided Meditation for Stress Relief"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="relative z-10"
              ></iframe>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">10-Minute Stress Relief Meditation</h3>
                  <p className="text-dark-400 text-sm mt-1">Perfect for a quick mental reset during your day</p>
                </div>
                <button className="btn-primary btn-sm">
                  <Play className="h-4 w-4" />
                  Play
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Additional Resources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-heading-lg font-bold text-white mb-6">More Ways to Relax</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Music, title: 'Calming Music', desc: 'Curated playlists for focus and relaxation', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
              { icon: Wind, title: 'Nature Sounds', desc: 'Rain, ocean, forest ambience for deep calm', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
              { icon: Brain, title: 'Mindfulness', desc: 'Guided sessions for anxiety and stress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
              { icon: Heart, title: 'Body Scan', desc: 'Progressive muscle relaxation techniques', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
              { icon: Volume2, title: 'White Noise', desc: 'Focus-enhancing background sounds', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
              { icon: Settings, title: 'Custom Timer', desc: 'Build your own breathing routine', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="card p-6 group"
              >
                <div className={`p-3 rounded-xl mb-4 ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-heading-sm font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                <p className="text-body-sm text-dark-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}