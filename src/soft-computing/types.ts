export interface UserInputs {
  workHours: number;
  overtimeHours: number;
  workload: number;
  sleepHours: number;
  sleepQuality: number;
  exerciseHours: number;
  exerciseIntensity: number;
  personalHours: number;
  stressLevel: number;
  mood: MoodType;
  productivity: number;
  goalProgress: number;
  activeGoals: number;
  deadlineUrgency: number;
}

export type MoodType = 'productive' | 'happy' | 'neutral' | 'stressed' | 'tired';

export interface FuzzyOutput {
  balanceScore: number;
  stressScore: number;
  firedRules: FiredRule[];
}

export interface FiredRule {
  name: string;
  strength: number;
  consequence: { balance: number; stress: number };
}

export interface MembershipFunction {
  name: string;
  type: 'trimf' | 'trapmf';
  params: number[];
}

export interface FuzzyVariable {
  name: string;
  range: [number, number];
  memberships: MembershipFunction[];
}

export interface FuzzyRule {
  name: string;
  antecedent: (inputs: UserInputs) => number;
  consequence: { balance: number; stress: number };
}

export interface ScheduleSlot {
  start: number;
  end: number;
  activity: ActivityType;
  isFixed: boolean;
}

export type ActivityType = 'work' | 'sleep' | 'exercise' | 'personal' | 'hobby' | 'meeting' | 'break';

export interface Chromosome {
  genes: ActivityType[];
  fitness: number;
  violations: ConstraintViolation[];
}

export interface ConstraintViolation {
  type: 'overlap' | 'maxWork' | 'minSleep' | 'noExercise' | 'missedMeeting' | 'missedDeadline';
  severity: number;
  description: string;
}

export interface GAConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitismRate: number;
  tournamentSize: number;
  stagnationLimit: number;
}

export interface FitnessWeights {
  wBalance: number;
  wProductivity: number;
  wStress: number;
  wConstraints: number;
}

export interface OptimizedSchedule {
  slots: ScheduleSlot[];
  fitness: number;
  balanceScore: number;
  productivityScore: number;
  stressScore: number;
  violations: ConstraintViolation[];
  convergence: number[];
  firedRules?: FiredRule[];
}

export interface BaselineSchedule {
  name: string;
  slots: ScheduleSlot[];
  fitness: number;
  balanceScore: number;
  productivityScore: number;
  stressScore: number;
  violations: ConstraintViolation[];
}

export interface UserProfile {
  activities: ActivityLog[];
  workLogs: WorkLog[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  schedules: ScheduleEvent[];
  preferences: UserPreferences;
}

export interface ActivityLog {
  id: string;
  type: 'work' | 'personal' | 'exercise' | 'hobbies';
  hours: number;
  date: string;
}

export interface WorkLog {
  id: string;
  date: string;
  punchIn: string;
  punchOut: string;
  duration: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  content: string;
  mood: MoodType;
  category: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  deadline: string;
  completed: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  template_name?: string;
}

export interface UserPreferences {
  maxWorkHours: number;
  minSleepHours: number;
  preferredWorkStart: number;
  preferredWorkEnd: number;
  fixedMeetings: FixedMeeting[];
}

export interface FixedMeeting {
  day: number;
  start: number;
  end: number;
  title: string;
}

export interface ExperimentResult {
  experiment: string;
  parameters: Record<string, unknown>;
  metrics: {
    fitness: number;
    balance: number;
    productivity: number;
    stress: number;
    violations: number;
    executionTime: number;
    convergenceGen: number;
  };
}