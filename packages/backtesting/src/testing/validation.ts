/**
 * Strategy Validation Framework
 * 
 * Comprehensive validation suite for trading strategies:
 * - Train/Test Split
 * - Cross-Validation
 * - Walk-Forward Analysis
 * - Monte Carlo Simulation
 * - Benchmark Comparison
 * - Overall Scoring
 */

import type { BacktestData, BacktestResult, PerformanceMetrics } from '../types';
import type { Strategy } from '../strategies/strategy';
import { BacktestEngine } from '../engine/backtest-engine';
import { WalkForwardAnalyzer } from './walk-forward';
import { MonteCarloSimulator } from './monte-carlo';
import { BenchmarkComparer, DEFAULT_BENCHMARKS } from './benchmarks';
import type {
  ValidationConfig,
  ValidationOutput,
  CrossValidationOutput,
  ValidationScore,
  StrategyFactory,
  ParameterSet,
} from './types';

/**
 * Strategy Validator
 */
export class StrategyValidator {
  private readonly engine: BacktestEngine;
  private readonly walkForwardAnalyzer: WalkForwardAnalyzer;
  private readonly monteCarloSimulator: MonteCarloSimulator;
  private readonly benchmarkComparer: BenchmarkComparer;
  private readonly initialCapital: number;

  constructor(initialCapital: number = 100000) {
    this.initialCapital = initialCapital;
    this.engine = new BacktestEngine({ initialCapital });
    this.walkForwardAnalyzer = new WalkForwardAnalyzer(initialCapital);
    this.monteCarloSimulator = new MonteCarloSimulator(initialCapital);
    this.benchmarkComparer = new BenchmarkComparer(initialCapital);
  }

  /**
   * Run full validation suite
   */
  validate(
    strategy: Strategy,
    data: BacktestData,
    config: ValidationConfig
  ): ValidationOutput {
    const output: ValidationOutput = {
      strategyName: strategy.name,
      config,
      overallScore: { overall: 0, components: { profitability: 0, riskAdjusted: 0, consistency: 0, robustness: 0, degradation: 0 }, flags: { profitable: false, positiveSharpe: false, consistentReturns: false, lowDegradation: false, passedMonteCarlo: false }, recommendation: 'fail' },
    };

    // Train/Test Split
    if (config.trainTestSplit) {
      const { train, test } = this.splitData(data, config.trainTestSplit);
      
      strategy.init?.();
      output.trainResult = this.engine.run(strategy, train);
      
      strategy.init?.();
      output.testResult = this.engine.run(strategy, test);
    }

    // Cross-Validation
    if (config.numFolds && config.numFolds > 1) {
      output.crossValidation = this.crossValidate(strategy, data, config.numFolds);
    }

    // Walk-Forward Analysis
    if (config.walkForward) {
      output.walkForward = this.walkForwardAnalyzer.analyze(strategy, data, config.walkForward);
    }

    // Run full backtest for Monte Carlo and benchmarks
    strategy.init?.();
    const fullResult = this.engine.run(strategy, data);

    // Monte Carlo Simulation
    if (config.monteCarlo) {
      output.monteCarlo = this.monteCarloSimulator.simulate(fullResult, config.monteCarlo);
    }

    // Benchmark Comparisons - only include benchmarks with available data
    const benchmarks = config.benchmarks ?? DEFAULT_BENCHMARKS;
    const availableBenchmarks = benchmarks.filter(b => {
      // If benchmark has no symbol, it uses first symbol in data (always available)
      if (!b.symbol) return true;
      // If benchmark has a symbol, check if it's in the data
      return data.symbols.includes(b.symbol);
    });
    
    if (availableBenchmarks.length > 0) {
      output.benchmarkComparisons = this.benchmarkComparer.compare(fullResult, data, availableBenchmarks);
    }

    // Calculate overall score
    output.overallScore = this.calculateScore(output);

    return output;
  }

  /**
   * Split data into train and test sets
   */
  private splitData(
    data: BacktestData,
    trainRatio: number
  ): { train: BacktestData; test: BacktestData } {
    const splitIndex = Math.floor(data.bars.length * trainRatio);
    const trainBars = data.bars.slice(0, splitIndex);
    const testBars = data.bars.slice(splitIndex);

    const firstTrainBar = trainBars[0];
    const lastTrainBar = trainBars[trainBars.length - 1];
    const firstTestBar = testBars[0];
    const lastTestBar = testBars[testBars.length - 1];

    return {
      train: {
        symbols: data.symbols,
        bars: trainBars,
        startDate: firstTrainBar ? new Date(firstTrainBar.time) : data.startDate,
        endDate: lastTrainBar ? new Date(lastTrainBar.time) : data.endDate,
      },
      test: {
        symbols: data.symbols,
        bars: testBars,
        startDate: firstTestBar ? new Date(firstTestBar.time) : data.startDate,
        endDate: lastTestBar ? new Date(lastTestBar.time) : data.endDate,
      },
    };
  }

