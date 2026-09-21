import { format, subDays } from 'date-fns';
import { 
  generateSyntheticProfile, 
  aggregateUserProfile, 
  getDefaultPreferences,
  schedulesToCurrentFormat 
} from '../soft-computing/data';

// Generate dates for the last 7 days
const generatePastDates = () => {
  return Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
};

// Generate a realistic synthetic profile for the application
let syntheticProfile = generateSyntheticProfile(30);

// Dummy activities data (from synthetic profile)
export const activities = syntheticProfile.activities;

// Dummy goals data (from synthetic profile)
export const goals = syntheticProfile.goals;

// Dummy journal entries (from synthetic profile)
export const journalEntries = syntheticProfile.journalEntries;

// Dummy schedules (from synthetic profile)
export const schedules = syntheticProfile.schedules;

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
  deleteActivity: async (id: string) => {
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities.splice(index, 1);
    }
    return { data: null, error: null };
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
  getJournalEntries: () => {
    return Promise.resolve({ data: journalEntries, error: null });
  },

  createJournalEntry: (content: string, mood: string, category: string, date: string) => {
    const newEntry = {
      id: journalEntries.length + 1,
      content,
      mood,
      category,
      date,
    };
    journalEntries.unshift(newEntry);
    return Promise.resolve({ data: newEntry, error: null });
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
  deleteSchedule: async (id: string) => {
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules.splice(index, 1);
    }
    return { data: null, error: null };
  },
};

// Aggregator functions for Smart Scheduler
export const smartSchedulerData = {
  // Get aggregated user inputs for Fuzzy Logic
  getUserInputs: () => {
    return aggregateUserProfile(
      activities,
      [], // workLogs would come from WorkTimeTracker localStorage
      journalEntries,
      goals,
      schedules,
      getDefaultPreferences()
    );
  },

  // Get current schedule format for GA baseline comparison
  getCurrentSchedule: () => {
    return schedulesToCurrentFormat(schedules);
  },

  // Get user preferences
  getPreferences: () => {
    return getDefaultPreferences();
  },

  // Regenerate synthetic profile (for testing)
  regenerateProfile: (days = 30) => {
    syntheticProfile = generateSyntheticProfile(days);
    // Update the exported arrays
    activities.length = 0;
    activities.push(...syntheticProfile.activities);
    goals.length = 0;
    goals.push(...syntheticProfile.goals);
    journalEntries.length = 0;
    journalEntries.push(...syntheticProfile.journalEntries);
    schedules.length = 0;
    schedules.push(...syntheticProfile.schedules);
    return syntheticProfile;
  },
}; 