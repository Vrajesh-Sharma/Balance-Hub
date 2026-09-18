import { 
  Chromosome, 
  GAConfig, 
  FitnessWeights, 
  UserInputs, 
  UserPreferences,
  OptimizedSchedule,
  ConstraintViolation 
} from '../../types';
import { calculateFitness, createTemplateChromosome, createRandomChromosome, createCurrentScheduleChromosome, decodeChromosome } from './chromosome';
import { tournamentSelection, twoPointCrossover, mutate, elitism, blockSwapMutation } from './operators';

const DEFAULT_CONFIG: GAConfig = {
  populationSize: 100,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  elitismRate: 0.05,
  tournamentSize: 3,
  stagnationLimit: 20,
};

const DEFAULT_WEIGHTS: FitnessWeights = {
  wBalance: 0.35,
  wProductivity: 0.25,
  wStress: 0.25,
  wConstraints: 0.15,
};

export interface GARuntimeConfig {
  config?: Partial<GAConfig>;
  weights?: Partial<FitnessWeights>;
  onGeneration?: (gen: number, bestFitness: number, avgFitness: number) => void;
  onComplete?: (best: Chromosome, convergence: number[]) => void;
}

export async function runGeneticAlgorithm(
  inputs: UserInputs,
  prefs: UserPreferences,
  runtimeConfig: GARuntimeConfig = {}
): Promise<OptimizedSchedule> {
  const config: GAConfig = { ...DEFAULT_CONFIG, ...runtimeConfig.config };
  const weights: FitnessWeights = { ...DEFAULT_WEIGHTS, ...runtimeConfig.weights };
  
  let population = generateInitialPopulation(config.populationSize, inputs, prefs);
  
  const convergence: number[] = [];
  let bestOverall: Chromosome | null = null;
  let stagnationCount = 0;
  let lastBestFitness = -Infinity;
  
  for (let gen = 0; gen < config.generations; gen++) {
    population = population.map(chromosome => {
      const result = calculateFitness(chromosome, inputs, prefs, weights);
      return { ...chromosome, fitness: result.fitness, violations: result.violations };
    });
    
    population.sort((a, b) => b.fitness - a.fitness);
    
    const bestFitness = population[0].fitness;
    const avgFitness = population.reduce((sum, c) => sum + c.fitness, 0) / population.length;
    convergence.push(bestFitness);
    
    if (runtimeConfig.onGeneration) {
      runtimeConfig.onGeneration(gen, bestFitness, avgFitness);
    }
    
    if (bestFitness > lastBestFitness + 0.1) {
      lastBestFitness = bestFitness;
      stagnationCount = 0;
      bestOverall = { ...population[0] };
    } else {
      stagnationCount++;
    }
    
    if (stagnationCount >= config.stagnationLimit) {
      break;
    }
    
    const elites = elitism(population, config.elitismRate);
    const newPopulation: Chromosome[] = [...elites];
    
    while (newPopulation.length < config.populationSize) {
      const parent1 = tournamentSelection(population, config.tournamentSize);
      const parent2 = tournamentSelection(population, config.tournamentSize);
      
      let child1: Chromosome, child2: Chromosome;
      
      if (Math.random() < config.crossoverRate) {
        [child1, child2] = twoPointCrossover(parent1, parent2);
      } else {
        child1 = { ...parent1, genes: [...parent1.genes] };
        child2 = { ...parent2, genes: [...parent2.genes] };
      }
      
      if (Math.random() < config.mutationRate) {
        child1 = mutate(child1, config.mutationRate, prefs);
      }
      if (Math.random() < config.mutationRate) {
        child2 = mutate(child2, config.mutationRate, prefs);
      }
      
      if (Math.random() < 0.1) {
        child1 = blockSwapMutation(child1);
      }
      if (Math.random() < 0.1) {
        child2 = blockSwapMutation(child2);
      }
      
      newPopulation.push(child1);
      if (newPopulation.length < config.populationSize) {
        newPopulation.push(child2);
      }
    }
    
    population = newPopulation.slice(0, config.populationSize);
  }
  
  if (!bestOverall) {
    population.sort((a, b) => b.fitness - a.fitness);
    bestOverall = population[0];
  }
  
  const finalResult = calculateFitness(bestOverall, inputs, prefs, weights);
  const slots = decodeChromosome(bestOverall);
  
  const result: OptimizedSchedule = {
    slots,
    fitness: finalResult.fitness,
    balanceScore: finalResult.balanceScore,
    productivityScore: finalResult.productivityScore,
    stressScore: finalResult.stressScore,
    violations: finalResult.violations,
    convergence,
    firedRules: finalResult.firedRules || [],
  };
  
  if (runtimeConfig.onComplete) {
    runtimeConfig.onComplete(bestOverall, convergence);
  }
  
  return result;
}

