/**
 * Types for the backtesting testing framework
 */

import type { BacktestResult, BacktestData, PerformanceMetrics, BacktestConfig } from '../types';
import type { Strategy } from '../strategies/strategy';

/**
 * Parameter range definition for optimization
 */
export interface ParameterRange {
  name: string;
  min: number;
  max: number;
  step: number;
}

/**
 * Parameter set with named values
 */
export type ParameterSet = Record<string, number | string | boolean>;

/**
 * Optimization method type
 */
export type OptimizationMethod = 'grid' | 'random' | 'genetic';

/**
 * Metric to optimize for
 */
export type OptimizationObjective = 
  | 'sharpeRatio'
  | 'sortinoRatio'
  | 'calmarRatio'
  | 'totalReturn'
  | 'cagr'
  | 'profitFactor'
  | 'winRate'
  | 'maxDrawdownPercent'; // Note: will be negated for minimization

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Method for optimization */
  method: OptimizationMethod;
  /** Objective metric to maximize */
  objective: OptimizationObjective;
  /** Parameter ranges to search */
  parameters: ParameterRange[];
  /** Number of iterations for random/genetic (default: 100) */
  iterations?: number;
  /** Population size for genetic algorithm (default: 50) */
  populationSize?: number;
  /** Mutation rate for genetic algorithm (default: 0.1) */
  mutationRate?: number;
  /** Number of top results to return (default: 10) */
  topN?: number;
}

/**
 * Single optimization result
 */
export interface OptimizationResult {
  params: ParameterSet;
  result: BacktestResult;
  objectiveValue: number;
  rank: number;
}

/**
 * Full optimization output
 */
export interface OptimizationOutput {
  method: OptimizationMethod;
  objective: OptimizationObjective;
  totalCombinations: number;
  testedCombinations: number;
  bestResult: OptimizationResult;
  topResults: OptimizationResult[];
  allResults: OptimizationResult[];
  duration: number; // milliseconds
}

/**
 * Walk-forward window
 */
export interface WalkForwardWindow {
  inSampleStart: Date;
  inSampleEnd: Date;
  outOfSampleStart: Date;
  outOfSampleEnd: Date;
  windowIndex: number;
}

/**
 * Walk-forward configuration
 */
export interface WalkForwardConfig {
  /** Number of walk-forward windows */
  numWindows: number;
  /** Ratio of in-sample to total window (e.g., 0.7 = 70% in-sample) */
  inSampleRatio: number;
  /** Whether to optimize on each in-sample period */
  optimizePerWindow: boolean;
  /** Optimization config if optimizing per window */
  optimizationConfig?: OptimizationConfig;
  /** Whether windows should overlap */
  anchored?: boolean; // If true, all windows start from same date
}

/**
 * Walk-forward window result
 */
export interface WalkForwardWindowResult {
  window: WalkForwardWindow;
  inSampleResult: BacktestResult;
  outOfSampleResult: BacktestResult;
  optimizedParams?: ParameterSet;
  degradation: number; // (inSample - outOfSample) / inSample
}

/**
 * Walk-forward analysis output
 */
export interface WalkForwardOutput {
  config: WalkForwardConfig;
  windows: WalkForwardWindowResult[];
  aggregatedMetrics: {
    avgInSampleReturn: number;
    avgOutOfSampleReturn: number;
    avgDegradation: number;
    consistencyRatio: number; // % of windows where OOS > 0
    robustnessScore: number; // 0-100 score
  };
  combinedOutOfSample: BacktestResult; // All OOS periods combined
}

/**
 * Monte Carlo simulation configuration
 */
export interface MonteCarloConfig {
  /** Number of simulations to run */
  numSimulations: number;
  /** Method for generating simulations */
  method: 'trade-shuffle' | 'bootstrap-returns' | 'random-entry';
  /** Confidence level for statistics (default: 0.95) */
  confidenceLevel?: number;
  /** Random seed for reproducibility */
  seed?: number;
}

