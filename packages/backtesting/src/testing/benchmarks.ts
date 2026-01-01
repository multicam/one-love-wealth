/**
 * Benchmark Comparison Module
 * 
 * Compare strategy performance against various benchmarks:
 * - Buy and Hold
 * - Index funds (SPY, QQQ)
 * - Risk-free rate
 * - Custom benchmarks
 */

import type { BacktestData, BacktestResult, EquityPoint } from '../types';
import type { Strategy } from '../strategies/strategy';
import { BacktestEngine } from '../engine/backtest-engine';
import { BuyAndHoldStrategy } from '../strategies/examples/buy-and-hold';
import type {
  BenchmarkDefinition,
  BenchmarkComparison,
} from './types';

/**
 * Benchmark Comparer
 */
export class BenchmarkComparer {
  private readonly engine: BacktestEngine;
  private readonly initialCapital: number;

  constructor(initialCapital: number = 100000) {
    this.initialCapital = initialCapital;
    this.engine = new BacktestEngine({ initialCapital });
  }

  /**
   * Compare strategy against multiple benchmarks
   */
  compare(
    strategyResult: BacktestResult,
    data: BacktestData,
    benchmarks: BenchmarkDefinition[]
  ): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = [];

    for (const benchmark of benchmarks) {
      const benchmarkResult = this.runBenchmark(benchmark, data);
      const comparison = this.calculateComparison(strategyResult, benchmarkResult, benchmark);
      comparisons.push(comparison);
    }

