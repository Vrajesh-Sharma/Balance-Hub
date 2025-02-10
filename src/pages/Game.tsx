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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Balance Game</h2>
          <div className="flex items-center gap-4">
            <Clock className="text-cyan-400" />
            <span className="font-medium">{getTimeString(gameTime)} {gameTime < 12 ? 'AM' : 'PM'}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-700 p-4 rounded-lg">
            <Battery className="h-6 w-6 text-cyan-400 mb-2" />
            <h3 className="font-medium">Energy</h3>
            <div className="w-full h-2 bg-gray-600 rounded-full mt-2">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${character.energy}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <Heart className="h-6 w-6 text-pink-400 mb-2" />
            <h3 className="font-medium">Health</h3>
            <div className="w-full h-2 bg-gray-600 rounded-full mt-2">
              <div
                className="h-full bg-pink-500 rounded-full"
                style={{ width: `${character.health}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <Brain className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="font-medium">Happiness</h3>
            <div className="w-full h-2 bg-gray-600 rounded-full mt-2">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${character.happiness}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <Award className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="font-medium">Score</h3>
            <p className="text-2xl font-bold text-yellow-400">{score}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Available Tasks</h3>
            {tasks.map((task) => (
              <motion.button
                key={task.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleTaskSelect(task)}
                disabled={character.energy < task.energyCost || gameTime + task.time > 17}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  character.energy < task.energyCost || gameTime + task.time > 17
                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{task.name}</h4>
                  <span className="text-sm text-gray-400">{task.time}h</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-cyan-400">-{task.energyCost} Energy</span>
                  <span className="text-yellow-400">+{task.reward} Points</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Current Task</h3>
            {selectedTask ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-600 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedTask.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-cyan-400">-{selectedTask.energyCost} Energy</span>
                    <span className="text-yellow-400">+{selectedTask.reward} Points</span>
                    <span className="text-gray-400">{selectedTask.time}h</span>
                  </div>
                </div>
                <button
                  onClick={handleTaskComplete}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg transition-colors"
                >
                  Complete Task
                </button>
              </div>
            ) : (
              <p className="text-gray-400">Select a task to begin</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}