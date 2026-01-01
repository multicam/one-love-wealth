/**
 * Backtesting Testing Framework
 * 
 * Comprehensive tools for validating trading strategies:
 * - Parameter Optimization (grid, random, genetic)
 * - Walk-Forward Analysis
 * - Monte Carlo Simulation
 * - Benchmark Comparison
 * - Strategy Validation
 * - Report Generation
 */

// Types
export type {
  ParameterRange,
  ParameterSet,
  OptimizationMethod,
  OptimizationObjective,
  OptimizationConfig,
  OptimizationResult,
  OptimizationOutput,
  WalkForwardConfig,
  WalkForwardWindow,
  WalkForwardWindowResult,
  WalkForwardOutput,
  MonteCarloConfig,
  MonteCarloOutput,
  MonteCarloSimulation,
  MonteCarloStatistics,
  DistributionStats,
  BenchmarkDefinition,
  BenchmarkComparison,
  ValidationConfig,
  ValidationOutput,
  CrossValidationOutput,
  ValidationScore,
  ReportConfig,
  StrategyFactory,
} from './types';

// Optimizer
export { ParameterOptimizer, optimizeStrategy } from './optimizer';

// Walk-Forward
export { 
  WalkForwardAnalyzer, 
  walkForwardAnalysis,
  walkForwardWithOptimization,
} from './walk-forward';

// Monte Carlo
export { MonteCarloSimulator, monteCarloSimulation } from './monte-carlo';

// Benchmarks
export { 
  BenchmarkComparer, 
  compareToBenchmarks,
  DEFAULT_BENCHMARKS,
} from './benchmarks';

// Validation
export { 
  StrategyValidator, 
  validateStrategy,
  quickValidate,
} from './validation';

// Report Generation
export { 
  ReportGenerator, 
  generateReport,
  generateBacktestReport,
  generateOptimizationReport,
} from './report-generator';
