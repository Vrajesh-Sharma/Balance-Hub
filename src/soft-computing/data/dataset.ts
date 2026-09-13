import { UserInputs, UserPreferences } from '../../types';

export interface DatasetEntry {
  inputs: UserInputs;
  preferences: UserPreferences;
  label?: string;
}

export function loadDatasetFromJSON(json: string): DatasetEntry[] {
  const data = JSON.parse(json);
  return Array.isArray(data) ? data : [data];
}

export function loadDatasetFromCSV(csv: string): DatasetEntry[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const entries: DatasetEntry[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;
    
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => obj[h] = values[idx]);
    
    entries.push(parseDatasetEntry(obj));
  }
  
  return entries;
}

function parseDatasetEntry(obj: Record<string, string>): DatasetEntry {
  return {
    inputs: {
      workHours: parseFloat(obj.workHours || '8'),
      overtimeHours: parseFloat(obj.overtimeHours || '0'),
      workload: parseInt(obj.workload || '3'),
      sleepHours: parseFloat(obj.sleepHours || '7.5'),
      sleepQuality: parseInt(obj.sleepQuality || '3'),
      exerciseHours: parseFloat(obj.exerciseHours || '0.5'),
      exerciseIntensity: parseInt(obj.exerciseIntensity || '2'),
      personalHours: parseFloat(obj.personalHours || '2'),
      stressLevel: parseInt(obj.stressLevel || '2'),
      mood: (obj.mood as any) || 'neutral',
      productivity: parseInt(obj.productivity || '3'),
      goalProgress: parseFloat(obj.goalProgress || '50'),
      activeGoals: parseInt(obj.activeGoals || '2'),
      deadlineUrgency: parseInt(obj.deadlineUrgency || '3'),
    },
    preferences: {
      maxWorkHours: parseInt(obj.maxWorkHours || '10'),
      minSleepHours: parseInt(obj.minSleepHours || '7'),
      preferredWorkStart: parseInt(obj.preferredWorkStart || '9'),
      preferredWorkEnd: parseInt(obj.preferredWorkEnd || '18'),
      fixedMeetings: [],
    },
    label: obj.label,
  };
}

export function saveDatasetToJSON(entries: DatasetEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function saveDatasetToCSV(entries: DatasetEntry[]): string {
  if (entries.length === 0) return '';
  
  const headers = [
    'workHours', 'overtimeHours', 'workload', 'sleepHours', 'sleepQuality',
    'exerciseHours', 'exerciseIntensity', 'personalHours', 'stressLevel',
    'mood', 'productivity', 'goalProgress', 'activeGoals', 'deadlineUrgency',
    'maxWorkHours', 'minSleepHours', 'preferredWorkStart', 'preferredWorkEnd',
    'label'
  ];
  
  const rows = entries.map(e => [
    e.inputs.workHours,
    e.inputs.overtimeHours,
    e.inputs.workload,
    e.inputs.sleepHours,
    e.inputs.sleepQuality,
    e.inputs.exerciseHours,
    e.inputs.exerciseIntensity,
    e.inputs.personalHours,
    e.inputs.stressLevel,
    e.inputs.mood,
    e.inputs.productivity,
    e.inputs.goalProgress,
    e.inputs.activeGoals,
    e.inputs.deadlineUrgency,
    e.preferences.maxWorkHours,
    e.preferences.minSleepHours,
    e.preferences.preferredWorkStart,
    e.preferences.preferredWorkEnd,
    e.label || '',
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

export async function fetchPublicDataset(url: string): Promise<DatasetEntry[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (url.endsWith('.json')) {
      return loadDatasetFromJSON(text);
    } else if (url.endsWith('.csv')) {
      return loadDatasetFromCSV(text);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch dataset:', error);
    return [];
  }
}