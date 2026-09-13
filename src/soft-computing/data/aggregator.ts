import { UserInputs, UserProfile, UserPreferences, MoodType, ActivityLog, WorkLog, JournalEntry, Goal, ScheduleEvent } from '../../types';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, differenceInHours } from 'date-fns';

export function aggregateUserProfile(
  activities: ActivityLog[],
  workLogs: WorkLog[],
  journalEntries: JournalEntry[],
  goals: Goal[],
  schedules: ScheduleEvent[],
  preferences: UserPreferences
): UserInputs {
  const last7Days = getLastNDays(7);
  const last30Days = getLastNDays(30);
  
  const recentActivities = activities.filter(a => last7Days.includes(a.date));
  const recentWorkLogs = workLogs.filter(w => last7Days.includes(w.date));
  const recentJournal = journalEntries.filter(j => last7Days.includes(j.date));
  const recentSchedules = schedules.filter(s => {
    const date = s.start_time.split('T')[0];
    return last7Days.includes(date);
  });
  
  const workHours = calculateAvgWorkHours(recentWorkLogs, recentActivities);
  const overtimeHours = calculateOvertime(recentWorkLogs, preferences.maxWorkHours);
  const workload = calculateWorkload(recentWorkLogs, recentActivities);
  const sleepHours = calculateSleepHours(recentJournal, recentSchedules);
  const sleepQuality = calculateSleepQuality(recentJournal);
  const exerciseHours = calculateExerciseHours(recentActivities);
  const exerciseIntensity = calculateExerciseIntensity(recentActivities);
  const personalHours = calculatePersonalHours(recentActivities, recentSchedules);
  const stressLevel = calculateStressLevel(recentJournal);
  const mood = getDominantMood(recentJournal);
  const productivity = calculateProductivity(recentJournal, goals);
  const goalProgress = calculateAvgGoalProgress(goals);
  const activeGoals = goals.filter(g => !g.completed).length;
  const deadlineUrgency = calculateDeadlineUrgency(goals);
  
  return {
    workHours,
    overtimeHours,
    workload,
    sleepHours,
    sleepQuality,
    exerciseHours,
    exerciseIntensity,
    personalHours,
    stressLevel,
    mood,
    productivity,
    goalProgress,
    activeGoals,
    deadlineUrgency,
  };
}

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );
}

function calculateAvgWorkHours(workLogs: WorkLog[], activities: ActivityLog[]): number {
  if (workLogs.length > 0) {
    const total = workLogs.reduce((sum, log) => sum + log.duration, 0);
    return total / Math.max(1, new Set(workLogs.map(l => l.date)).size);
  }
  
  const workActivities = activities.filter(a => a.type === 'work');
  if (workActivities.length > 0) {
    const total = workActivities.reduce((sum, a) => sum + a.hours, 0);
    return total / Math.max(1, new Set(workActivities.map(a => a.date)).size);
  }
  
  return 8;
}

function calculateOvertime(workLogs: WorkLog[], maxHours: number): number {
  if (workLogs.length === 0) return 0;
  const avgDaily = workLogs.reduce((sum, log) => sum + log.duration, 0) / 
    Math.max(1, new Set(workLogs.map(l => l.date)).size);
  return Math.max(0, avgDaily - maxHours);
}

function calculateWorkload(workLogs: WorkLog[], activities: ActivityLog[]): number {
  const workHours = calculateAvgWorkHours(workLogs, activities);
  const workDays = new Set([
    ...workLogs.map(l => l.date),
    ...activities.filter(a => a.type === 'work').map(a => a.date)
  ]).size;
  
  if (workHours > 10) return 5;
  if (workHours > 8) return 4;
  if (workHours > 6) return 3;
  if (workHours > 4) return 2;
  return 1;
}

function calculateSleepHours(journal: JournalEntry[], schedules: ScheduleEvent[]): number {
  const sleepEntries = schedules.filter(s => 
    s.title.toLowerCase().includes('sleep') || 
    s.title.toLowerCase().includes('bed')
  );
  
  if (sleepEntries.length > 0) {
    let totalHours = 0;
    for (const entry of sleepEntries) {
      const start = parseISO(entry.start_time);
      const end = parseISO(entry.end_time);
      totalHours += differenceInHours(end, start);
    }
    return totalHours / Math.max(1, new Set(sleepEntries.map(s => s.start_time.split('T')[0])).size);
  }
  
  const tiredEntries = journal.filter(j => j.mood === 'tired');
  if (tiredEntries.length > journal.length * 0.3) return 6;
  if (tiredEntries.length > 0) return 7;
  return 7.5;
}

function calculateSleepQuality(journal: JournalEntry[]): number {
  if (journal.length === 0) return 3;
  
  const moodScores: Record<MoodType, number> = {
    productive: 4,
    happy: 4,
    neutral: 3,
    stressed: 2,
    tired: 1,
  };
  
  const avgScore = journal.reduce((sum, j) => sum + moodScores[j.mood], 0) / journal.length;
  return Math.round(avgScore);
}