/**
 * Monte Carlo simulation output
 */
export interface MonteCarloOutput {
  config: MonteCarloConfig;
  originalResult: BacktestResult;
  simulations: MonteCarloSimulation[];
  statistics: MonteCarloStatistics;
}

/**
 * Single Monte Carlo simulation result
 */
export interface MonteCarloSimulation {
  simulationIndex: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalEquity: number;
}

/**
 * Monte Carlo statistics
 */
export interface MonteCarloStatistics {
  returnDistribution: DistributionStats;
  drawdownDistribution: DistributionStats;
  sharpeDistribution: DistributionStats;
  probabilityOfProfit: number;
  probabilityOfBetterThanOriginal: number;
  valueAtRisk: number; // VaR at confidence level
  conditionalVaR: number; // Expected shortfall
  confidenceLevel: number;
}

/**
 * Distribution statistics
 */
export interface DistributionStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile5: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
}

/**
 * Benchmark definition
 */
export interface BenchmarkDefinition {
  name: string;
  symbol?: string;
  strategy?: Strategy;
  description?: string;
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparison {
  benchmark: BenchmarkDefinition;
  benchmarkResult: BacktestResult;
  strategyResult: BacktestResult;
  comparison: {
    excessReturn: number;
    alpha: number;
    beta: number;
    correlation: number;
    trackingError: number;
    informationRatio: number;
    upCapture: number;
    downCapture: number;
    winVsBenchmark: number; // % of periods outperforming
  };
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Split ratio for train/test (e.g., 0.7 = 70% train) */
  trainTestSplit?: number;
  /** Number of folds for cross-validation */
  numFolds?: number;
  /** Whether to run walk-forward validation */
  walkForward?: WalkForwardConfig;
  /** Whether to run Monte Carlo validation */
  monteCarlo?: MonteCarloConfig;
  /** Benchmarks to compare against */
  benchmarks?: BenchmarkDefinition[];
}

/**
 * Strategy validation output
 */
export interface ValidationOutput {
  strategyName: string;
  config: ValidationConfig;
  trainResult?: BacktestResult;
  testResult?: BacktestResult;
  crossValidation?: CrossValidationOutput;
  walkForward?: WalkForwardOutput;
  monteCarlo?: MonteCarloOutput;
  benchmarkComparisons?: BenchmarkComparison[];
  overallScore: ValidationScore;
}

/**
 * Cross-validation output
 */
export interface CrossValidationOutput {
  numFolds: number;
  foldResults: BacktestResult[];
  averageMetrics: PerformanceMetrics;
  stdDevMetrics: Partial<PerformanceMetrics>;
  consistencyScore: number;
}

/**
 * Overall validation score
 */
export interface ValidationScore {
  /** Overall score 0-100 */
  overall: number;
  /** Component scores */
  components: {
    profitability: number;
    riskAdjusted: number;
    consistency: number;
    robustness: number;
    degradation: number;
  };
  /** Pass/fail flags */
  flags: {
    profitable: boolean;
    positiveSharpe: boolean;
    consistentReturns: boolean;
    lowDegradation: boolean;
    passedMonteCarlo: boolean;
  };
  /** Recommendation */
  recommendation: 'strong-pass' | 'pass' | 'marginal' | 'fail';
}

/**
 * Test report configuration
 */
export interface ReportConfig {
  /** Report title */
  title: string;
  /** Include equity curve data */
  includeEquityCurve?: boolean;
  /** Include trade list */
  includeTrades?: boolean;
  /** Include Monte Carlo simulations */
  includeMonteCarloDetails?: boolean;
  /** Output format */
  format: 'json' | 'markdown' | 'html';
}

/**
 * Strategy factory function type
 */
export type StrategyFactory<TParams extends ParameterSet = ParameterSet> = 
  (params: TParams) => Strategy;
