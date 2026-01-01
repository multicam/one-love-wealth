/**
 * Walk-Forward Analysis Module
 * 
 * Implements walk-forward testing to validate strategy robustness:
 * 1. Divide data into multiple windows
 * 2. For each window, use first portion for in-sample (training)
 * 3. Use remaining portion for out-of-sample (testing)
 * 4. Optionally optimize parameters on in-sample, test on out-of-sample
 */

import type { BacktestData, BacktestResult, MultiBar } from '../types';
import type { Strategy } from '../strategies/strategy';
import { BacktestEngine } from '../engine/backtest-engine';
import { ParameterOptimizer } from './optimizer';
import type {
  WalkForwardConfig,
  WalkForwardWindow,
  WalkForwardWindowResult,
  WalkForwardOutput,
  StrategyFactory,
  ParameterSet,
} from './types';

/**
 * Walk-Forward Analyzer
 */
export class WalkForwardAnalyzer {
  private readonly engine: BacktestEngine;
  private readonly optimizer: ParameterOptimizer;
  private readonly initialCapital: number;

  constructor(initialCapital: number = 100000) {
    this.initialCapital = initialCapital;
    this.engine = new BacktestEngine({ initialCapital });
    this.optimizer = new ParameterOptimizer(initialCapital);
  }

  /**
   * Run walk-forward analysis with a fixed strategy
   */
  analyze(
    strategy: Strategy,
    data: BacktestData,
    config: WalkForwardConfig
  ): WalkForwardOutput {
    const windows = this.createWindows(data, config);
    const windowResults: WalkForwardWindowResult[] = [];

    for (const window of windows) {
      const inSampleData = this.sliceData(data, window.inSampleStart, window.inSampleEnd);
      const outOfSampleData = this.sliceData(data, window.outOfSampleStart, window.outOfSampleEnd);

      // Reset strategy state
      strategy.init?.();

      const inSampleResult = this.engine.run(strategy, inSampleData);
      
      // Reset again for out-of-sample
      strategy.init?.();
      
      const outOfSampleResult = this.engine.run(strategy, outOfSampleData);

      const degradation = this.calculateDegradation(
        inSampleResult.metrics.totalReturn,
        outOfSampleResult.metrics.totalReturn
      );

      windowResults.push({
        window,
        inSampleResult,
        outOfSampleResult,
        degradation,
      });
    }

    return this.buildOutput(config, windowResults, data);
  }

  /**
   * Run walk-forward analysis with parameter optimization per window
   */
  analyzeWithOptimization<TParams extends ParameterSet>(
    strategyFactory: StrategyFactory<TParams>,
    data: BacktestData,
    config: WalkForwardConfig
  ): WalkForwardOutput {
    if (!config.optimizePerWindow || !config.optimizationConfig) {
      throw new Error('optimizationConfig required when optimizePerWindow is true');
    }

    const windows = this.createWindows(data, config);
    const windowResults: WalkForwardWindowResult[] = [];

    for (const window of windows) {
      const inSampleData = this.sliceData(data, window.inSampleStart, window.inSampleEnd);
      const outOfSampleData = this.sliceData(data, window.outOfSampleStart, window.outOfSampleEnd);

      // Optimize on in-sample data
      const optimizationResult = this.optimizer.optimize(
        strategyFactory,
        inSampleData,
        config.optimizationConfig
      );

      const bestParams = optimizationResult.bestResult.params;
      const inSampleResult = optimizationResult.bestResult.result;

      // Test on out-of-sample with optimized parameters
      const strategy = strategyFactory(bestParams as TParams);
      strategy.init?.();
      const outOfSampleResult = this.engine.run(strategy, outOfSampleData);

      const degradation = this.calculateDegradation(
        inSampleResult.metrics.totalReturn,
        outOfSampleResult.metrics.totalReturn
      );

      windowResults.push({
        window,
        inSampleResult,
        outOfSampleResult,
        optimizedParams: bestParams,
        degradation,
      });
    }

    return this.buildOutput(config, windowResults, data);
  }

  /**
   * Create walk-forward windows
   */
  private createWindows(data: BacktestData, config: WalkForwardConfig): WalkForwardWindow[] {
    const windows: WalkForwardWindow[] = [];
    const totalBars = data.bars.length;

    if (config.anchored) {
      // Anchored: all windows start from the same date
      const barsPerWindow = Math.floor(totalBars / config.numWindows);
      
      for (let i = 0; i < config.numWindows; i++) {
        const windowEnd = Math.min((i + 1) * barsPerWindow, totalBars - 1);
        const inSampleEnd = Math.floor(windowEnd * config.inSampleRatio);

        const startBar = data.bars[0];
        const inSampleEndBar = data.bars[inSampleEnd];
        const inSampleEndPlusOne = data.bars[inSampleEnd + 1];
        const windowEndBar = data.bars[windowEnd];

        if (startBar && inSampleEndBar && inSampleEndPlusOne && windowEndBar) {
          windows.push({
            windowIndex: i,
            inSampleStart: new Date(startBar.time),
            inSampleEnd: new Date(inSampleEndBar.time),
            outOfSampleStart: new Date(inSampleEndPlusOne.time),
            outOfSampleEnd: new Date(windowEndBar.time),
          });
        }
      }
    } else {
      // Rolling: windows slide through time
      const windowSize = Math.floor(totalBars / config.numWindows);
      const inSampleSize = Math.floor(windowSize * config.inSampleRatio);
      const outOfSampleSize = windowSize - inSampleSize;

      for (let i = 0; i < config.numWindows; i++) {
        const windowStart = i * windowSize;
        const inSampleEnd = windowStart + inSampleSize - 1;
        const outOfSampleStart = inSampleEnd + 1;
        const windowEnd = Math.min(windowStart + windowSize - 1, totalBars - 1);

        const startBar = data.bars[windowStart];
        const inSampleEndBar = data.bars[inSampleEnd];
        const outOfSampleStartBar = data.bars[outOfSampleStart];
        const windowEndBar = data.bars[windowEnd];

        if (startBar && inSampleEndBar && outOfSampleStartBar && windowEndBar) {
          windows.push({
            windowIndex: i,
            inSampleStart: new Date(startBar.time),
            inSampleEnd: new Date(inSampleEndBar.time),
            outOfSampleStart: new Date(outOfSampleStartBar.time),
            outOfSampleEnd: new Date(windowEndBar.time),
          });
        }
      }
    }

    return windows;
  }

