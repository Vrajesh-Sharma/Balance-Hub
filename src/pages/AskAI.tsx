import React, { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface ScheduleItem {
  activity: string;
  hours: number;
}

const AskAI: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { activity: 'Work', hours: 0 },
    { activity: 'Personal Time', hours: 0 },
    { activity: 'Sleep', hours: 0 },
  ]);

  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'error'>('success');
  const [showMessage, setShowMessage] = useState(false);

  const handleHoursChange = (index: number, hours: number) => {
    const newSchedule = [...scheduleItems];
    newSchedule[index].hours = hours;
    setScheduleItems(newSchedule);
    setShowMessage(false); // Hide message when input changes
  };

  const handleAnalyzeClick = () => {
    setShowMessage(true);
    analyzeSchedule(scheduleItems);
  };

  const analyzeSchedule = (schedule: ScheduleItem[]) => {
    const workHours = schedule.find(item => item.activity === 'Work')?.hours || 0;
    const personalHours = schedule.find(item => item.activity === 'Personal Time')?.hours || 0;
    const sleepHours = schedule.find(item => item.activity === 'Sleep')?.hours || 0;
    const totalHours = workHours + personalHours + sleepHours;

    // Check if total hours exceed 24
    if (totalHours > 24) {
      setMessage('Total hours cannot exceed 24 hours in a day!');
      setMessageType('error');
      return;
    }

    // Analyze sleep patterns
    if (sleepHours < 6) {
      setMessage('You need more sleep! Aim for at least 7-8 hours of sleep for better health.');
      setMessageType('error');
      return;
    }

    if (sleepHours > 10) {
      setMessage('You might be sleeping too much. Try to balance your sleep schedule.');
      setMessageType('warning');
      return;
    }

    // Analyze work-life balance
    if (workHours > 10) {
      setMessage('Too much work time. Consider reducing work hours for better work-life balance.');
      setMessageType('error');
      return;
    }

    if (workHours < 7 && totalHours > 0) {
      setMessage('Consider dedicating more time to work for better productivity.');
      setMessageType('warning');
      return;
    }

    // Analyze personal time
    if (personalHours < 2 && totalHours > 0) {
      setMessage('Try to allocate more personal time for better mental health.');
      setMessageType('warning');
      return;
    }

    if (personalHours > 8) {
      setMessage('Consider balancing your personal time with other activities.');
      setMessageType('warning');
      return;
    }

    // Ideal balance
    if (workHours >= 7 && workHours <= 10 && 
        sleepHours >= 7 && sleepHours <= 9 && 
        personalHours >= 2 && personalHours <= 8) {
      setMessage('Great job! Your schedule shows a healthy balance between work, rest, and personal time.');
      setMessageType('success');
      return;
    }

    if (totalHours === 0) {
      setMessage('Please enter your daily schedule hours before analysis.');
      setMessageType('warning');
    } else {
      setMessage('Your schedule needs some adjustments to achieve better balance.');
      setMessageType('warning');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-center mb-8">
          <Brain className="h-10 w-10 text-cyan-400 mr-4" />
          <h1 className="text-4xl font-bold text-white">Schedule Analysis</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {scheduleItems.map((item, index) => (
              <div key={item.activity} className="space-y-2">
                <label className="block text-cyan-400 text-sm font-semibold">
                  {item.activity}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={item.hours}
                    onChange={(e) => handleHoursChange(index, Number(e.target.value))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    placeholder="Hours"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    hrs
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Ask AI Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyzeClick}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Ask AI
            </button>
          </div>

          {/* Analysis Message */}
          {showMessage && message && (
            <div className={`mt-8 p-4 rounded-lg text-center font-medium ${
              messageType === 'success' 
                ? 'bg-green-900/50 text-green-400 border border-green-400'
                : messageType === 'warning'
                  ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400'
                  : 'bg-red-900/50 text-red-400 border border-red-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Healthy Schedule Tips</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Aim for 7-9 hours of sleep daily</li>
            <li>• Maintain 7-10 hours of work for optimal productivity</li>
            <li>• Include at least 2-3 hours of personal time</li>
            <li>• Take regular breaks during work hours</li>
            <li>• Balance is key - no single activity should dominate your day</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AskAI; 