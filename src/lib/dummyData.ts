import { format, subDays } from 'date-fns';
import { 
  generateSyntheticProfile, 
  aggregateUserProfile, 
  getDefaultPreferences,
  schedulesToCurrentFormat 
} from '../soft-computing/data';
import { ActivityLog, WorkLog, JournalEntry, Goal, ScheduleEvent, UserPreferences, UserInputs, MoodType } from '../soft-computing/types';

// ============================================
// REAL USER DATA STORAGE (in-memory, persists during session)
// These arrays store actual user-entered data from the application
// ============================================
let realActivities: ActivityLog[] = [];
let realGoals: Goal[] = [];
let realJournalEntries: JournalEntry[] = [];
let realSchedules: ScheduleEvent[] = [];

// ============================================
// SYNTHETIC TEST DATA (only for demo/testing)
// This is ONLY used when explicitly requesting test mode
// ============================================
let syntheticProfile: ReturnType<typeof generateSyntheticProfile> | null = null;

function getSyntheticProfile() {
  if (!syntheticProfile) {
    syntheticProfile = generateSyntheticProfile(30);
  }
  return syntheticProfile;
}

// ============================================
// WORK TIME TRACKER DATA (from localStorage)
// ============================================
function getWorkLogsFromStorage(): WorkLog[] {
  try {
    const stored = localStorage.getItem('timeLogs');
    if (stored) {
      return JSON.parse(stored) as WorkLog[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

// ============================================
// HELPER: Get current data arrays based on test mode
// ============================================
let useTestDataMode = false;

export function setUseTestData(value: boolean) {
  useTestDataMode = value;
}

export function getUseTestData(): boolean {
  return useTestDataMode;
}

function getCurrentActivities(): ActivityLog[] {
  return useTestDataMode ? getSyntheticProfile().activities : realActivities;
}

function getCurrentGoals(): Goal[] {
  return useTestDataMode ? getSyntheticProfile().goals : realGoals;
}

function getCurrentJournalEntries(): JournalEntry[] {
  return useTestDataMode ? getSyntheticProfile().journalEntries : realJournalEntries;
}

function getCurrentSchedules(): ScheduleEvent[] {
  return useTestDataMode ? getSyntheticProfile().schedules : realSchedules;
}

function getCurrentPreferences(): UserPreferences {
  return useTestDataMode ? getSyntheticProfile().preferences : getDefaultPreferences();
}

// ============================================
// MOCK API - Uses REAL user data by default
// ============================================
export const mockApi = {
  // Activities
  logActivity: async (type: string, hours: number, date: string) => {
    const newActivity: ActivityLog = { 
      id: crypto.randomUUID(), 
      type: type as ActivityLog['type'], 
      hours, 
      date 
    };
    realActivities.push(newActivity);
    return { data: newActivity, error: null };
  },
  getActivities: async (startDate: string, endDate: string) => {
    const activities = getCurrentActivities();
    return { 
      data: activities.filter(a => a.date >= startDate && a.date <= endDate),
      error: null 
    };
  },
  deleteActivity: async (id: string) => {
    const activities = getCurrentActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities.splice(index, 1);
    }
    return { data: null, error: null };
  },

  // Goals
  createGoal: async (title: string, category: string, deadline: string) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      category,
      progress: 0,
      deadline,
      completed: false,
    };
    realGoals.push(newGoal);
    return { data: newGoal, error: null };
  },
  updateGoalProgress: async (id: string, progress: number) => {
    const goals = getCurrentGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.progress = progress;
      goal.completed = progress === 100;
    }
    return { data: goal, error: null };
  },
  getGoals: async () => {
    return { data: getCurrentGoals(), error: null };
  },

  // Journal Entries
  getJournalEntries: () => {
    return Promise.resolve({ data: getCurrentJournalEntries(), error: null });
  },

  createJournalEntry: (content: string, mood: string, category: string, date: string) => {
    const newEntry: JournalEntry = {
      id: getCurrentJournalEntries().length + 1,
      content,
      mood: mood as MoodType,
      category,
      date,
    };
    realJournalEntries.unshift(newEntry);
    return Promise.resolve({ data: newEntry, error: null });
  },

  deleteJournalEntry: async (id: number) => {
    const entries = getCurrentJournalEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries.splice(index, 1);
    }
    return { data: null, error: null };
  },

  // Schedules
  createSchedule: async (title: string, startTime: string, endTime: string, templateName?: string) => {
    const newSchedule: ScheduleEvent = {
      id: crypto.randomUUID(),
      title,
      start_time: startTime,
      end_time: endTime,
      template_name: templateName,
    };
    realSchedules.push(newSchedule);
    return { data: newSchedule, error: null };
  },
  getSchedules: async (startDate: string, endDate: string) => {
    const schedules = getCurrentSchedules();
    return {
      data: schedules.filter(s => s.start_time >= startDate && s.end_time <= endDate),
      error: null,
    };
  },
  deleteSchedule: async (id: string) => {
    const schedules = getCurrentSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules.splice(index, 1);
    }
    return { data: null, error: null };
  },

  // Work Logs (from WorkTimeTracker localStorage)
  getWorkLogs: async (startDate: string, endDate: string) => {
    const workLogs = getWorkLogsFromStorage();
    return {
      data: workLogs.filter(w => w.date >= startDate && w.date <= endDate),
      error: null,
    };
  },
};

// ============================================
// SMART SCHEDULER DATA AGGREGATION
// ============================================
export const smartSchedulerData = {
  // Get aggregated user inputs for Fuzzy Logic using REAL data
  getUserInputs: (): UserInputs => {
    return aggregateUserProfile(
      getCurrentActivities(),
      getWorkLogsFromStorage(),
      getCurrentJournalEntries(),
      getCurrentGoals(),
      getCurrentSchedules(),
      getDefaultPreferences()
    );
  },

  // Get current schedule format for GA baseline comparison
  getCurrentSchedule: () => {
    return schedulesToCurrentFormat(getCurrentSchedules());
  },

  // Get user preferences
  getPreferences: (): UserPreferences => {
    return getDefaultPreferences();
  },

  // Get raw data for debugging/inspection
  getRawData: () => ({
    activities: getCurrentActivities(),
    workLogs: getWorkLogsFromStorage(),
    journalEntries: getCurrentJournalEntries(),
    goals: getCurrentGoals(),
    schedules: getCurrentSchedules(),
  }),

  // Check if user has any real data
  hasRealData: (): boolean => {
    return realActivities.length > 0 || 
           realGoals.length > 0 || 
           realJournalEntries.length > 0 || 
           realSchedules.length > 0 ||
           getWorkLogsFromStorage().length > 0;
  },

  // Regenerate synthetic profile (for testing only)
  regenerateTestProfile: (days = 30) => {
    syntheticProfile = generateSyntheticProfile(days);
    return syntheticProfile;
  },

  // Clear all real user data (for testing)
  clearRealData: () => {
    realActivities = [];
    realGoals = [];
    realJournalEntries = [];
    realSchedules = [];
  },
};