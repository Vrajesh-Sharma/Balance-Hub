import { UserInputs, ActivityLog, WorkLog, JournalEntry, Goal, ScheduleEvent, UserPreferences, MoodType } from '../../types';
import { format, subDays, subHours, addHours, startOfDay } from 'date-fns';

const MOODS: MoodType[] = ['productive', 'happy', 'neutral', 'stressed', 'tired'];
const ACTIVITY_TYPES = ['work', 'personal', 'exercise', 'hobbies'] as const;
const GOAL_CATEGORIES = ['work', 'personal', 'exercise', 'learning'] as const;

export function generateSyntheticProfile(days = 30): {
  activities: ActivityLog[];
  workLogs: WorkLog[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  schedules: ScheduleEvent[];
  preferences: UserPreferences;
  inputs: UserInputs;
} {
  const activities: ActivityLog[] = [];
  const workLogs: WorkLog[] = [];
  const journalEntries: JournalEntry[] = [];
  const schedules: ScheduleEvent[] = [];
  
  const baseDate = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = format(subDays(baseDate, day), 'yyyy-MM-dd');
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
    
    const workHours = isWeekend ? random(0, 2) : random(7, 10);
    const sleepHours = random(6, 9);
    const exerciseHours = random(0, 1.5);
    const personalHours = random(1, 4);
    const hobbyHours = random(0, 2);
    
    activities.push(
      { id: crypto.randomUUID(), type: 'work', hours: workHours, date },
      { id: crypto.randomUUID(), type: 'personal', hours: personalHours, date },
      { id: crypto.randomUUID(), type: 'exercise', hours: exerciseHours, date },
      { id: crypto.randomUUID(), type: 'hobbies', hours: hobbyHours, date }
    );
    
    if (!isWeekend && workHours > 0) {
      const punchIn = 9 + random(-1, 1);
      const punchOut = punchIn + workHours;
      workLogs.push({
        id: crypto.randomUUID(),
        date,
        punchIn: formatTime(punchIn),
        punchOut: formatTime(punchOut),
        duration: workHours,
      });
    }
    
    const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
    journalEntries.push({
      id: journalEntries.length + 1,
      date,
      content: `Day ${day + 1} journal entry`,
      mood,
      category: ['work', 'personal', 'health', 'goals'][Math.floor(Math.random() * 4)],
    });
    
    const dayStart = startOfDay(new Date(date));
    
    schedules.push(
      {
        id: crypto.randomUUID(),
        title: 'Sleep',
        start_time: format(subHours(dayStart, 24 - 22), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        end_time: format(addHours(subHours(dayStart, 24 - 22), sleepHours), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        template_name: 'Daily Routine',
      },
      {
        id: crypto.randomUUID(),
        title: 'Work',
        start_time: format(addHours(dayStart, 9), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        end_time: format(addHours(dayStart, 9 + workHours), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        template_name: 'Work Schedule',
      }
    );
    
    if (exerciseHours > 0) {
      schedules.push({
        id: crypto.randomUUID(),
        title: 'Exercise',
        start_time: format(addHours(dayStart, 7), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        end_time: format(addHours(dayStart, 7 + exerciseHours), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        template_name: 'Daily Routine',
      });
    }
  }
  
  const goals: Goal[] = [
    {
      id: crypto.randomUUID(),
      title: 'Complete Project Milestone',
      category: 'work',
      progress: random(50, 90),
      deadline: format(subDays(baseDate, -random(7, 30)), 'yyyy-MM-dd'),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      title: 'Read 2 Books',
      category: 'personal',
      progress: random(20, 80),
      deadline: format(subDays(baseDate, -random(14, 60)), 'yyyy-MM-dd'),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      title: 'Run 5K',
      category: 'exercise',
      progress: random(60, 95),
      deadline: format(subDays(baseDate, -random(5, 21)), 'yyyy-MM-dd'),
      completed: false,
    },
  ];
  
  const preferences: UserPreferences = {
    maxWorkHours: 10,
    minSleepHours: 7,
    preferredWorkStart: 9,
    preferredWorkEnd: 18,
    fixedMeetings: [
      { day: 1, start: 10, end: 11, title: 'Team Standup' },
      { day: 3, start: 14, end: 15, title: 'Project Review' },
    ],
  };
  
  const inputs = aggregateFromSynthetic(activities, workLogs, journalEntries, goals, schedules, preferences);
  
  return { activities, workLogs, journalEntries, goals, schedules, preferences, inputs };
}

function aggregateFromSynthetic(
  activities: ActivityLog[],
  workLogs: WorkLog[],
  journalEntries: JournalEntry[],
  goals: Goal[],
  schedules: ScheduleEvent[],
  preferences: UserPreferences
): UserInputs {
  const last7Days = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );
  
  const recentActivities = activities.filter(a => last7Days.includes(a.date));
  const recentWorkLogs = workLogs.filter(w => last7Days.includes(w.date));
  const recentJournal = journalEntries.filter(j => last7Days.includes(j.date));
  
  const workHours = recentWorkLogs.length > 0
    ? recentWorkLogs.reduce((sum, log) => sum + log.duration, 0) / Math.max(1, new Set(recentWorkLogs.map(l => l.date)).size)
    : recentActivities.filter(a => a.type === 'work').reduce((sum, a) => sum + a.hours, 0) / 7;
  
  const sleepHours = 7.5;
  const exerciseHours = recentActivities.filter(a => a.type === 'exercise').reduce((sum, a) => sum + a.hours, 0) / 7;
  const personalHours = recentActivities.filter(a => a.type === 'personal' || a.type === 'hobbies').reduce((sum, a) => sum + a.hours, 0) / 7;
  
  const moodStress: Record<MoodType, number> = {
    productive: 1, happy: 1, neutral: 3, stressed: 5, tired: 4,
  };
  const stressLevel = recentJournal.length > 0
    ? Math.round(recentJournal.reduce((sum, j) => sum + moodStress[j.mood], 0) / recentJournal.length)
    : 2;
  
  const moodProd: Record<MoodType, number> = {
    productive: 5, happy: 4, neutral: 3, stressed: 2, tired: 1,
  };
  const productivity = recentJournal.length > 0
    ? Math.round(recentJournal.reduce((sum, j) => sum + moodProd[j.mood], 0) / recentJournal.length)
    : 3;
  
  const goalProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
    : 50;
  
  return {
    workHours,
    overtimeHours: Math.max(0, workHours - preferences.maxWorkHours),
    workload: workHours > 10 ? 5 : workHours > 8 ? 4 : workHours > 6 ? 3 : 2,
    sleepHours,
    sleepQuality: 3,
    exerciseHours,
    exerciseIntensity: exerciseHours > 1 ? 4 : exerciseHours > 0.5 ? 3 : 2,
    personalHours,
    stressLevel,
    mood: getDominantMood(recentJournal),
    productivity,
    goalProgress,
    activeGoals: goals.filter(g => !g.completed).length,
    deadlineUrgency: calculateDeadlineUrgency(goals),
  };
}

function getDominantMood(journal: JournalEntry[]): MoodType {
  if (journal.length === 0) return 'neutral';
  const counts: Record<MoodType, number> = { productive: 0, happy: 0, neutral: 0, stressed: 0, tired: 0 };
  for (const j of journal) counts[j.mood]++;
  return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as MoodType;
}

function calculateDeadlineUrgency(goals: Goal[]): number {
  const active = goals.filter(g => !g.completed);
  if (active.length === 0) return 0;
  let total = 0;
  for (const g of active) {
    const daysLeft = (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 1) total += 10;
    else if (daysLeft <= 3) total += 7;
    else if (daysLeft <= 7) total += 4;
    else if (daysLeft <= 14) total += 2;
    else total += 1;
  }
  return Math.min(10, Math.round(total / active.length));
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateMultipleProfiles(count: number): Array<{inputs: UserInputs, preferences: UserPreferences}> {
  return Array.from({ length: count }, () => {
    const profile = generateSyntheticProfile(30);
    return { inputs: profile.inputs, preferences: profile.preferences };
  });
}