function generateInitialPopulation(
  size: number,
  inputs: UserInputs,
  prefs: UserPreferences
): Chromosome[] {
  const population: Chromosome[] = [];
  const templates = ['Morning Routine', 'Focus Day', 'Balanced Day'];
  const templateCount = Math.floor(size * 0.4);
  const currentCount = Math.floor(size * 0.3);
  const randomCount = size - templateCount - currentCount;
  
  for (let i = 0; i < templateCount; i++) {
    population.push(createTemplateChromosome(templates[i % templates.length], prefs));
  }
  
  for (let i = 0; i < currentCount; i++) {
    population.push(createRandomChromosome(inputs, prefs));
  }
  
  for (let i = 0; i < randomCount; i++) {
    population.push(createRandomChromosome(inputs, prefs));
  }
  
  return population;
}

export async function runBaselineComparisons(
  inputs: UserInputs,
  prefs: UserPreferences,
  currentSchedule: any[],
  weights: FitnessWeights = DEFAULT_WEIGHTS
): Promise<Array<{ name: string; schedule: any; fitness: number; balanceScore: number; productivityScore: number; stressScore: number; violations: ConstraintViolation[] }>> {
  const results = [];
  
  const gaResult = await runGeneticAlgorithm(inputs, prefs, { config: { generations: 50, populationSize: 50 } });
  results.push({
    name: 'Genetic Algorithm',
    schedule: gaResult.slots,
    fitness: gaResult.fitness,
    balanceScore: gaResult.balanceScore,
    productivityScore: gaResult.productivityScore,
    stressScore: gaResult.stressScore,
    violations: gaResult.violations,
  });
  
  const templates = ['Morning Routine', 'Focus Day', 'Balanced Day'];
  for (const template of templates) {
    const chrom = createTemplateChromosome(template, prefs);
    const fitness = calculateFitness(chrom, inputs, prefs, weights);
    results.push({
      name: `Template: ${template}`,
      schedule: decodeChromosome(chrom),
      fitness: fitness.fitness,
      balanceScore: fitness.balanceScore,
      productivityScore: fitness.productivityScore,
      stressScore: fitness.stressScore,
      violations: fitness.violations,
    });
  }
  
  if (currentSchedule.length > 0) {
    const chrom = createCurrentScheduleChromosome(currentSchedule, prefs);
    const fitness = calculateFitness(chrom, inputs, prefs, weights);
    results.push({
      name: 'Current Manual',
      schedule: decodeChromosome(chrom),
      fitness: fitness.fitness,
      balanceScore: fitness.balanceScore,
      productivityScore: fitness.productivityScore,
      stressScore: fitness.stressScore,
      violations: fitness.violations,
    });
  }
  
  const greedyChrom = createGreedySchedule(inputs, prefs);
  const greedyFitness = calculateFitness(greedyChrom, inputs, prefs, weights);
  results.push({
    name: 'Greedy Heuristic',
    schedule: decodeChromosome(greedyChrom),
    fitness: greedyFitness.fitness,
    balanceScore: greedyFitness.balanceScore,
    productivityScore: greedyFitness.productivityScore,
    stressScore: greedyFitness.stressScore,
    violations: greedyFitness.violations,
  });
  
  return results.sort((a, b) => b.fitness - a.fitness);
}

function createGreedySchedule(inputs: UserInputs, prefs: UserPreferences): Chromosome {
  const genes: any[] = Array(48).fill('personal');
  const SLOTS_PER_DAY = 48;
  
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    const hour = i * 0.5;
    if (isFixedMeeting(hour, prefs.fixedMeetings)) {
      genes[i] = 'meeting';
    }
  }
  
  const sleepStart = 22 * 2;
  const sleepEnd = 7 * 2;
  for (let i = sleepStart; i < SLOTS_PER_DAY; i++) genes[i] = 'sleep';
  for (let i = 0; i < sleepEnd; i++) genes[i] = 'sleep';
  
  const workStart = Math.round(prefs.preferredWorkStart * 2);
  const workEnd = Math.round(prefs.preferredWorkEnd * 2);
  for (let i = workStart; i < workEnd && i < SLOTS_PER_DAY; i++) {
    if (genes[i] === 'personal') genes[i] = 'work';
  }
  
  const exerciseSlots = [14, 15];
  for (const slot of exerciseSlots) {
    if (slot < SLOTS_PER_DAY && genes[slot] === 'personal') genes[slot] = 'exercise';
  }
  
  return { genes, fitness: 0, violations: [] };
}

function isFixedMeeting(hour: number, meetings: Array<{start: number, end: number}>): boolean {
  return meetings.some(m => hour >= m.start && hour < m.end);
}

export { DEFAULT_CONFIG, DEFAULT_WEIGHTS };