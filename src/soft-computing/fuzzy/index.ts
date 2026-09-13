export * from './membership';
export * from './rules';
export * from './inference';
import { evaluateFuzzy, explainFuzzy } from './inference';
import { UserInputs, FuzzyOutput } from '../../types';

export { evaluateFuzzy as evaluateBalance, explainFuzzy };
export type { UserInputs, FuzzyOutput };