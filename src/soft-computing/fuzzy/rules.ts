import { UserInputs, FuzzyRule } from '../../types';
import { fuzzyVariables, outputBalance, outputStress, evaluateMF } from './membership';

function min(...values: number[]): number {
  return Math.min(...values);
}

function max(...values: number[]): number {
  return Math.max(...values);
}

export const fuzzyRules: FuzzyRule[] = [
  {
    name: 'R1: High work + Low sleep -> High stress, Low balance',
    antecedent: (inputs) => {
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'high');
      const sleep = fuzzyVariables.sleepHours.memberships.find(m => m.name === 'low');
      if (!work || !sleep) return 0;
      return min(
        evaluateMF(inputs.workHours, work),
        evaluateMF(inputs.sleepHours, sleep)
      );
    },
    consequence: { balance: 20, stress: 80 },
  },
  {
    name: 'R2: High work + No exercise -> High stress, Low balance',
    antecedent: (inputs) => {
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'high');
      const exercise = fuzzyVariables.exerciseHours.memberships.find(m => m.name === 'none');
      if (!work || !exercise) return 0;
      return min(
        evaluateMF(inputs.workHours, work),
        evaluateMF(inputs.exerciseHours, exercise)
      );
    },
    consequence: { balance: 25, stress: 75 },
  },
  {
    name: 'R3: Heavy workload + High stress -> High stress, Low balance',
    antecedent: (inputs) => {
      const workload = fuzzyVariables.workload.memberships.find(m => m.name === 'heavy');
      const stress = fuzzyVariables.stressLevel.memberships.find(m => m.name === 'high');
      if (!workload || !stress) return 0;
      return min(
        evaluateMF(inputs.workload, workload),
        evaluateMF(inputs.stressLevel, stress)
      );
    },
    consequence: { balance: 15, stress: 85 },
  },
  {
    name: 'R4: Adequate sleep + Moderate exercise -> Good balance, Low stress',
    antecedent: (inputs) => {
      const sleep = fuzzyVariables.sleepHours.memberships.find(m => m.name === 'adequate');
      const exercise = fuzzyVariables.exerciseHours.memberships.find(m => m.name === 'moderate');
      if (!sleep || !exercise) return 0;
      return min(
        evaluateMF(inputs.sleepHours, sleep),
        evaluateMF(inputs.exerciseHours, exercise)
      );
    },
    consequence: { balance: 80, stress: 20 },
  },
  {
    name: 'R5: High personal time + Good sleep -> Good balance, Low stress',
    antecedent: (inputs) => {
      const personal = fuzzyVariables.personalHours.memberships.find(m => m.name === 'high');
      const sleep = fuzzyVariables.sleepHours.memberships.find(m => m.name === 'adequate');
      if (!personal || !sleep) return 0;
      return min(
        evaluateMF(inputs.personalHours, personal),
        evaluateMF(inputs.sleepHours, sleep)
      );
    },
    consequence: { balance: 85, stress: 15 },
  },
  {
    name: 'R6: High productivity + High goal progress -> Good balance, Low stress',
    antecedent: (inputs) => {
      const prod = fuzzyVariables.productivity.memberships.find(m => m.name === 'high');
      const goal = fuzzyVariables.goalProgress.memberships.find(m => m.name === 'high');
      if (!prod || !goal) return 0;
      return min(
        evaluateMF(inputs.productivity, prod),
        evaluateMF(inputs.goalProgress, goal)
      );
    },
    consequence: { balance: 75, stress: 25 },
  },
  {
    name: 'R7: Low work + High personal -> Good balance, Low stress',
    antecedent: (inputs) => {
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'low');
      const personal = fuzzyVariables.personalHours.memberships.find(m => m.name === 'high');
      if (!work || !personal) return 0;
      return min(
        evaluateMF(inputs.workHours, work),
        evaluateMF(inputs.personalHours, personal)
      );
    },
    consequence: { balance: 90, stress: 10 },
  },
  {
    name: 'R8: High deadline urgency + High work -> High stress, Low balance',
    antecedent: (inputs) => {
      const urgency = fuzzyVariables.deadlineUrgency.memberships.find(m => m.name === 'high');
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'high');
      if (!urgency || !work) return 0;
      return min(
        evaluateMF(inputs.deadlineUrgency, urgency),
        evaluateMF(inputs.workHours, work)
      );
    },
    consequence: { balance: 30, stress: 70 },
  },
  {
    name: 'R9: Good sleep quality + Moderate work -> Good balance, Medium stress',
    antecedent: (inputs) => {
      const sleepQ = fuzzyVariables.sleepQuality.memberships.find(m => m.name === 'good');
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'medium');
      if (!sleepQ || !work) return 0;
      return min(
        evaluateMF(inputs.sleepQuality, sleepQ),
        evaluateMF(inputs.workHours, work)
      );
    },
    consequence: { balance: 70, stress: 35 },
  },
  {
    name: 'R10: Low productivity + High stress -> Low balance, High stress',
    antecedent: (inputs) => {
      const prod = fuzzyVariables.productivity.memberships.find(m => m.name === 'low');
      const stress = fuzzyVariables.stressLevel.memberships.find(m => m.name === 'high');
      if (!prod || !stress) return 0;
      return min(
        evaluateMF(inputs.productivity, prod),
        evaluateMF(inputs.stressLevel, stress)
      );
    },
    consequence: { balance: 20, stress: 80 },
  },
  {
    name: 'R11: Moderate work + Moderate exercise + Adequate sleep -> Fair balance, Fair stress',
    antecedent: (inputs) => {
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'medium');
      const exercise = fuzzyVariables.exerciseHours.memberships.find(m => m.name === 'moderate');
      const sleep = fuzzyVariables.sleepHours.memberships.find(m => m.name === 'adequate');
      if (!work || !exercise || !sleep) return 0;
      return min(
        evaluateMF(inputs.workHours, work),
        evaluateMF(inputs.exerciseHours, exercise),
        evaluateMF(inputs.sleepHours, sleep)
      );
    },
    consequence: { balance: 60, stress: 40 },
  },
  {
    name: 'R12: High exercise + Low work -> Good balance, Low stress',
    antecedent: (inputs) => {
      const exercise = fuzzyVariables.exerciseHours.memberships.find(m => m.name === 'high');
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'low');
      if (!exercise || !work) return 0;
      return min(
        evaluateMF(inputs.exerciseHours, exercise),
        evaluateMF(inputs.workHours, work)
      );
    },
    consequence: { balance: 85, stress: 15 },
  },
  {
    name: 'R13: Poor sleep quality + High work -> High stress, Low balance',
    antecedent: (inputs) => {
      const sleepQ = fuzzyVariables.sleepQuality.memberships.find(m => m.name === 'poor');
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'high');
      if (!sleepQ || !work) return 0;
      return min(
        evaluateMF(inputs.sleepQuality, sleepQ),
        evaluateMF(inputs.workHours, work)
      );
    },
    consequence: { balance: 25, stress: 80 },
  },
  {
    name: 'R14: Medium everything -> Fair balance, Fair stress',
    antecedent: (inputs) => {
      const work = fuzzyVariables.workHours.memberships.find(m => m.name === 'medium');
      const sleep = fuzzyVariables.sleepHours.memberships.find(m => m.name === 'adequate');
      const exercise = fuzzyVariables.exerciseHours.memberships.find(m => m.name === 'moderate');
      const stress = fuzzyVariables.stressLevel.memberships.find(m => m.name === 'medium');
      const prod = fuzzyVariables.productivity.memberships.find(m => m.name === 'medium');
      if (!work || !sleep || !exercise || !stress || !prod) return 0;
      return min(
        evaluateMF(inputs.workHours, work),
        evaluateMF(inputs.sleepHours, sleep),
        evaluateMF(inputs.exerciseHours, exercise),
        evaluateMF(inputs.stressLevel, stress),
        evaluateMF(inputs.productivity, prod)
      );
    },
    consequence: { balance: 50, stress: 50 },
  },
  {
    name: 'R15: High personal + Low stress -> Good balance, Low stress',
    antecedent: (inputs) => {
      const personal = fuzzyVariables.personalHours.memberships.find(m => m.name === 'high');
      const stress = fuzzyVariables.stressLevel.memberships.find(m => m.name === 'low');
      if (!personal || !stress) return 0;
      return min(
        evaluateMF(inputs.personalHours, personal),
        evaluateMF(inputs.stressLevel, stress)
      );
    },
    consequence: { balance: 88, stress: 12 },
  },
];

export function getFiredRules(inputs: UserInputs) {
  return fuzzyRules
    .map(rule => ({
      ...rule,
      strength: rule.antecedent(inputs),
    }))
    .filter(rule => rule.strength > 0.01)
    .sort((a, b) => b.strength - a.strength);
}