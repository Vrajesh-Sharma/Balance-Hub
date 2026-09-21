import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RefreshCw,
  Brain,
  Wind,
  Heart,
  Music,
  Volume2,
  Settings,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { stressHubData } from '../lib/staticData';

const breathingPatterns = stressHubData.breathingPatterns;
const quickTips = stressHubData.quickTips;

const phaseLabels = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
};

const phaseTextColors = {
  inhale: 'text-primary-500',
  hold: 'text-yellow-500',
  exhale: 'text-green-500',
};

const phaseBgColors = {
  inhale: 'bg-primary-500',
  hold: 'bg-yellow-500',
  exhale: 'bg-green-500',
};

const iconMap = {
  Wind,
  Brain,
  Heart,
  Music,
  Volume2,
  Settings,
};

function getTipIcon(iconName: string) {
  const Icon = iconMap[iconName as keyof typeof iconMap];

  return Icon ? (
    <Icon className="h-6 w-6" />
  ) : (
    <AlertCircle className="h-6 w-6" />
  );
}

export default function StressHub() {
  const [isBreathing, setIsBreathing] = React.useState(false);
  const [currentPhase, setCurrentPhase] = React.useState<
    'inhale' | 'hold' | 'exhale'
  >('inhale');
  const [selectedPattern, setSelectedPattern] = React.useState(
    breathingPatterns[0]
  );
  const [progress, setProgress] = React.useState(0);
  const [showSettings, setShowSettings] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [hapticEnabled, setHapticEnabled] = React.useState(false);
  const [completedCycles, setCompletedCycles] = React.useState(0);
  const [totalSeconds, setTotalSeconds] = React.useState(0);

  const breathingSectionRef = React.useRef<HTMLDivElement>(null);
  const meditationIframeRef = React.useRef<HTMLIFrameElement>(null);

  const maxProgress =
    currentPhase === 'inhale'
      ? selectedPattern.inhale
      : currentPhase === 'hold'
        ? selectedPattern.hold
        : selectedPattern.exhale;

  const totalPatternTime =
    selectedPattern.inhale +
    selectedPattern.hold +
    selectedPattern.exhale;

  const overallProgress =
    ((selectedPattern.inhale +
      selectedPattern.hold +
      selectedPattern.exhale -
      maxProgress +
      progress) /
      totalPatternTime) *
    100;

  React.useEffect(() => {
    let interval: number | undefined;

    if (isBreathing) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;

          if (newProgress >= maxProgress) {
            setCurrentPhase((prev) => {
              if (prev === 'inhale') return 'hold';
              if (prev === 'hold') return 'exhale';
              return 'inhale';
            });

            if (currentPhase === 'exhale') {
              setCompletedCycles((c) => c + 1);

              if (hapticEnabled && 'vibrate' in navigator) {
                navigator.vibrate(50);
              }
            }

            return 0;
          }

          return newProgress;
        });

        setTotalSeconds((t) => t + 1);
      }, 1000);
    }

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [
    isBreathing,
    currentPhase,
    selectedPattern,
    maxProgress,
    hapticEnabled,
  ]);

  const toggleBreathing = () => {
    setIsBreathing((prev) => !prev);
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

  const handlePatternChange = (
    pattern: (typeof breathingPatterns)[0]
  ) => {
    setSelectedPattern(pattern);
    resetBreathing();
  };

  const handleQuickTipAction = (tipTitle: string) => {
    if (
      tipTitle === 'Deep Breathing' ||
      tipTitle === 'Mindful Moment'
    ) {
      const pattern = breathingPatterns[0];

      setSelectedPattern(pattern);
      setCurrentPhase('inhale');
      setProgress(0);
      setCompletedCycles(0);
      setTotalSeconds(0);
      setIsBreathing(true);

      requestAnimationFrame(() => {
        breathingSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });

      return;
    }

    if (tipTitle === 'Take a Walk') {
      window.location.assign('/resources');
    }
  };

  const meditationSrc = React.useMemo(() => {
    const src = stressHubData.meditationVideo;

    if (!src) {
      return '';
    }

    const separator = src.includes('?') ? '&' : '?';

    return `${src}${separator}enablejsapi=1&playsinline=1`;
  }, []);

  const handleMeditationPlay = () => {
    const iframe = meditationIframeRef.current;

    if (!iframe?.contentWindow) {
      return;
    }

    iframe.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    iframe.focus();

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: [],
      }),
      '*'
    );
  };

  return (
    <div className="container-custom">
      <div className="space-y-12 md:space-y-16 lg:space-y-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="max-w-3xl">
            <h1 className="text-display-sm md:text-display-md font-display font-bold tracking-tight text-white">
              Stress Hub
            </h1>

            <p className="text-body-lg md:text-heading-sm text-dark-300 leading-relaxed mt-3">
              Find calm and restore balance with guided exercises
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary btn-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-md font-bold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary-400" />
                  Preferences
                </h2>

                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-dark-500 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) =>
                        setSoundEnabled(e.target.checked)
                      }
                      className="w-4 h-4 accent-primary-500 rounded border-dark-600 bg-dark-800 focus:ring-2 focus:ring-primary-500/20"
                    />

                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-dark-400" />

                      <span className="font-medium text-white">
                        Guided Audio
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hapticEnabled}
                      onChange={(e) =>
                        setHapticEnabled(e.target.checked)
                      }
                      className="w-4 h-4 accent-primary-500 rounded border-dark-600 bg-dark-800 focus:ring-2 focus:ring-primary-500/20"
                    />

                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-dark-400" />

                      <span className="font-medium text-white">
                        Haptic Feedback
                      </span>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">

                  <div>
                    <label className="label">
                      Session Duration
                    </label>

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
                    <label className="label">
                      Background Sound
                    </label>

                    <select
                      className="input"
                      defaultValue="none"
                    >
                      <option value="none">None</option>
                      <option value="rain">Rain</option>
                      <option value="ocean">
                        Ocean Waves
                      </option>
                      <option value="forest">
                        Forest Ambience
                      </option>
                      <option value="white-noise">
                        White Noise
                      </option>
                    </select>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing Exercise Section */}
        <motion.div
          ref={breathingSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-heading-lg font-semibold text-white mb-2">
              Breathing Exercise
            </h2>

            <p className="text-body-md text-dark-400">
              Select a pattern and follow the visual guide
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Pattern Selector */}
            <div className="space-y-4">
              <h3 className="text-heading-sm font-semibold text-white">
                Choose Pattern
              </h3>

              <div className="space-y-3">
                {breathingPatterns.map((pattern) => (
                  <motion.button
                    key={pattern.name}
                    type="button"
                    onClick={() =>
                      handlePatternChange(pattern)
                    }
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      selectedPattern.name === pattern.name
                        ? 'bg-primary-500/10 border border-primary-500/20'
                        : 'bg-dark-800/50 border border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h4
                          className={`font-medium ${
                            selectedPattern.name === pattern.name
                              ? 'text-primary-400'
                              : 'text-white'
                          }`}
                        >
                          {pattern.name}
                        </h4>

                        <p className="text-body-sm text-dark-400 mt-1">
                          {pattern.description}
                        </p>
                      </div>

                      {selectedPattern.name === pattern.name && (
                        <div className="flex items-center gap-2 text-primary-400">
                          <Brain className="h-4 w-4" />

                          <span className="text-sm font-medium">
                            Active
                          </span>
                        </div>
                      )}

                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-dark-500">

                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${phaseBgColors.inhale}`}
                        />
                        In {pattern.inhale}s
                      </span>

                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${phaseBgColors.hold}`}
                        />
                        Hold {pattern.hold}s
                      </span>

                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${phaseBgColors.exhale}`}
                        />
                        Out {pattern.exhale}s
                      </span>

                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-700">

                <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xl font-display font-bold text-primary-400">
                    {completedCycles}
                  </div>

                  <div className="text-caption text-dark-500">
                    Cycles
                  </div>
                </div>

                <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xl font-display font-bold text-secondary-400">
                    {formatTime(totalSeconds)}
                  </div>

                  <div className="text-caption text-dark-500">
                    Time
                  </div>
                </div>

                <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xl font-display font-bold text-green-400">
                    {Math.round(
                      (completedCycles *
                        totalPatternTime /
                        Math.max(totalSeconds, 1)) *
                        100
                    )}
                    %
                  </div>

                  <div className="text-caption text-dark-500">
                    Focus
                  </div>
                </div>

              </div>
            </div>

            {/* Breathing Visualization */}
            <div className="flex flex-col items-center justify-center">

              <div className="relative w-64 h-64 md:w-72 md:h-72">

                <svg
                  viewBox="0 0 240 240"
                  className="w-full h-full transform -rotate-90"
                  aria-hidden="true"
                >

                  {/* Background circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    className="text-dark-700"
                    strokeWidth="10"
                    fill="none"
                    stroke="currentColor"
                  />

                  {/* Progress circle */}
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="100"
                    className={`${phaseTextColors[currentPhase]} transition-all duration-1000`}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      100 *
                      (1 - progress / maxProgress)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                  />

                  {/* Pulse ring */}
                  {isBreathing && (
                    <motion.circle
                      cx="120"
                      cy="120"
                      r="100"
                      className={`${phaseTextColors[currentPhase]} opacity-30`}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 100}
                      strokeLinecap="round"
                      animate={{
                        r: [100, 108],
                        opacity: [0.25, 0],
                      }}
                      transition={{
                        duration: maxProgress,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                      stroke="currentColor"
                    />
                  )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">

                    <motion.div
                      key={currentPhase}
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className={`${phaseTextColors[currentPhase]} text-xl md:text-2xl font-display font-semibold tracking-tight mb-3`}
                    >
                      {phaseLabels[currentPhase]}
                    </motion.div>

                    <motion.div
                      key={progress}
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="text-6xl md:text-7xl font-display font-bold leading-none text-white font-mono tabular-nums"
                    >
                      {maxProgress - progress}
                    </motion.div>

                    <div className="text-body-sm text-dark-400 mt-2">
                      seconds
                    </div>

                  </div>
                </div>

              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-6">

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleBreathing}
                  className="btn-primary p-3 rounded-lg relative z-10"
                  aria-label={
                    isBreathing
                      ? 'Pause breathing exercise'
                      : 'Start breathing exercise'
                  }
                >
                  {isBreathing ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetBreathing}
                  disabled={
                    !isBreathing &&
                    progress === 0 &&
                    currentPhase === 'inhale' &&
                    totalSeconds === 0
                  }
                  className="btn-secondary p-3 rounded-lg relative z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Reset breathing exercise"
                >
                  <RefreshCw className="h-6 w-6" />
                </motion.button>

              </div>

              {/* Phase indicator dots */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {(['inhale', 'hold', 'exhale'] as const).map(
                  (phase) => (
                    <motion.div
                      key={phase}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentPhase === phase
                          ? `${phaseBgColors[phase]} w-6`
                          : 'bg-dark-600'
                      }`}
                      animate={{
                        scale:
                          currentPhase === phase ? 1.1 : 1,
                      }}
                    />
                  )
                )}
              </div>

            </div>
          </div>
        </motion.div>

        {/* Quick Stress Relief */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: '-100px',
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="flex items-center justify-between mb-6">

            <h2 className="text-heading-lg font-semibold text-white">
              Quick Stress Relief
            </h2>

            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() =>
                window.location.assign('/resources')
              }
            >
              <Music className="h-4 w-4" />
              View All
            </button>

          </div>

          <div className="grid sm:grid-cols-3 gap-4">

            {quickTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-50px',
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.4,
                }}
                className="card p-6"
              >

                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg w-fit mb-4 text-primary-400">
                  {getTipIcon(tip.icon)}
                </div>

                <h3 className="text-heading-sm font-semibold text-white mb-2">
                  {tip.title}
                </h3>

                <p className="text-body-sm text-dark-400 mb-4">
                  {tip.description}
                </p>

                <button
                  type="button"
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                  onClick={() =>
                    handleQuickTipAction(tip.title)
                  }
                >
                  Try it
                  <ChevronDown className="h-3 w-3" />
                </button>

              </motion.div>
            ))}

          </div>
        </motion.section>

        {/* Guided Meditation */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: '-100px',
          }}
          transition={{
            duration: 0.6,
          }}
        >

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-heading-lg font-semibold text-white">
              Guided Meditation
            </h2>

            <span className="badge-primary">
              <Music className="h-3 w-3 mr-1" />
              Audio
            </span>

          </div>

          <div className="card overflow-hidden">

            <div className="aspect-video relative bg-dark-800">

              <iframe
                ref={meditationIframeRef}
                width="100%"
                height="100%"
                src={meditationSrc}
                title="Guided Meditation for Stress Relief"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="relative z-10"
              />

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-heading-md font-semibold text-white">
                    10-Minute Stress Relief Meditation
                  </h3>

                  <p className="text-body-sm text-dark-400 mt-1">
                    Perfect for a quick mental reset during your day
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-primary btn-sm relative z-20"
                  onClick={handleMeditationPlay}
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>

              </div>

            </div>
          </div>

        </motion.section>

        {/* More Ways to Relax */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: '-100px',
          }}
          transition={{
            duration: 0.6,
          }}
        >

          <h2 className="text-heading-lg font-semibold text-white mb-6">
            More Ways to Relax
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            {[
              {
                icon: Music,
                title: 'Calming Music',
                desc: 'Curated playlists for focus and relaxation',
                color:
                  'bg-primary-500/15 text-primary-400 border-primary-500/20',
              },
              {
                icon: Wind,
                title: 'Nature Sounds',
                desc: 'Rain, ocean, forest ambience for deep calm',
                color:
                  'bg-primary-500/15 text-primary-400 border-primary-500/20',
              },
              {
                icon: Brain,
                title: 'Mindfulness',
                desc: 'Guided sessions for anxiety and stress',
                color:
                  'bg-secondary-500/15 text-secondary-400 border-secondary-500/20',
              },
              {
                icon: Heart,
                title: 'Body Scan',
                desc: 'Progressive muscle relaxation techniques',
                color:
                  'bg-secondary-500/15 text-secondary-400 border-secondary-500/20',
              },
              {
                icon: Volume2,
                title: 'White Noise',
                desc: 'Focus-enhancing background sounds',
                color:
                  'bg-primary-500/15 text-primary-400 border-primary-500/20',
              },
              {
                icon: Settings,
                title: 'Custom Timer',
                desc: 'Build your own breathing routine',
                color:
                  'bg-secondary-500/15 text-secondary-400 border-secondary-500/20',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-50px',
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.4,
                }}
                className="card p-6"
              >

                <div
                  className={`p-3 rounded-lg mb-4 w-fit border ${item.color}`}
                >
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="text-heading-sm font-semibold text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-body-sm text-dark-400">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </motion.section>

      </div>
    </div>
  );
}