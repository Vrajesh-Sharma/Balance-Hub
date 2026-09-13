import { 
  Chromosome, 
  ScheduleSlot, 
  ActivityType, 
  UserInputs, 
  ConstraintViolation,
  GAConfig,
  FitnessWeights,
  UserPreferences,
  FiredRule 
} from '../../types';
import { evaluateFuzzy } from '../fuzzy';

const SLOTS_PER_DAY = 48;
const SLOT_DURATION = 30;

const ACTIVITY_TYPES: ActivityType[] = ['work', 'sleep', 'exercise', 'personal', 'hobby', 'meeting', 'break'];

const DEFAULT_PREFERENCES: UserPreferences = {
  maxWorkHours: 10,
  minSleepHours: 7,
  preferredWorkStart: 9,
  preferredWorkEnd: 18,
  fixedMeetings: [],
};

export function createRandomChromosome(inputs: UserInputs, prefs: UserPreferences = DEFAULT_PREFERENCES): Chromosome {
  const genes: ActivityType[] = [];
  
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const hour = i * 0.5;
    let activity: ActivityType;
    
    if (isFixedMeeting(hour, prefs.fixedMeetings)) {
      activity = 'meeting';
    } else if (hour >= prefs.preferredWorkStart && hour < prefs.preferredWorkEnd) {
      activity = Math.random() < 0.7 ? 'work' : 'break';
    } else if (hour >= 22 || hour < 7) {
      activity = 'sleep';
    } else if (hour >= 7 && hour < 9) {
      activity = Math.random() < 0.5 ? 'exercise' : 'personal';
    } else if (hour >= 18 && hour < 22) {
      activity = Math.random() < 0.6 ? 'personal' : 'hobby';
    } else {
      activity = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
    }
    
    genes.push(activity);
  }
  
  return { genes, fitness: 0, violations: [] };
}

export function createTemplateChromosome(templateName: string, prefs: UserPreferences = DEFAULT_PREFERENCES): Chromosome {
  const genes: ActivityType[] = Array(SLOTS_PER_DAY).fill('personal');
  
  const templates: Record<string, Array<{start: number, end: number, activity: ActivityType}>> = {
    'Morning Routine': [
      { start: 6, end: 7, activity: 'exercise' },
      { start: 7, end: 8, activity: 'personal' },
      { start: 8, end: 12, activity: 'work' },
      { start: 12, end: 13, activity: 'break' },
      { start: 13, end: 17, activity: 'work' },
      { start: 17, end: 22, activity: 'personal' },
      { start: 22, end: 6, activity: 'sleep' },
    ],
    'Focus Day': [
      { start: 7, end: 8, activity: 'exercise' },
      { start: 8, end: 9, activity: 'personal' },
      { start: 9, end: 12, activity: 'work' },
      { start: 12, end: 13, activity: 'break' },
      { start: 13, end: 18, activity: 'work' },
      { start: 18, end: 22, activity: 'personal' },
      { start: 22, end: 7, activity: 'sleep' },
    ],
    'Balanced Day': [
      { start: 6, end: 7, activity: 'exercise' },
      { start: 7, end: 9, activity: 'personal' },
      { start: 9, end: 13, activity: 'work' },
      { start: 13, end: 14, activity: 'break' },
      { start: 14, end: 18, activity: 'work' },
      { start: 18, end: 22, activity: 'personal' },
      { start: 22, end: 6, activity: 'sleep' },
    ],
  };
  
  const template = templates[templateName] || templates['Balanced Day'];
  
  for (const block of template) {
    const startSlot = Math.round(block.start * 2);
    const endSlot = Math.round(block.end * 2);
    for (let i = startSlot; i < endSlot && i < SLOTS_PER_DAY; i++) {
      genes[i % SLOTS_PER_DAY] = block.activity;
    }
  }
  
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const hour = i * 0.5;
    if (isFixedMeeting(hour, prefs.fixedMeetings)) {
      genes[i] = 'meeting';
    }
  }
  
  return { genes, fitness: 0, violations: [] };
}

export function createCurrentScheduleChromosome(
  currentSlots: ScheduleSlot[], 
  prefs: UserPreferences = DEFAULT_PREFERENCES
): Chromosome {
  const genes: ActivityType[] = Array(SLOTS_PER_DAY).fill('personal');
  
  for (const slot of currentSlots) {
    const startSlot = Math.round(slot.start * 2);
    const endSlot = Math.round(slot.end * 2);
    for (let i = startSlot; i < endSlot && i < SLOTS_PER_DAY; i++) {
      genes[i] = slot.activity;
    }
  }
  
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const hour = i * 0.5;
    if (isFixedMeeting(hour, prefs.fixedMeetings)) {
      genes[i] = 'meeting';
    }
  }
  
  return { genes, fitness: 0, violations: [] };
}

function isFixedMeeting(hour: number, meetings: Array<{start: number, end: number}>): boolean {
  return meetings.some(m => hour >= m.start && hour < m.end);
}

