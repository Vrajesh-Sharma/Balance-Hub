import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Battery, Heart, Brain, Award } from 'lucide-react';

interface Character {
  energy: number;
  health: number;
  happiness: number;
  productivity: number;
}

interface Task {
  id: number;
  name: string;
  type: 'work' | 'personal' | 'health';
  energyCost: number;
  reward: number;
  time: number;
}

const tasks: Task[] = [
  { id: 1, name: 'Complete Project', type: 'work', energyCost: 30, reward: 50, time: 4 },
  { id: 2, name: 'Exercise', type: 'health', energyCost: 20, reward: 30, time: 1 },
  { id: 3, name: 'Family Time', type: 'personal', energyCost: 10, reward: 40, time: 2 },
  { id: 4, name: 'Learn New Skill', type: 'work', energyCost: 25, reward: 45, time: 3 },
  { id: 5, name: 'Meditation', type: 'health', energyCost: 5, reward: 20, time: 0.5 },
];

export default function Game() {
  const [character, setCharacter] = React.useState<Character>({
    energy: 100,
    health: 100,
    happiness: 100,
    productivity: 0,
  });

  const [gameTime, setGameTime] = React.useState(9); // Starting at 9 AM
  const [score, setScore] = React.useState(0);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const handleTaskSelect = (task: Task) => {
    if (character.energy >= task.energyCost && gameTime + task.time <= 17) {
      setSelectedTask(task);
    }
  };

  const handleTaskComplete = () => {
    if (selectedTask) {
      setCharacter((prev) => ({
        energy: Math.max(0, prev.energy - selectedTask.energyCost),
        health: Math.min(100, prev.health + (selectedTask.type === 'health' ? 10 : -5)),
        happiness: Math.min(
          100,
          prev.happiness + (selectedTask.type === 'personal' ? 15 : -5)
        ),
        productivity: prev.productivity + (selectedTask.type === 'work' ? 20 : 5),
      }));
      setGameTime((prev) => prev + selectedTask.time);
      setScore((prev) => prev + selectedTask.reward);
      setSelectedTask(null);
    }
  };

  const getTimeString = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time - hours) * 60;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
  };

  const taskDisabled = (task: (typeof tasks)[number]) =>
    character.energy < task.energyCost || gameTime + task.time > 17;

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="page-title">Balance Game</h1>
          <div className="flex items-center gap-2 text-charcoal-900">
            <Clock className="h-5 w-5 text-sage-700" aria-hidden="true" />
            <span className="font-semibold">{getTimeString(gameTime)} {gameTime < 12 ? 'AM' : 'PM'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-cream-100 border border-border p-4 rounded-xl">
            <Battery className="h-6 w-6 text-sage-700 mb-2" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900">Energy</h2>
            <div className="w-full h-2 bg-charcoal-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-sage-600 rounded-full"
                style={{ width: `${character.energy}%` }}
              />
            </div>
          </div>
          <div className="bg-cream-100 border border-border p-4 rounded-xl">
            <Heart className="h-6 w-6 text-emerald-700 mb-2" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900">Health</h2>
            <div className="w-full h-2 bg-charcoal-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${character.health}%` }}
              />
            </div>
          </div>
          <div className="bg-cream-100 border border-border p-4 rounded-xl">
            <Brain className="h-6 w-6 text-lavender-700 mb-2" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900">Happiness</h2>
            <div className="w-full h-2 bg-charcoal-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-lavender-500 rounded-full"
                style={{ width: `${character.happiness}%` }}
              />
            </div>
          </div>
          <div className="bg-cream-100 border border-border p-4 rounded-xl">
            <Award className="h-6 w-6 text-amber-700 mb-2" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900">Score</h2>
            <p className="text-2xl font-bold text-charcoal-900">{score}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-3">
            <h2 className="text-heading-md font-bold text-charcoal-900 mb-1">Available Tasks</h2>
            {tasks.map((task) => (
              <motion.button
                key={task.id}
                type="button"
                whileHover={taskDisabled(task) ? undefined : { scale: 1.01 }}
                onClick={() => handleTaskSelect(task)}
                disabled={taskDisabled(task)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  taskDisabled(task)
                    ? 'bg-cream-100 border-border opacity-60 cursor-not-allowed'
                    : 'bg-white border-border hover:border-sage-300 hover:bg-sage-50'
                }`}
              >
                <div className="flex justify-between items-center gap-3">
                  <h3 className="font-semibold text-charcoal-900">{task.name}</h3>
                  <span className="text-sm text-charcoal-700 shrink-0">{task.time}h</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm font-medium">
                  <span className="text-sage-800">-{task.energyCost} Energy</span>
                  <span className="text-amber-800">+{task.reward} Points</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-cream-100 border border-border p-4 sm:p-6 rounded-xl self-start">
            <h2 className="text-heading-md font-bold text-charcoal-900 mb-4">Current Task</h2>
            {selectedTask ? (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-border rounded-xl">
                  <h3 className="font-semibold text-charcoal-900 mb-2">{selectedTask.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                    <span className="text-sage-800">-{selectedTask.energyCost} Energy</span>
                    <span className="text-amber-800">+{selectedTask.reward} Points</span>
                    <span className="text-charcoal-700">{selectedTask.time}h</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTaskComplete}
                  className="btn-primary w-full"
                >
                  Complete Task
                </button>
              </div>
            ) : (
              <p className="text-charcoal-700">Select a task to begin</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}