import { Chromosome, GAConfig, ActivityType } from '../../types';
import { createTemplateChromosome, createRandomChromosome } from './chromosome';

export function tournamentSelection(
  population: Chromosome[], 
  tournamentSize: number
): Chromosome {
  const tournament: Chromosome[] = [];
  for (let i = 0; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    tournament.push(population[idx]);
  }
  return tournament.reduce((best, current) => 
    current.fitness > best.fitness ? current : best
  );
}

export function twoPointCrossover(parent1: Chromosome, parent2: Chromosome): [Chromosome, Chromosome] {
  const length = parent1.genes.length;
  const point1 = Math.floor(Math.random() * (length - 2)) + 1;
  const point2 = Math.floor(Math.random() * (length - point1 - 1)) + point1 + 1;
  
  const child1Genes = [
    ...parent1.genes.slice(0, point1),
    ...parent2.genes.slice(point1, point2),
    ...parent1.genes.slice(point2),
  ];
  
  const child2Genes = [
    ...parent2.genes.slice(0, point1),
    ...parent1.genes.slice(point1, point2),
    ...parent2.genes.slice(point2),
  ];
  
  return [
    { genes: child1Genes, fitness: 0, violations: [] },
    { genes: child2Genes, fitness: 0, violations: [] },
  ];
}

export function uniformCrossover(parent1: Chromosome, parent2: Chromosome, rate = 0.5): [Chromosome, Chromosome] {
  const length = parent1.genes.length;
  const child1Genes: ActivityType[] = [];
  const child2Genes: ActivityType[] = [];
  
  for (let i = 0; i < length; i++) {
    if (Math.random() < rate) {
      child1Genes.push(parent1.genes[i]);
      child2Genes.push(parent2.genes[i]);
    } else {
      child1Genes.push(parent2.genes[i]);
      child2Genes.push(parent1.genes[i]);
    }
  }
  
  return [
    { genes: child1Genes, fitness: 0, violations: [] },
    { genes: child2Genes, fitness: 0, violations: [] },
  ];
}

export function mutate(chromosome: Chromosome, mutationRate: number, prefs?: { fixedMeetings: Array<{start: number, end: number}> }): Chromosome {
  const genes = [...chromosome.genes];
  const SLOTS_PER_DAY = 48;
  
  for (let i = 0; i < SLOTS_PER_DAY; i++) {
    if (Math.random() < mutationRate) {
      const hour = i * 0.5;
      const isFixed = prefs?.fixedMeetings.some(m => hour >= m.start && hour < m.end);
      if (!isFixed) {
        genes[i] = getRandomActivityForHour(hour);
      }
    }
  }
  
  if (Math.random() < mutationRate * 0.5) {
    const blockSize = Math.floor(Math.random() * 4) + 2;
    const start = Math.floor(Math.random() * (SLOTS_PER_DAY - blockSize));
    const newActivity = getRandomActivityForHour(start * 0.5);
    for (let i = start; i < start + blockSize; i++) {
      const hour = i * 0.5;
      const isFixed = prefs?.fixedMeetings.some(m => hour >= m.start && hour < m.end);
      if (!isFixed) {
        genes[i] = newActivity;
      }
    }
  }
  
  return { genes, fitness: 0, violations: [] };
}

function getRandomActivityForHour(hour: number): ActivityType {
  if (hour >= 22 || hour < 7) return 'sleep';
  if (hour >= 7 && hour < 9) return Math.random() < 0.5 ? 'exercise' : 'personal';
  if (hour >= 9 && hour < 18) return Math.random() < 0.7 ? 'work' : 'break';
  if (hour >= 18 && hour < 22) return Math.random() < 0.6 ? 'personal' : 'hobby';
  return 'personal';
}

export function swapMutation(chromosome: Chromosome): Chromosome {
  const genes = [...chromosome.genes];
  const SLOTS_PER_DAY = 48;
  
  const idx1 = Math.floor(Math.random() * SLOTS_PER_DAY);
  let idx2 = Math.floor(Math.random() * SLOTS_PER_DAY);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * SLOTS_PER_DAY);
  }
  
  [genes[idx1], genes[idx2]] = [genes[idx2], genes[idx1]];
  
  return { genes, fitness: 0, violations: [] };
}

export function blockSwapMutation(chromosome: Chromosome): Chromosome {
  const genes = [...chromosome.genes];
  const SLOTS_PER_DAY = 48;
  
  const blockSize = Math.floor(Math.random() * 4) + 2;
  const idx1 = Math.floor(Math.random() * (SLOTS_PER_DAY - blockSize));
  let idx2 = Math.floor(Math.random() * (SLOTS_PER_DAY - blockSize));
  while (Math.abs(idx2 - idx1) < blockSize) {
    idx2 = Math.floor(Math.random() * (SLOTS_PER_DAY - blockSize));
  }
  
  const block1 = genes.slice(idx1, idx1 + blockSize);
  const block2 = genes.slice(idx2, idx2 + blockSize);
  
  genes.splice(idx1, blockSize, ...block2);
  genes.splice(idx2, blockSize, ...block1);
  
  return { genes, fitness: 0, violations: [] };
}

export function elitism(population: Chromosome[], elitismRate: number): Chromosome[] {
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const eliteCount = Math.max(1, Math.floor(population.length * elitismRate));
  return sorted.slice(0, eliteCount);
}

export function generateInitialPopulation(
  size: number,
  inputs: any,
  prefs: any,
  templateRatio = 0.4,
  currentRatio = 0.3
): Chromosome[] {
  const population: Chromosome[] = [];
  const templateCount = Math.floor(size * templateRatio);
  const currentCount = Math.floor(size * currentRatio);
  const randomCount = size - templateCount - currentCount;
  
  const templates = ['Morning Routine', 'Focus Day', 'Balanced Day'];
  
  for (let i = 0; i < templateCount; i++) {
    const template = templates[i % templates.length];
    population.push(createTemplateChromosome(template, prefs));
  }
  
  for (let i = 0; i < currentCount; i++) {
    population.push(createRandomChromosome(inputs, prefs));
  }
  
  for (let i = 0; i < randomCount; i++) {
    population.push(createRandomChromosome(inputs, prefs));
  }
  
  return population;
}