/**
 * Monte Carlo Simulation Module
 * 
 * Implements Monte Carlo methods for strategy robustness testing:
 * - Trade Shuffle: Randomize the order of trades
 * - Bootstrap Returns: Sample returns with replacement
 * - Random Entry: Random entry points within valid signals
 */

import type { BacktestResult, Trade, EquityPoint, BacktestConfig } from '../types';
import type {
  MonteCarloConfig,
  MonteCarloOutput,
  MonteCarloSimulation,
  MonteCarloStatistics,
  DistributionStats,
} from './types';

/**
 * Monte Carlo Simulator
 */
export class MonteCarloSimulator {
  private readonly initialCapital: number;

  constructor(initialCapital: number = 100000) {
    this.initialCapital = initialCapital;
  }

  /**
   * Run Monte Carlo simulation
   */
  simulate(
    originalResult: BacktestResult,
    config: MonteCarloConfig
  ): MonteCarloOutput {
    const simulations: MonteCarloSimulation[] = [];
    const confidenceLevel = config.confidenceLevel ?? 0.95;

    // Set random seed if provided
    let rng = Math.random;
    if (config.seed !== undefined) {
      rng = this.seededRandom(config.seed);
    }

    for (let i = 0; i < config.numSimulations; i++) {
      let simulation: MonteCarloSimulation;

      switch (config.method) {
        case 'trade-shuffle':
          simulation = this.tradeShuffle(originalResult, i, rng);
          break;
        case 'bootstrap-returns':
          simulation = this.bootstrapReturns(originalResult, i, rng);
          break;
        case 'random-entry':
          simulation = this.randomEntry(originalResult, i, rng);
          break;
        default:
          simulation = this.tradeShuffle(originalResult, i, rng);
      }

      simulations.push(simulation);
    }

    const statistics = this.calculateStatistics(simulations, originalResult, confidenceLevel);

    return {
      config,
      originalResult,
      simulations,
      statistics,
    };
  }