  /**
   * K-fold cross-validation
   */
  private crossValidate(
    strategy: Strategy,
    data: BacktestData,
    numFolds: number
  ): CrossValidationOutput {
    const foldSize = Math.floor(data.bars.length / numFolds);
    const foldResults: BacktestResult[] = [];

    for (let i = 0; i < numFolds; i++) {
      // Create test fold
      const testStart = i * foldSize;
      const testEnd = (i === numFolds - 1) ? data.bars.length : (i + 1) * foldSize;
      
      const testBars = data.bars.slice(testStart, testEnd);
      const firstTestBar = testBars[0];
      const lastTestBar = testBars[testBars.length - 1];

      if (!firstTestBar || !lastTestBar) continue;

      const testData: BacktestData = {
        symbols: data.symbols,
        bars: testBars,
        startDate: new Date(firstTestBar.time),
        endDate: new Date(lastTestBar.time),
      };

      strategy.init?.();
      const result = this.engine.run(strategy, testData);
      foldResults.push(result);
    }

    // Calculate average metrics
    const averageMetrics = this.averageMetrics(foldResults.map(r => r.metrics));
    const stdDevMetrics = this.stdDevMetrics(foldResults.map(r => r.metrics));

    // Consistency score (0-100) based on how consistent returns are across folds
    const returns = foldResults.map(r => r.metrics.totalReturn);
    const positiveReturns = returns.filter(r => r > 0).length;
    const consistencyScore = (positiveReturns / returns.length) * 100;

    return {
      numFolds,
      foldResults,
      averageMetrics,
      stdDevMetrics,
      consistencyScore,
    };
  }

  /**
   * Calculate average of metrics across results
   */
  private averageMetrics(metricsList: PerformanceMetrics[]): PerformanceMetrics {
    const n = metricsList.length;
    if (n === 0) {
      return this.emptyMetrics();
    }

    const sum = metricsList.reduce((acc, m) => {
      return {
        totalReturn: acc.totalReturn + m.totalReturn,
        totalReturnPercent: acc.totalReturnPercent + m.totalReturnPercent,
        cagr: acc.cagr + m.cagr,
        maxDrawdown: acc.maxDrawdown + m.maxDrawdown,
        maxDrawdownPercent: acc.maxDrawdownPercent + m.maxDrawdownPercent,
        maxDrawdownDuration: acc.maxDrawdownDuration + m.maxDrawdownDuration,
        volatility: acc.volatility + m.volatility,
        sharpeRatio: acc.sharpeRatio + m.sharpeRatio,
        sortinoRatio: acc.sortinoRatio + m.sortinoRatio,
        calmarRatio: acc.calmarRatio + m.calmarRatio,
        tradingDays: acc.tradingDays + m.tradingDays,
        yearsTraded: acc.yearsTraded + m.yearsTraded,
        exposurePercent: acc.exposurePercent + m.exposurePercent,
        totalTrades: acc.totalTrades + m.totalTrades,
        winningTrades: acc.winningTrades + m.winningTrades,
        losingTrades: acc.losingTrades + m.losingTrades,
        winRate: acc.winRate + m.winRate,
        profitFactor: acc.profitFactor + m.profitFactor,
        averageWin: acc.averageWin + m.averageWin,
        averageLoss: acc.averageLoss + m.averageLoss,
        averageTrade: acc.averageTrade + m.averageTrade,
        largestWin: acc.largestWin + m.largestWin,
        largestLoss: acc.largestLoss + m.largestLoss,
      };
    }, this.emptyMetrics());

    return {
      totalReturn: sum.totalReturn / n,
      totalReturnPercent: sum.totalReturnPercent / n,
      cagr: sum.cagr / n,
      maxDrawdown: sum.maxDrawdown / n,
      maxDrawdownPercent: sum.maxDrawdownPercent / n,
      maxDrawdownDuration: sum.maxDrawdownDuration / n,
      volatility: sum.volatility / n,
      sharpeRatio: sum.sharpeRatio / n,
      sortinoRatio: sum.sortinoRatio / n,
      calmarRatio: sum.calmarRatio / n,
      tradingDays: sum.tradingDays / n,
      yearsTraded: sum.yearsTraded / n,
      exposurePercent: sum.exposurePercent / n,
      totalTrades: sum.totalTrades / n,
      winningTrades: sum.winningTrades / n,
      losingTrades: sum.losingTrades / n,
      winRate: sum.winRate / n,
      profitFactor: sum.profitFactor / n,
      averageWin: sum.averageWin / n,
      averageLoss: sum.averageLoss / n,
      averageTrade: sum.averageTrade / n,
      largestWin: sum.largestWin / n,
      largestLoss: sum.largestLoss / n,
    };
  }

