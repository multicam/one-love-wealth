/**
 * Parameter Optimization Module
 * 
 * Supports:
 * - Grid Search: Exhaustive search over parameter combinations
 * - Random Search: Random sampling of parameter space
 * - Genetic Algorithm: Evolutionary optimization
 */

import type { BacktestData, BacktestResult, PerformanceMetrics } from '../types';
import type { Strategy } from '../strategies/strategy';
import { BacktestEngine } from '../engine/backtest-engine';
import type {
  ParameterRange,
  ParameterSet,
  OptimizationConfig,
  OptimizationResult,
  OptimizationOutput,
  OptimizationObjective,
  StrategyFactory,
} from './types';

/**
 * Parameter Optimizer
 */
export class ParameterOptimizer {
  private readonly engine: BacktestEngine;

  constructor(initialCapital: number = 100000) {
    this.engine = new BacktestEngine({ initialCapital });
  }

  /**
   * Run parameter optimization
   */
  optimize<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    config: OptimizationConfig
  ): OptimizationOutput {
    const startTime = Date.now();
    let allResults: OptimizationResult[];

    switch (config.method) {
      case 'grid':
        allResults = this.gridSearch(strategyFactory, data, config);
        break;
      case 'random':
        allResults = this.randomSearch(strategyFactory, data, config);
        break;
      case 'genetic':
        allResults = this.geneticSearch(strategyFactory, data, config);
        break;
      default:
        throw new Error(`Unknown optimization method: ${config.method}`);
    }

    // Sort by objective value descending
    allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

    // Assign ranks
    allResults.forEach((r, i) => r.rank = i + 1);

    const topN = config.topN ?? 10;
    const topResults = allResults.slice(0, topN);
    const bestResult = allResults[0];

    if (!bestResult) {
      throw new Error('No optimization results found');
    }

    return {
      method: config.method,
      objective: config.objective,
      totalCombinations: this.calculateTotalCombinations(config.parameters),
      testedCombinations: allResults.length,
      bestResult,
      topResults,
      allResults,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Grid Search - exhaustive search over all combinations
   */
  private gridSearch<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    config: OptimizationConfig
  ): OptimizationResult[] {
    const combinations = this.generateGridCombinations(config.parameters);
    return this.evaluateCombinations(strategyFactory, data, combinations, config.objective);
  }

  /**
   * Random Search - random sampling of parameter space
   */
  private randomSearch<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    config: OptimizationConfig
  ): OptimizationResult[] {
    const iterations = config.iterations ?? 100;
    const combinations = this.generateRandomCombinations(config.parameters, iterations);
    return this.evaluateCombinations(strategyFactory, data, combinations, config.objective);
  }

  /**
   * Genetic Algorithm optimization
   */
  private geneticSearch<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    config: OptimizationConfig
  ): OptimizationResult[] {
    const populationSize = config.populationSize ?? 50;
    const iterations = config.iterations ?? 100;
    const mutationRate = config.mutationRate ?? 0.1;
    const allResults: OptimizationResult[] = [];

    // Initialize population
    let population = this.generateRandomCombinations(config.parameters, populationSize);
    let fitness = this.evaluateCombinations(strategyFactory, data, population, config.objective);
    allResults.push(...fitness);

    for (let gen = 0; gen < iterations; gen++) {
      // Selection (tournament selection)
      const parents: ParameterSet[] = [];
      for (let i = 0; i < populationSize; i++) {
        const tournament = this.selectTournament(fitness, 3);
        parents.push(tournament.params);
      }

      // Crossover and mutation
      const offspring: ParameterSet[] = [];
      for (let i = 0; i < populationSize; i += 2) {
        const parent1 = parents[i];
        const parent2 = parents[i + 1] ?? parents[0];
        if (parent1 && parent2) {
          const [child1, child2] = this.crossover(parent1, parent2, config.parameters);
          offspring.push(
            this.mutate(child1, config.parameters, mutationRate),
            this.mutate(child2, config.parameters, mutationRate)
          );
        }
      }

      // Evaluate offspring
      population = offspring.slice(0, populationSize);
      fitness = this.evaluateCombinations(strategyFactory, data, population, config.objective);
      allResults.push(...fitness);

      // Elitism: keep best from previous generation
      const bestPrev = allResults.sort((a, b) => b.objectiveValue - a.objectiveValue)[0];
      if (bestPrev && fitness[0] && bestPrev.objectiveValue > fitness[0].objectiveValue) {
        fitness[fitness.length - 1] = bestPrev;
      }
    }

    // Remove duplicates
    const uniqueResults = this.deduplicateResults(allResults);
    return uniqueResults;
  }

  /**
   * Generate all grid combinations
   */
  private generateGridCombinations(parameters: ParameterRange[]): ParameterSet[] {
    const combinations: ParameterSet[] = [{}];

    for (const param of parameters) {
      const newCombinations: ParameterSet[] = [];
      const values = this.generateRange(param.min, param.max, param.step);

      for (const combo of combinations) {
        for (const value of values) {
          newCombinations.push({ ...combo, [param.name]: value });
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    return combinations;
  }

  /**
   * Generate random combinations
   */
  private generateRandomCombinations(parameters: ParameterRange[], count: number): ParameterSet[] {
    const combinations: ParameterSet[] = [];

    for (let i = 0; i < count; i++) {
      const combo: ParameterSet = {};
      for (const param of parameters) {
        const range = param.max - param.min;
        const steps = Math.floor(range / param.step);
        const randomStep = Math.floor(Math.random() * (steps + 1));
        combo[param.name] = param.min + randomStep * param.step;
      }
      combinations.push(combo);
    }

    return combinations;
  }

  /**
   * Generate range of values
   */
  private generateRange(min: number, max: number, step: number): number[] {
    const values: number[] = [];
    for (let v = min; v <= max; v += step) {
      values.push(Math.round(v * 1000) / 1000); // Round to avoid floating point issues
    }
    return values;
  }

  /**
   * Evaluate parameter combinations
   */
  private evaluateCombinations<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    combinations: ParameterSet[],
    objective: OptimizationObjective
  ): OptimizationResult[] {
    const results: OptimizationResult[] = [];

    for (const params of combinations) {
      try {
        const strategy = strategyFactory(params as TParams);
        const result = this.engine.run(strategy, data);
        const objectiveValue = this.getObjectiveValue(result.metrics, objective);

        results.push({
          params,
          result,
          objectiveValue,
          rank: 0, // Will be assigned later
        });
      } catch {
        // Skip invalid parameter combinations
      }
    }

    return results;
  }

  /**
   * Get objective value from metrics
   */
  private getObjectiveValue(metrics: PerformanceMetrics, objective: OptimizationObjective): number {
    switch (objective) {
      case 'sharpeRatio':
        return metrics.sharpeRatio;
      case 'sortinoRatio':
        return metrics.sortinoRatio;
      case 'calmarRatio':
        return metrics.calmarRatio;
      case 'totalReturn':
        return metrics.totalReturn;
      case 'cagr':
        return metrics.cagr;
      case 'profitFactor':
        return metrics.profitFactor;
      case 'winRate':
        return metrics.winRate;
      case 'maxDrawdownPercent':
        // Negate because we want to minimize drawdown
        return -Math.abs(metrics.maxDrawdownPercent);
      default:
        return metrics.sharpeRatio;
    }
  }

  /**
   * Calculate total combinations for grid search
   */
  private calculateTotalCombinations(parameters: ParameterRange[]): number {
    let total = 1;
    for (const param of parameters) {
      const steps = Math.floor((param.max - param.min) / param.step) + 1;
      total *= steps;
    }
    return total;
  }

  /**
   * Tournament selection for genetic algorithm
   */
  private selectTournament(population: OptimizationResult[], tournamentSize: number): OptimizationResult {
    let best: OptimizationResult | null = null;
    for (let i = 0; i < tournamentSize; i++) {
      const candidate = population[Math.floor(Math.random() * population.length)];
      if (candidate && (!best || candidate.objectiveValue > best.objectiveValue)) {
        best = candidate;
      }
    }
    return best ?? population[0]!;
  }

  /**
   * Crossover for genetic algorithm
   */
  private crossover(
    parent1: ParameterSet,
    parent2: ParameterSet,
    parameters: ParameterRange[]
  ): [ParameterSet, ParameterSet] {
    const child1: ParameterSet = {};
    const child2: ParameterSet = {};

    for (const param of parameters) {
      const p1Value = parent1[param.name];
      const p2Value = parent2[param.name];
      if (p1Value !== undefined && p2Value !== undefined) {
        if (Math.random() < 0.5) {
          child1[param.name] = p1Value;
          child2[param.name] = p2Value;
        } else {
          child1[param.name] = p2Value;
          child2[param.name] = p1Value;
        }
      }
    }

    return [child1, child2];
  }

  /**
   * Mutation for genetic algorithm
   */
  private mutate(
    individual: ParameterSet,
    parameters: ParameterRange[],
    mutationRate: number
  ): ParameterSet {
    const mutated = { ...individual };

    for (const param of parameters) {
      if (Math.random() < mutationRate) {
        const range = param.max - param.min;
        const steps = Math.floor(range / param.step);
        const randomStep = Math.floor(Math.random() * (steps + 1));
        mutated[param.name] = param.min + randomStep * param.step;
      }
    }

    return mutated;
  }

  /**
   * Remove duplicate results based on parameters
   */
  private deduplicateResults(results: OptimizationResult[]): OptimizationResult[] {
    const seen = new Set<string>();
    const unique: OptimizationResult[] = [];

    for (const result of results) {
      const key = JSON.stringify(result.params);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique;
  }
}

/**
 * Convenience function for quick optimization
 */
export function optimizeStrategy<TParams extends ParameterSet>(
  strategyFactory: StrategyFactory<TParams>,
  data: BacktestData,
  config: OptimizationConfig,
  initialCapital: number = 100000
): OptimizationOutput {
  const optimizer = new ParameterOptimizer(initialCapital);
  return optimizer.optimize(strategyFactory, data, config);
}