  /**
   * Trade shuffle simulation - randomize order of trades
   */
  private tradeShuffle(
    original: BacktestResult,
    index: number,
    rng: () => number
  ): MonteCarloSimulation {
    // Get trade P&Ls
    const tradePnLs = this.extractTradePnLs(original.trades);
    
    // Shuffle P&Ls
    const shuffled = this.shuffle([...tradePnLs], rng);

    // Reconstruct equity curve
    let equity = this.initialCapital;
    let maxEquity = equity;
    let maxDrawdown = 0;

    const returns: number[] = [];
    for (const pnl of shuffled) {
      const returnPct = pnl / equity;
      returns.push(returnPct);
      equity += pnl;
      maxEquity = Math.max(maxEquity, equity);
      const drawdown = (maxEquity - equity) / maxEquity;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    const totalReturn = (equity - this.initialCapital) / this.initialCapital;
    const sharpeRatio = this.calculateSharpe(returns);

    return {
      simulationIndex: index,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      finalEquity: equity,
    };
  }

  /**
   * Bootstrap returns simulation - sample daily returns with replacement
   */
  private bootstrapReturns(
    original: BacktestResult,
    index: number,
    rng: () => number
  ): MonteCarloSimulation {
    // Extract daily returns from equity curve
    const dailyReturns = this.extractDailyReturns(original.equityCurve);

    // Bootstrap sample
    const bootstrapped: number[] = [];
    for (let i = 0; i < dailyReturns.length; i++) {
      const randomIndex = Math.floor(rng() * dailyReturns.length);
      const dailyReturn = dailyReturns[randomIndex];
      if (dailyReturn !== undefined) {
        bootstrapped.push(dailyReturn);
      }
    }

    // Reconstruct equity curve
    let equity = this.initialCapital;
    let maxEquity = equity;
    let maxDrawdown = 0;

    for (const ret of bootstrapped) {
      equity *= (1 + ret);
      maxEquity = Math.max(maxEquity, equity);
      const drawdown = (maxEquity - equity) / maxEquity;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    const totalReturn = (equity - this.initialCapital) / this.initialCapital;
    const sharpeRatio = this.calculateSharpe(bootstrapped);

    return {
      simulationIndex: index,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      finalEquity: equity,
    };
  }

  /**
   * Random entry simulation - randomize entry timing within windows
   */
  private randomEntry(
    original: BacktestResult,
    index: number,
    rng: () => number
  ): MonteCarloSimulation {
    // This is a simplified version - randomly skips some trades
    const tradePnLs = this.extractTradePnLs(original.trades);
    
    // Randomly include/exclude trades with some probability
    const includedPnLs: number[] = [];
    for (const pnl of tradePnLs) {
      if (rng() > 0.3) { // 70% chance to include each trade
        // Add some noise to entry/exit timing
        const noise = (rng() - 0.5) * 0.1; // +/- 5% noise
        includedPnLs.push(pnl * (1 + noise));
      }
    }

    // Reconstruct equity curve
    let equity = this.initialCapital;
    let maxEquity = equity;
    let maxDrawdown = 0;

    const returns: number[] = [];
    for (const pnl of includedPnLs) {
      const returnPct = pnl / equity;
      returns.push(returnPct);
      equity += pnl;
      maxEquity = Math.max(maxEquity, equity);
      const drawdown = (maxEquity - equity) / maxEquity;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    const totalReturn = (equity - this.initialCapital) / this.initialCapital;
    const sharpeRatio = this.calculateSharpe(returns);

    return {
      simulationIndex: index,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      finalEquity: equity,
    };
  }

  /**
   * Extract trade P&Ls from trade list
   */
  private extractTradePnLs(trades: Trade[]): number[] {
    const pnls: number[] = [];
    const positionsBySymbol = new Map<string, { qty: number; cost: number }>();

    for (const trade of trades) {
      const position = positionsBySymbol.get(trade.symbol) ?? { qty: 0, cost: 0 };

      if (trade.side === 'buy') {
        const newQty = position.qty + trade.quantity;
        position.cost = (position.cost * position.qty + trade.value) / newQty;
        position.qty = newQty;
      } else {
        // Sell - realize P&L
        const pnl = (trade.price - position.cost) * trade.quantity - trade.commission;
        pnls.push(pnl);
        position.qty -= trade.quantity;
        if (position.qty <= 0) {
          position.qty = 0;
          position.cost = 0;
        }
      }

      positionsBySymbol.set(trade.symbol, position);
    }

    return pnls;
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
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffle<T>(array: T[], rng: () => number): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = array[i];
      const itemJ = array[j];
      if (temp !== undefined && itemJ !== undefined) {
        array[i] = itemJ;
        array[j] = temp;
      }
    }
    return array;
  }

  /**
   * Calculate Sharpe ratio from returns
   */
  private calculateSharpe(returns: number[]): number {
    if (returns.length < 2) return 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualize
    const annualizedReturn = mean * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);

    return annualizedReturn / annualizedStdDev;
  }

  /**
   * Calculate statistics from simulations
   */
  private calculateStatistics(
    simulations: MonteCarloSimulation[],
    original: BacktestResult,
    confidenceLevel: number
  ): MonteCarloStatistics {
    const returns = simulations.map(s => s.totalReturn);
    const drawdowns = simulations.map(s => s.maxDrawdown);
    const sharpes = simulations.map(s => s.sharpeRatio);

    // Sort for percentile calculations
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const sortedDrawdowns = [...drawdowns].sort((a, b) => a - b);

    // VaR calculation (negative percentile)
    const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    const valueAtRisk = sortedReturns[varIndex] ?? 0;

    // CVaR (expected shortfall) - average of returns below VaR
    const returnsBelow = sortedReturns.slice(0, varIndex + 1);
    const conditionalVaR = returnsBelow.length > 0
      ? returnsBelow.reduce((a, b) => a + b, 0) / returnsBelow.length
      : 0;

    // Probability calculations
    const probabilityOfProfit = returns.filter(r => r > 0).length / returns.length;
    const probabilityOfBetterThanOriginal = returns.filter(
      r => r > original.metrics.totalReturn
    ).length / returns.length;

    return {
      returnDistribution: this.calculateDistribution(returns),
      drawdownDistribution: this.calculateDistribution(drawdowns),
      sharpeDistribution: this.calculateDistribution(sharpes),
      probabilityOfProfit,
      probabilityOfBetterThanOriginal,
      valueAtRisk,
      conditionalVaR,
      confidenceLevel,
    };
  }

  /**
   * Calculate distribution statistics
   */
  private calculateDistribution(values: number[]): DistributionStats {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median: sorted[Math.floor(n / 2)] ?? 0,
      stdDev,
      min: sorted[0] ?? 0,
      max: sorted[n - 1] ?? 0,
      percentile5: sorted[Math.floor(n * 0.05)] ?? 0,
      percentile25: sorted[Math.floor(n * 0.25)] ?? 0,
      percentile75: sorted[Math.floor(n * 0.75)] ?? 0,
      percentile95: sorted[Math.floor(n * 0.95)] ?? 0,
    };
  }

  /**
   * Create seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s * 9999) * 10000;
      return s - Math.floor(s);
    };
  }
}

/**
 * Convenience function for Monte Carlo simulation
 */
export function monteCarloSimulation(
  result: BacktestResult,
  config: MonteCarloConfig,
  initialCapital: number = 100000
): MonteCarloOutput {
  const simulator = new MonteCarloSimulator(initialCapital);
  return simulator.simulate(result, config);
}