  /**
   * Slice data for a date range
   */
  private sliceData(data: BacktestData, start: Date, end: Date): BacktestData {
    const startTime = start.getTime();
    const endTime = end.getTime();

    const filteredBars = data.bars.filter(
      bar => bar.time >= startTime && bar.time <= endTime
    );

    return {
      symbols: data.symbols,
      bars: filteredBars,
      startDate: start,
      endDate: end,
    };
  }

  /**
   * Calculate performance degradation
   */
  private calculateDegradation(inSample: number, outOfSample: number): number {
    if (inSample === 0) return 0;
    return (inSample - outOfSample) / Math.abs(inSample);
  }

  /**
   * Build walk-forward output
   */
  private buildOutput(
    config: WalkForwardConfig,
    windowResults: WalkForwardWindowResult[],
    originalData: BacktestData
  ): WalkForwardOutput {
    // Calculate aggregate metrics
    const inSampleReturns = windowResults.map(w => w.inSampleResult.metrics.totalReturn);
    const outOfSampleReturns = windowResults.map(w => w.outOfSampleResult.metrics.totalReturn);
    const degradations = windowResults.map(w => w.degradation);

    const avgInSampleReturn = this.average(inSampleReturns);
    const avgOutOfSampleReturn = this.average(outOfSampleReturns);
    const avgDegradation = this.average(degradations);
    const consistencyRatio = outOfSampleReturns.filter(r => r > 0).length / outOfSampleReturns.length;

    // Robustness score (0-100)
    const robustnessScore = this.calculateRobustnessScore(
      avgOutOfSampleReturn,
      avgDegradation,
      consistencyRatio
    );

    // Combine all out-of-sample periods into one result
    const combinedOOSBars: MultiBar[] = [];
    for (const window of windowResults) {
      const oosData = this.sliceData(
        originalData,
        window.window.outOfSampleStart,
        window.window.outOfSampleEnd
      );
      combinedOOSBars.push(...oosData.bars);
    }

    // Sort by time
    combinedOOSBars.sort((a, b) => a.time - b.time);

    const combinedOOSData: BacktestData = {
      symbols: originalData.symbols,
      bars: combinedOOSBars,
      startDate: windowResults[0]?.window.outOfSampleStart ?? new Date(),
      endDate: windowResults[windowResults.length - 1]?.window.outOfSampleEnd ?? new Date(),
    };

    // Use the last window's strategy/params for combined result
    // This is a placeholder - in real use you'd want to specify the strategy
    const combinedResult = windowResults[windowResults.length - 1]?.outOfSampleResult;

    return {
      config,
      windows: windowResults,
      aggregatedMetrics: {
        avgInSampleReturn,
        avgOutOfSampleReturn,
        avgDegradation,
        consistencyRatio,
        robustnessScore,
      },
      combinedOutOfSample: combinedResult!,
    };
  }

  /**
   * Calculate robustness score
   */
  private calculateRobustnessScore(
    avgReturn: number,
    avgDegradation: number,
    consistencyRatio: number
  ): number {
    // Score based on:
    // - Positive returns (40 points)
    // - Low degradation (30 points)
    // - High consistency (30 points)

    let score = 0;

    // Profitability (0-40)
    if (avgReturn > 0) {
      score += Math.min(40, avgReturn * 100); // Cap at 40% return for max score
    }

    // Degradation (0-30) - lower is better
    const degradationScore = Math.max(0, 30 - Math.abs(avgDegradation) * 30);
    score += degradationScore;

    // Consistency (0-30)
    score += consistencyRatio * 30;

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate average of array
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

/**
 * Convenience function for walk-forward analysis
 */
export function walkForwardAnalysis(
  strategy: Strategy,
  data: BacktestData,
  config: WalkForwardConfig,
  initialCapital: number = 100000
): WalkForwardOutput {
  const analyzer = new WalkForwardAnalyzer(initialCapital);
  return analyzer.analyze(strategy, data, config);
}

/**
 * Convenience function for walk-forward with optimization
 */
export function walkForwardWithOptimization<TParams extends ParameterSet>(
  strategyFactory: StrategyFactory<TParams>,
  data: BacktestData,
  config: WalkForwardConfig,
  initialCapital: number = 100000
): WalkForwardOutput {
  const analyzer = new WalkForwardAnalyzer(initialCapital);
  return analyzer.analyzeWithOptimization(strategyFactory, data, config);
}