  /**
   * Calculate standard deviation of key metrics
   */
  private stdDevMetrics(metricsList: PerformanceMetrics[]): Partial<PerformanceMetrics> {
    const n = metricsList.length;
    if (n < 2) return {};

    const avg = this.averageMetrics(metricsList);
    
    const stdDev = (values: number[], mean: number) => {
      const variance = values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / (n - 1);
      return Math.sqrt(variance);
    };

    return {
      totalReturn: stdDev(metricsList.map(m => m.totalReturn), avg.totalReturn),
      sharpeRatio: stdDev(metricsList.map(m => m.sharpeRatio), avg.sharpeRatio),
      maxDrawdownPercent: stdDev(metricsList.map(m => m.maxDrawdownPercent), avg.maxDrawdownPercent),
      winRate: stdDev(metricsList.map(m => m.winRate), avg.winRate),
    };
  }

  /**
   * Create empty metrics object
   */
  private emptyMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      cagr: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      maxDrawdownDuration: 0,
      volatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      tradingDays: 0,
      yearsTraded: 0,
      exposurePercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      averageTrade: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateScore(output: ValidationOutput): ValidationScore {
    const components = {
      profitability: 0,
      riskAdjusted: 0,
      consistency: 0,
      robustness: 0,
      degradation: 0,
    };

    const flags = {
      profitable: false,
      positiveSharpe: false,
      consistentReturns: false,
      lowDegradation: false,
      passedMonteCarlo: false,
    };

    // Profitability (0-25 points)
    const testReturn = output.testResult?.metrics.totalReturn ?? 
                       output.crossValidation?.averageMetrics.totalReturn ?? 0;
    flags.profitable = testReturn > 0;
    components.profitability = Math.min(25, Math.max(0, testReturn * 100));

    // Risk-Adjusted (0-25 points)
    const sharpe = output.testResult?.metrics.sharpeRatio ?? 
                   output.crossValidation?.averageMetrics.sharpeRatio ?? 0;
    flags.positiveSharpe = sharpe > 0;
    components.riskAdjusted = Math.min(25, Math.max(0, sharpe * 12.5)); // Sharpe of 2 = 25 points

    // Consistency (0-25 points)
    if (output.crossValidation) {
      components.consistency = output.crossValidation.consistencyScore / 4; // Scale to 25
      flags.consistentReturns = output.crossValidation.consistencyScore > 60;
    } else if (output.walkForward) {
      components.consistency = output.walkForward.aggregatedMetrics.consistencyRatio * 25;
      flags.consistentReturns = output.walkForward.aggregatedMetrics.consistencyRatio > 0.6;
    }

    // Robustness (0-15 points)
    if (output.walkForward) {
      components.robustness = output.walkForward.aggregatedMetrics.robustnessScore / 100 * 15;
    }

    // Degradation (0-10 points) - lower is better
    if (output.walkForward) {
      const degradation = Math.abs(output.walkForward.aggregatedMetrics.avgDegradation);
      flags.lowDegradation = degradation < 0.3; // Less than 30% degradation
      components.degradation = Math.max(0, 10 - degradation * 10);
    } else if (output.trainResult && output.testResult) {
      const trainReturn = output.trainResult.metrics.totalReturn;
      const testReturnVal = output.testResult.metrics.totalReturn;
      const degradation = trainReturn !== 0 ? (trainReturn - testReturnVal) / Math.abs(trainReturn) : 0;
      flags.lowDegradation = Math.abs(degradation) < 0.3;
      components.degradation = Math.max(0, 10 - Math.abs(degradation) * 10);
    }

    // Monte Carlo flag
    if (output.monteCarlo) {
      flags.passedMonteCarlo = output.monteCarlo.statistics.probabilityOfProfit > 0.5;
    }

    // Calculate overall score
    const overall = Math.round(
      components.profitability +
      components.riskAdjusted +
      components.consistency +
      components.robustness +
      components.degradation
    );

    // Determine recommendation
    let recommendation: ValidationScore['recommendation'];
    const passedFlags = Object.values(flags).filter(Boolean).length;

    if (overall >= 70 && passedFlags >= 4) {
      recommendation = 'strong-pass';
    } else if (overall >= 50 && passedFlags >= 3) {
      recommendation = 'pass';
    } else if (overall >= 30 && passedFlags >= 2) {
      recommendation = 'marginal';
    } else {
      recommendation = 'fail';
    }

    return {
      overall,
      components,
      flags,
      recommendation,
    };
  }
}

/**
 * Convenience function for quick validation
 */
export function validateStrategy(
  strategy: Strategy,
  data: BacktestData,
  config: ValidationConfig = { trainTestSplit: 0.7, numFolds: 5 },
  initialCapital: number = 100000
): ValidationOutput {
  const validator = new StrategyValidator(initialCapital);
  return validator.validate(strategy, data, config);
}

/**
 * Quick validation with default settings
 */
export function quickValidate(
  strategy: Strategy,
  data: BacktestData,
  initialCapital: number = 100000
): ValidationOutput {
  return validateStrategy(strategy, data, {
    trainTestSplit: 0.7,
    numFolds: 5,
    walkForward: {
      numWindows: 5,
      inSampleRatio: 0.7,
      optimizePerWindow: false,
    },
    monteCarlo: {
      numSimulations: 100,
      method: 'bootstrap-returns',
      confidenceLevel: 0.95,
    },
    benchmarks: DEFAULT_BENCHMARKS,
  }, initialCapital);
}
