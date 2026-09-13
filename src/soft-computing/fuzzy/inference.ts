import { UserInputs, FuzzyOutput, FiredRule } from '../../types';
import { fuzzyRules, getFiredRules } from './rules';
import { outputBalance, outputStress, centroidDefuzzify, evaluateMF } from './membership';

export function evaluateFuzzy(inputs: UserInputs): FuzzyOutput {
  const firedRules = getFiredRules(inputs);
  
  const balanceOutput: Record<string, number> = {};
  const stressOutput: Record<string, number> = {};

  for (const rule of firedRules) {
    const { balance, stress } = rule.consequence;
    
    for (const mf of outputBalance.memberships) {
      const mu = evaluateMF(balance, mf);
      const clipped = Math.min(rule.strength, mu);
      balanceOutput[mf.name] = Math.max(balanceOutput[mf.name] || 0, clipped);
    }
    
    for (const mf of outputStress.memberships) {
      const mu = evaluateMF(stress, mf);
      const clipped = Math.min(rule.strength, mu);
      stressOutput[mf.name] = Math.max(stressOutput[mf.name] || 0, clipped);
    }
  }

  const balanceScore = centroidDefuzzify(balanceOutput, outputBalance);
  const stressScore = centroidDefuzzify(stressOutput, outputStress);

  return {
    balanceScore: Math.round(balanceScore * 100) / 100,
    stressScore: Math.round(stressScore * 100) / 100,
    firedRules: firedRules.map(r => ({
      name: r.name,
      strength: Math.round(r.strength * 1000) / 1000,
      consequence: r.consequence,
    })),
  };
}

export function explainFuzzy(inputs: UserInputs): string[] {
  const result = evaluateFuzzy(inputs);
  return result.firedRules.map(rule => 
    `${rule.name} (strength: ${rule.strength.toFixed(2)}) → Balance: ${rule.consequence.balance}, Stress: ${rule.consequence.stress}`
  );
}