export function decodeChromosome(chromosome: Chromosome): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let currentActivity = chromosome.genes[0];
  let startSlot = 0;
  
  for (let i = 1; i <= SLOTS_PER_DAY; i++) {
    const activity = i < SLOTS_PER_DAY ? chromosome.genes[i] : null;
    if (activity !== currentActivity || i === SLOTS_PER_DAY) {
      const start = startSlot * 0.5;
      const end = i * 0.5;
      if (end > start) {
        slots.push({
          start,
          end,
          activity: currentActivity,
          isFixed: currentActivity === 'meeting',
        });
      }
      if (i < SLOTS_PER_DAY) {
        currentActivity = activity;
        startSlot = i;
      }
    }
  }
  
  return slots;
}

export function calculateActivityHours(slots: ScheduleSlot[]): Record<ActivityType, number> {
  const hours: Record<ActivityType, number> = {
    work: 0, sleep: 0, exercise: 0, personal: 0, hobby: 0, meeting: 0, break: 0,
  };
  
  for (const slot of slots) {
    hours[slot.activity] += slot.end - slot.start;
  }
  
  return hours;
}

export function checkConstraints(
  slots: ScheduleSlot[], 
  prefs: UserPreferences,
  inputs: UserInputs
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const hours = calculateActivityHours(slots);
  
  if (hours.work > prefs.maxWorkHours) {
    violations.push({
      type: 'maxWork',
      severity: (hours.work - prefs.maxWorkHours) * 10,
      description: `Work hours (${hours.work.toFixed(1)}) exceeds maximum (${prefs.maxWorkHours})`,
    });
  }
  
  if (hours.sleep < prefs.minSleepHours) {
    violations.push({
      type: 'minSleep',
      severity: (prefs.minSleepHours - hours.sleep) * 15,
      description: `Sleep hours (${hours.sleep.toFixed(1)}) below minimum (${prefs.minSleepHours})`,
    });
  }
  
  if (hours.exercise < 0.5) {
    violations.push({
      type: 'noExercise',
      severity: 20,
      description: 'No exercise scheduled',
    });
  }
  
  for (const meeting of prefs.fixedMeetings) {
    const hasMeeting = slots.some(s => 
      s.activity === 'meeting' && s.start <= meeting.start && s.end >= meeting.end
    );
    if (!hasMeeting) {
      violations.push({
        type: 'missedMeeting',
        severity: 100,
        description: `Missed fixed meeting: ${meeting.start}-${meeting.end}`,
      });
    }
  }
  
  if (inputs.deadlineUrgency > 7 && hours.work < 6) {
    violations.push({
      type: 'missedDeadline',
      severity: (inputs.deadlineUrgency - 7) * 10,
      description: 'Insufficient work time for urgent deadlines',
    });
  }
  
  for (let i = 0; i < slots.length - 1; i++) {
    if (slots[i].end > slots[i + 1].start) {
      violations.push({
        type: 'overlap',
        severity: 50,
        description: `Overlap: ${slots[i].activity} (${slots[i].start}-${slots[i].end}) and ${slots[i+1].activity} (${slots[i+1].start}-${slots[i+1].end})`,
      });
    }
  }
  
  return violations;
}

export function calculateFitness(
  chromosome: Chromosome,
  inputs: UserInputs,
  prefs: UserPreferences,
  weights: FitnessWeights
): { fitness: number; balanceScore: number; productivityScore: number; stressScore: number; violations: ConstraintViolation[]; firedRules: FiredRule[] } {
  const slots = decodeChromosome(chromosome);
  const violations = checkConstraints(slots, prefs, inputs);
  
  const hours = calculateActivityHours(slots);
  
  const fuzzyInputs: UserInputs = {
    ...inputs,
    workHours: hours.work,
    exerciseHours: hours.exercise,
    personalHours: hours.personal + hours.hobby,
    sleepHours: hours.sleep,
  };
  
  const fuzzyResult = evaluateFuzzy(fuzzyInputs);
  
  const productivityScore = calculateProductivityScore(hours, inputs);
  
  const violationPenalty = violations.reduce((sum, v) => sum + v.severity, 0);
  
  const fitness = 
    weights.wBalance * fuzzyResult.balanceScore +
    weights.wProductivity * productivityScore -
    weights.wStress * fuzzyResult.stressScore -
    weights.wConstraints * violationPenalty;
  
  return {
    fitness,
    balanceScore: fuzzyResult.balanceScore,
    productivityScore,
    stressScore: fuzzyResult.stressScore,
    violations,
    firedRules: fuzzyResult.firedRules,
  };
}

function calculateProductivityScore(hours: Record<ActivityType, number>, inputs: UserInputs): number {
  const workEfficiency = Math.min(1, hours.work / 8) * (inputs.productivity / 5);
  const goalProgress = inputs.goalProgress / 100;
  const focusTime = hours.work > 4 ? 1 : hours.work / 4;
  
  return Math.round((workEfficiency * 0.4 + goalProgress * 0.4 + focusTime * 0.2) * 100);
}