    return comparisons;
  }

  /**
   * Compare against a single benchmark
   */
  compareOne(
    strategyResult: BacktestResult,
    data: BacktestData,
    benchmark: BenchmarkDefinition
  ): BenchmarkComparison {
    const benchmarkResult = this.runBenchmark(benchmark, data);
    return this.calculateComparison(strategyResult, benchmarkResult, benchmark);
  }

  /**
   * Run benchmark strategy
   */
  private runBenchmark(benchmark: BenchmarkDefinition, data: BacktestData): BacktestResult {
    let strategy: Strategy;

    if (benchmark.strategy) {
      strategy = benchmark.strategy;
    } else if (benchmark.symbol) {
      // Create Buy & Hold strategy for the symbol
      strategy = new BuyAndHoldStrategy({
        symbol: benchmark.symbol,
        positionSize: 0.95,
      });
    } else {
      // Default to first symbol in data
      strategy = new BuyAndHoldStrategy({
        symbol: data.symbols[0] ?? 'SPY',
        positionSize: 0.95,
      });
    }

    strategy.init?.();
    return this.engine.run(strategy, data);
  }

  /**
   * Calculate comparison metrics
   */
  private calculateComparison(
    strategyResult: BacktestResult,
    benchmarkResult: BacktestResult,
    benchmark: BenchmarkDefinition
  ): BenchmarkComparison {
    const strategyReturns = this.extractDailyReturns(strategyResult.equityCurve);
    const benchmarkReturns = this.extractDailyReturns(benchmarkResult.equityCurve);

    // Align returns by length
    const minLen = Math.min(strategyReturns.length, benchmarkReturns.length);
    const alignedStrategy = strategyReturns.slice(0, minLen);
    const alignedBenchmark = benchmarkReturns.slice(0, minLen);

    // Calculate metrics
    const excessReturn = strategyResult.metrics.totalReturn - benchmarkResult.metrics.totalReturn;
    const { alpha, beta } = this.calculateAlphaBeta(alignedStrategy, alignedBenchmark);
    const correlation = this.calculateCorrelation(alignedStrategy, alignedBenchmark);
    const trackingError = this.calculateTrackingError(alignedStrategy, alignedBenchmark);
    const informationRatio = trackingError !== 0 ? excessReturn / trackingError : 0;
    const { upCapture, downCapture } = this.calculateCapture(alignedStrategy, alignedBenchmark);
    const winVsBenchmark = this.calculateWinVsBenchmark(alignedStrategy, alignedBenchmark);

    return {
      benchmark,
      benchmarkResult,
      strategyResult,
      comparison: {
        excessReturn,
        alpha,
        beta,
        correlation,
        trackingError,
        informationRatio,
        upCapture,
        downCapture,
        winVsBenchmark,
      },
    };
  }

  /**
   * Extract daily returns from equity curve
   */
  private extractDailyReturns(equityCurve: EquityPoint[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1];
      const curr = equityCurve[i];
      if (prev && curr && prev.equity !== 0) {
        returns.push((curr.equity - prev.equity) / prev.equity);
      }
    }
    return returns;
  }

  /**
   * Calculate alpha and beta
   */
  private calculateAlphaBeta(
    strategyReturns: number[],
    benchmarkReturns: number[]
  ): { alpha: number; beta: number } {
    if (strategyReturns.length < 2) return { alpha: 0, beta: 1 };

    const n = strategyReturns.length;
    const strategyMean = strategyReturns.reduce((a, b) => a + b, 0) / n;
    const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / n;

    let covariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < n; i++) {
      const sReturn = strategyReturns[i];
      const bReturn = benchmarkReturns[i];
      if (sReturn !== undefined && bReturn !== undefined) {
        covariance += (sReturn - strategyMean) * (bReturn - benchmarkMean);
        benchmarkVariance += Math.pow(bReturn - benchmarkMean, 2);
      }
    }

    covariance /= (n - 1);
    benchmarkVariance /= (n - 1);

    const beta = benchmarkVariance !== 0 ? covariance / benchmarkVariance : 1;
    const alpha = (strategyMean - beta * benchmarkMean) * 252; // Annualized

    return { alpha, beta };
  }

  /**
   * Calculate correlation coefficient
   */
  private calculateCorrelation(
    strategyReturns: number[],
    benchmarkReturns: number[]
  ): number {
    if (strategyReturns.length < 2) return 0;

    const n = strategyReturns.length;
    const strategyMean = strategyReturns.reduce((a, b) => a + b, 0) / n;
    const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / n;

    let covariance = 0;
    let strategyVariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < n; i++) {
      const sReturn = strategyReturns[i];
      const bReturn = benchmarkReturns[i];
      if (sReturn !== undefined && bReturn !== undefined) {
        covariance += (sReturn - strategyMean) * (bReturn - benchmarkMean);
        strategyVariance += Math.pow(sReturn - strategyMean, 2);
        benchmarkVariance += Math.pow(bReturn - benchmarkMean, 2);
      }
    }

    const denominator = Math.sqrt(strategyVariance * benchmarkVariance);
    return denominator !== 0 ? covariance / denominator : 0;
  }

  /**
   * Calculate tracking error (annualized std dev of excess returns)
   */
  private calculateTrackingError(
    strategyReturns: number[],
    benchmarkReturns: number[]
  ): number {
    const excessReturns: number[] = [];
    for (let i = 0; i < strategyReturns.length; i++) {
      const sReturn = strategyReturns[i];
      const bReturn = benchmarkReturns[i];
      if (sReturn !== undefined && bReturn !== undefined) {
        excessReturns.push(sReturn - bReturn);
      }
    }

    if (excessReturns.length < 2) return 0;

    const mean = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
    const variance = excessReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (excessReturns.length - 1);
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  /**
   * Calculate up/down capture ratios
   */
  private calculateCapture(
    strategyReturns: number[],
    benchmarkReturns: number[]
  ): { upCapture: number; downCapture: number } {
    let upStrategySum = 0;
    let upBenchmarkSum = 0;
    let downStrategySum = 0;
    let downBenchmarkSum = 0;
    let upCount = 0;
    let downCount = 0;

    for (let i = 0; i < benchmarkReturns.length; i++) {
      const sReturn = strategyReturns[i];
      const bReturn = benchmarkReturns[i];
      if (sReturn === undefined || bReturn === undefined) continue;

      if (bReturn > 0) {
        upStrategySum += sReturn;
        upBenchmarkSum += bReturn;
        upCount++;
      } else if (bReturn < 0) {
        downStrategySum += sReturn;
        downBenchmarkSum += bReturn;
        downCount++;
      }
    }

    const upCapture = upBenchmarkSum !== 0 ? (upStrategySum / upCount) / (upBenchmarkSum / upCount) : 1;
    const downCapture = downBenchmarkSum !== 0 ? (downStrategySum / downCount) / (downBenchmarkSum / downCount) : 1;

    return { upCapture, downCapture };
  }

  /**
   * Calculate percentage of periods beating benchmark
   */
  private calculateWinVsBenchmark(
    strategyReturns: number[],
    benchmarkReturns: number[]
  ): number {
    let wins = 0;
    for (let i = 0; i < strategyReturns.length; i++) {
      const sReturn = strategyReturns[i];
      const bReturn = benchmarkReturns[i];
      if (sReturn !== undefined && bReturn !== undefined && sReturn > bReturn) {
        wins++;
      }
    }
    return strategyReturns.length > 0 ? wins / strategyReturns.length : 0;
  }
}

/**
 * Default benchmark definitions
 */
export const DEFAULT_BENCHMARKS: BenchmarkDefinition[] = [
  { name: 'Buy & Hold (First Symbol)', description: 'Simple buy and hold of the primary symbol' },
  { name: 'SPY', symbol: 'SPY', description: 'S&P 500 ETF' },
];

/**
 * Convenience function for benchmark comparison
 */
export function compareToBenchmarks(
  strategyResult: BacktestResult,
  data: BacktestData,
  benchmarks: BenchmarkDefinition[] = DEFAULT_BENCHMARKS,
  initialCapital: number = 100000
): BenchmarkComparison[] {
  const comparer = new BenchmarkComparer(initialCapital);
  return comparer.compare(strategyResult, data, benchmarks);
}
