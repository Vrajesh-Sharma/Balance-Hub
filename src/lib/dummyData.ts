import { format, subDays } from 'date-fns';

// Generate dates for the last 7 days
const generatePastDates = () => {
  return Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
};

// Dummy activities data
export const activities = generatePastDates().flatMap(date => [
  { id: crypto.randomUUID(), type: 'work', hours: Math.random() * 8 + 2, date },
  { id: crypto.randomUUID(), type: 'personal', hours: Math.random() * 4 + 1, date },
  { id: crypto.randomUUID(), type: 'exercise', hours: Math.random() * 2 + 0.5, date },
  { id: crypto.randomUUID(), type: 'hobbies', hours: Math.random() * 3 + 1, date },
]);

// Dummy goals data
export const goals = [
  {
    id: crypto.randomUUID(),
    title: 'Complete Project Milestone',
    category: 'work',
    progress: 75,
    deadline: format(subDays(new Date(), -7), 'yyyy-MM-dd'),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Read 2 Books',
    category: 'personal',
    progress: 50,
    deadline: format(subDays(new Date(), -14), 'yyyy-MM-dd'),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Run 5K',
    category: 'exercise',
    progress: 90,
    deadline: format(subDays(new Date(), -5), 'yyyy-MM-dd'),
    completed: false,
  },
];

// Dummy journal entries
export const journalEntries = generatePastDates().map(date => ({
  id: crypto.randomUUID(),
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  mood: ['Happy', 'Productive', 'Tired', 'Energetic'][Math.floor(Math.random() * 4)],
  date,
}));

// Dummy schedules
export const schedules = generatePastDates().flatMap(date => [
  {
    id: crypto.randomUUID(),
    title: 'Morning Workout',
    start_time: `${date}T06:00:00Z`,
    end_time: `${date}T07:00:00Z`,
    template_name: 'Daily Routine',
  },
  {
    id: crypto.randomUUID(),
    title: 'Work Focus Time',
    start_time: `${date}T09:00:00Z`,
    end_time: `${date}T12:00:00Z`,
    template_name: 'Work Schedule',
  },
  {
    id: crypto.randomUUID(),
    title: 'Family Time',
    start_time: `${date}T18:00:00Z`,
    end_time: `${date}T20:00:00Z`,
    template_name: 'Evening Routine',
  },
]);

// Mock API functions to replace Supabase functions
export const mockApi = {
  // Activities
  logActivity: async (type: string, hours: number, date: string) => {
    const newActivity = { id: crypto.randomUUID(), type, hours, date };
    activities.push(newActivity);
    return { data: newActivity, error: null };
  },
  getActivities: async (startDate: string, endDate: string) => {
    return { 
      data: activities.filter(a => a.date >= startDate && a.date <= endDate),
      error: null 
    };
  },

  // Goals
  createGoal: async (title: string, category: string, deadline: string) => {
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      category,
      progress: 0,
      deadline,
      completed: false,
    };
    goals.push(newGoal);
    return { data: newGoal, error: null };
  },
  updateGoalProgress: async (id: string, progress: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.progress = progress;
      goal.completed = progress === 100;
    }
    return { data: goal, error: null };
  },
  getGoals: async () => {
    return { data: goals, error: null };
  },

  // Journal Entries
  createJournalEntry: async (content: string, mood: string, date: string) => {
    const newEntry = { id: crypto.randomUUID(), content, mood, date };
    journalEntries.push(newEntry);
    return { data: newEntry, error: null };
  },
  getJournalEntries: async () => {
    return { data: journalEntries, error: null };
  },

  // Schedules
  createSchedule: async (title: string, startTime: string, endTime: string, templateName?: string) => {
    const newSchedule = {
      id: crypto.randomUUID(),
      title,
      start_time: startTime,
      end_time: endTime,
      template_name: templateName,
    };
    schedules.push(newSchedule);
    return { data: newSchedule, error: null };
  },
  getSchedules: async (startDate: string, endDate: string) => {
    return {
      data: schedules.filter(s => s.start_time >= startDate && s.end_time <= endDate),
      error: null,
    };
  },
}; 