function calculateExerciseHours(activities: ActivityLog[]): number {
  const exerciseActivities = activities.filter(a => a.type === 'exercise');
  if (exerciseActivities.length === 0) return 0;
  const total = exerciseActivities.reduce((sum, a) => sum + a.hours, 0);
  return total / Math.max(1, new Set(exerciseActivities.map(a => a.date)).size);
}

function calculateExerciseIntensity(activities: ActivityLog[]): number {
  const exerciseActivities = activities.filter(a => a.type === 'exercise');
  if (exerciseActivities.length === 0) return 1;
  
  const avgHours = exerciseActivities.reduce((sum, a) => sum + a.hours, 0) / exerciseActivities.length;
  if (avgHours > 1.5) return 5;
  if (avgHours > 1) return 4;
  if (avgHours > 0.5) return 3;
  return 2;
}

function calculatePersonalHours(activities: ActivityLog[], schedules: ScheduleEvent[]): number {
  const personalActivities = activities.filter(a => a.type === 'personal' || a.type === 'hobbies');
  let total = personalActivities.reduce((sum, a) => sum + a.hours, 0);
  
  const personalSchedules = schedules.filter(s => 
    !s.title.toLowerCase().includes('work') &&
    !s.title.toLowerCase().includes('meeting') &&
    !s.title.toLowerCase().includes('sleep') &&
    !s.title.toLowerCase().includes('exercise')
  );
  
  for (const s of personalSchedules) {
    const start = parseISO(s.start_time);
    const end = parseISO(s.end_time);
    total += differenceInHours(end, start);
  }
  
  const days = Math.max(1, new Set([
    ...personalActivities.map(a => a.date),
    ...personalSchedules.map(s => s.start_time.split('T')[0])
  ]).size);
  
  return total / days;
}

function calculateStressLevel(journal: JournalEntry[]): number {
  if (journal.length === 0) return 2;
  
  const moodStress: Record<MoodType, number> = {
    productive: 1,
    happy: 1,
    neutral: 3,
    stressed: 5,
    tired: 4,
  };
  
  const avgStress = journal.reduce((sum, j) => sum + moodStress[j.mood], 0) / journal.length;
  return Math.round(avgStress);
}

function getDominantMood(journal: JournalEntry[]): MoodType {
  if (journal.length === 0) return 'neutral';
  
  const moodCounts: Record<MoodType, number> = {
    productive: 0,
    happy: 0,
    neutral: 0,
    stressed: 0,
    tired: 0,
  };
  
  for (const j of journal) {
    moodCounts[j.mood]++;
  }
  
  return Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as MoodType;
}

function calculateProductivity(journal: JournalEntry[], goals: Goal[]): number {
  if (journal.length === 0) return 3;
  
  const moodProd: Record<MoodType, number> = {
    productive: 5,
    happy: 4,
    neutral: 3,
    stressed: 2,
    tired: 1,
  };
  
  const avgProd = journal.reduce((sum, j) => sum + moodProd[j.mood], 0) / journal.length;
  
  const goalFactor = goals.length > 0 
    ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length / 100 
    : 0.5;
  
  return Math.round(avgProd * 0.7 + goalFactor * 30 * 0.3);
}

function calculateAvgGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  return goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
}

function calculateDeadlineUrgency(goals: Goal[]): number {
  const activeGoals = goals.filter(g => !g.completed);
  if (activeGoals.length === 0) return 0;
  
  let totalUrgency = 0;
  for (const goal of activeGoals) {
    const daysLeft = Math.max(0, differenceInHours(
      parseISO(goal.deadline), 
      new Date()
    ) / 24);
    
    if (daysLeft <= 1) totalUrgency += 10;
    else if (daysLeft <= 3) totalUrgency += 7;
    else if (daysLeft <= 7) totalUrgency += 4;
    else if (daysLeft <= 14) totalUrgency += 2;
    else totalUrgency += 1;
  }
  
  return Math.min(10, Math.round(totalUrgency / activeGoals.length));
}

export function getDefaultPreferences(): UserPreferences {
  return {
    maxWorkHours: 10,
    minSleepHours: 7,
    preferredWorkStart: 9,
    preferredWorkEnd: 18,
    fixedMeetings: [],
  };
}

export function schedulesToCurrentFormat(schedules: ScheduleEvent[]): Array<{start: number, end: number, activity: string, isFixed: boolean}> {
  return schedules.map(s => {
    const start = parseISO(s.start_time);
    const end = parseISO(s.end_time);
    return {
      start: start.getHours() + start.getMinutes() / 60,
      end: end.getHours() + end.getMinutes() / 60,
      activity: inferActivityType(s.title),
      isFixed: false,
    };
  });
}

function inferActivityType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('work') || lower.includes('meeting') || lower.includes('project')) return 'work';
  if (lower.includes('sleep') || lower.includes('bed')) return 'sleep';
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym')) return 'exercise';
  if (lower.includes('break') || lower.includes('lunch')) return 'break';
  return 'personal';
}