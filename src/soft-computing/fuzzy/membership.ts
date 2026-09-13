import { MembershipFunction, FuzzyVariable } from '../types';

export function trimf(x: number, params: number[]): number {
  const [a, b, c] = params;
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function trapmf(x: number, params: number[]): number {
  const [a, b, c, d] = params;
  if (x <= a || x >= d) return 0;
  if (x < b) return (x - a) / (b - a);
  if (x <= c) return 1;
  return (d - x) / (d - c);
}

export function evaluateMF(x: number, mf: MembershipFunction): number {
  switch (mf.type) {
    case 'trimf':
      return trimf(x, mf.params);
    case 'trapmf':
      return trapmf(x, mf.params);
    default:
      return 0;
  }
}

export function fuzzify(value: number, variable: FuzzyVariable): Record<string, number> {
  const result: Record<string, number> = {};
  for (const mf of variable.memberships) {
    result[mf.name] = evaluateMF(value, mf);
  }
  return result;
}

export const fuzzyVariables: Record<string, FuzzyVariable> = {
  workHours: {
    name: 'workHours',
    range: [0, 16],
    memberships: [
      { name: 'low', type: 'trapmf', params: [0, 0, 4, 6] },
      { name: 'medium', type: 'trimf', params: [4, 8, 12] },
      { name: 'high', type: 'trapmf', params: [10, 12, 16, 16] },
    ],
  },
  sleepHours: {
    name: 'sleepHours',
    range: [0, 12],
    memberships: [
      { name: 'low', type: 'trapmf', params: [0, 0, 4, 6] },
      { name: 'adequate', type: 'trimf', params: [5, 7, 9] },
      { name: 'high', type: 'trapmf', params: [8, 10, 12, 12] },
    ],
  },
  exerciseHours: {
    name: 'exerciseHours',
    range: [0, 4],
    memberships: [
      { name: 'none', type: 'trapmf', params: [0, 0, 0.5, 1] },
      { name: 'moderate', type: 'trimf', params: [0.5, 1.5, 2.5] },
      { name: 'high', type: 'trapmf', params: [2, 3, 4, 4] },
    ],
  },
  stressLevel: {
    name: 'stressLevel',
    range: [1, 5],
    memberships: [
      { name: 'low', type: 'trimf', params: [1, 1, 2.5] },
      { name: 'medium', type: 'trimf', params: [2, 3, 4] },
      { name: 'high', type: 'trimf', params: [3.5, 5, 5] },
    ],
  },
  productivity: {
    name: 'productivity',
    range: [1, 5],
    memberships: [
      { name: 'low', type: 'trimf', params: [1, 1, 2.5] },
      { name: 'medium', type: 'trimf', params: [2, 3, 4] },
      { name: 'high', type: 'trimf', params: [3.5, 5, 5] },
    ],
  },
  workload: {
    name: 'workload',
    range: [1, 5],
    memberships: [
      { name: 'light', type: 'trimf', params: [1, 1, 2.5] },
      { name: 'moderate', type: 'trimf', params: [2, 3, 4] },
      { name: 'heavy', type: 'trimf', params: [3.5, 5, 5] },
    ],
  },
  sleepQuality: {
    name: 'sleepQuality',
    range: [1, 5],
    memberships: [
      { name: 'poor', type: 'trimf', params: [1, 1, 2.5] },
      { name: 'fair', type: 'trimf', params: [2, 3, 4] },
      { name: 'good', type: 'trimf', params: [3.5, 5, 5] },
    ],
  },
  personalHours: {
    name: 'personalHours',
    range: [0, 8],
    memberships: [
      { name: 'low', type: 'trapmf', params: [0, 0, 1, 2] },
      { name: 'moderate', type: 'trimf', params: [1, 3, 5] },
      { name: 'high', type: 'trapmf', params: [4, 6, 8, 8] },
    ],
  },
  goalProgress: {
    name: 'goalProgress',
    range: [0, 100],
    memberships: [
      { name: 'low', type: 'trapmf', params: [0, 0, 30, 50] },
      { name: 'medium', type: 'trimf', params: [30, 50, 70] },
      { name: 'high', type: 'trapmf', params: [50, 70, 100, 100] },
    ],
  },
  deadlineUrgency: {
    name: 'deadlineUrgency',
    range: [0, 10],
    memberships: [
      { name: 'low', type: 'trapmf', params: [0, 0, 2, 4] },
      { name: 'medium', type: 'trimf', params: [2, 5, 8] },
      { name: 'high', type: 'trapmf', params: [6, 8, 10, 10] },
    ],
  },
};

export const outputBalance: FuzzyVariable = {
  name: 'balanceScore',
  range: [0, 100],
  memberships: [
    { name: 'poor', type: 'trapmf', params: [0, 0, 20, 40] },
    { name: 'fair', type: 'trimf', params: [30, 50, 70] },
    { name: 'good', type: 'trapmf', params: [60, 80, 100, 100] },
  ],
};

export const outputStress: FuzzyVariable = {
  name: 'stressScore',
  range: [0, 100],
  memberships: [
    { name: 'low', type: 'trapmf', params: [0, 0, 20, 40] },
    { name: 'medium', type: 'trimf', params: [30, 50, 70] },
    { name: 'high', type: 'trapmf', params: [60, 80, 100, 100] },
  ],
};

export function centroidDefuzzify(
  outputMF: Record<string, number>,
  variable: FuzzyVariable
): number {
  let numerator = 0;
  let denominator = 0;
  const step = 1;
  for (let x = variable.range[0]; x <= variable.range[1]; x += step) {
    let maxMu = 0;
    for (const [name, mu] of Object.entries(outputMF)) {
      const mf = variable.memberships.find((m) => m.name === name);
      if (mf) {
        const val = evaluateMF(x, mf);
        maxMu = Math.max(maxMu, Math.min(mu, val));
      }
    }
    numerator += x * maxMu;
    denominator += maxMu;
  }
  return denominator > 0 ? numerator / denominator : variable.range[0];
}