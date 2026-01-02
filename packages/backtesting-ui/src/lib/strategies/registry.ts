/**
 * Strategy Registry
 * Registry of all available backtesting strategies with UI metadata
 */

import {
  MACrossoverStrategy,
  RSIReversionStrategy,
  BuyAndHoldStrategy,
} from '@one-love-wealth/backtesting';
import type { StrategyRegistry } from './types';

// TODO: Import additional strategies when implemented in backtesting package:
// - VIXHedgeStrategy
// - BollingerBreakoutStrategy
// - MACDDivergenceStrategy
// - PairsTradingStrategy

/**
 * Complete strategy registry
 * All strategies available in the UI
 */
export const STRATEGIES: StrategyRegistry = {
  /**
   * MA Crossover Strategy
   * Classic trend-following strategy using two moving averages
   */
  'ma-crossover': {
    id: 'ma-crossover',
    name: 'MA Crossover',
    description: 'Golden cross (fast MA crosses above slow MA) signals buy, death cross signals sell',
    category: 'trend',
    create: (p) => new MACrossoverStrategy(p),
    defaults: {
      symbol: 'SPY',
      fastPeriod: 50,
      slowPeriod: 200,
      positionSize: 0.95,
    },
    fields: [
      {
        key: 'symbol',
        type: 'symbol',
        label: 'Symbol',
        help: 'Stock, ETF, or index to trade',
        showByDefault: true,
      },
      {
        key: 'fastPeriod',
        type: 'slider',
        label: 'Fast Period',
        help: 'Short-term moving average period',
        min: 5,
        max: 100,
        step: 5,
        default: 50,
        showByDefault: true,
      },
      {
        key: 'slowPeriod',
        type: 'slider',
        label: 'Slow Period',
        help: 'Long-term moving average period',
        min: 20,
        max: 300,
        step: 10,
        default: 200,
        showByDefault: true,
      },
      {
        key: 'positionSize',
        type: 'percent',
        label: 'Position Size',
        help: 'Percentage of capital to use per trade',
        default: 0.95,
        showByDefault: false,
      },
    ],
    validation: (p) =>
      p.slowPeriod <= p.fastPeriod ? 'Slow period must be greater than fast period' : null,
    recommendedYears: 10,
    tags: ['trend', 'momentum', 'classic', 'long-term'],
    preset: {
      name: 'Recommended',
      rationale:
        'The 50/200 moving average combination is the classic "Golden Cross" setup, widely used by institutional traders and backed by decades of research.',
      optimizedFor: ['Long-term trends', 'Low trading frequency', 'Reduced whipsaw'],
      backtestedPeriod: '2000-2024',
      expectedMetrics: {
        sharpe: '0.8-1.2',
        maxDrawdown: '-25% to -35%',
        winRate: '45-55%',
        annualReturn: '8-12%',
      },
      suitableFor: [
        'Retirement accounts',
        'Buy-and-hold with trend filter',
        'Beginners learning technical analysis',
      ],
    },
  },

  /**
   * RSI Mean Reversion Strategy
   * Buys oversold conditions, sells overbought conditions
   */
  'rsi-reversion': {
    id: 'rsi-reversion',
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI is oversold, sell when overbought',
    category: 'mean-reversion',
    create: (p) => new RSIReversionStrategy(p),
    defaults: {
      symbol: 'SPY',
      rsiPeriod: 14,
      oversold: 30,
      overbought: 70,
      positionSize: 0.95,
    },
    fields: [
      {
        key: 'symbol',
        type: 'symbol',
        label: 'Symbol',
        help: 'Stock, ETF, or index to trade',
        showByDefault: true,
      },
      {
        key: 'rsiPeriod',
        type: 'slider',
        label: 'RSI Period',
        help: 'Number of periods for RSI calculation',
        min: 5,
        max: 30,
        step: 1,
        default: 14,
        showByDefault: true,
      },
      {
        key: 'oversold',
        type: 'slider',
        label: 'Oversold Level',
        help: 'RSI level to trigger buy signal',
        min: 10,
        max: 40,
        step: 5,
        default: 30,
        showByDefault: true,
      },
      {
        key: 'overbought',
        type: 'slider',
        label: 'Overbought Level',
        help: 'RSI level to trigger sell signal',
        min: 60,
        max: 90,
        step: 5,
        default: 70,
        showByDefault: true,
      },
      {
        key: 'positionSize',
        type: 'percent',
        label: 'Position Size',
        help: 'Percentage of capital to use per trade',
        default: 0.95,
        showByDefault: false,
      },
    ],
    validation: (p) =>
      p.overbought <= p.oversold ? 'Overbought must be greater than oversold' : null,
    recommendedYears: 3,
    tags: ['mean-reversion', 'oscillator', 'rsi'],
  },

  /**
   * Buy and Hold Strategy
   * Benchmark strategy - buy on first bar and hold
   */
  'buy-and-hold': {
    id: 'buy-and-hold',
    name: 'Buy & Hold',
    description: 'Benchmark strategy: buy and hold for the entire period',
    category: 'trend',
    create: (p) => new BuyAndHoldStrategy(p),
    defaults: {
      symbol: 'SPY',
      positionSize: 1.0,
    },
    fields: [
      {
        key: 'symbol',
        type: 'symbol',
        label: 'Symbol',
        help: 'Stock, ETF, or index to hold',
        showByDefault: true,
      },
      {
        key: 'positionSize',
        type: 'percent',
        label: 'Position Size',
        help: 'Percentage of capital to invest (usually 100%)',
        default: 1.0,
        showByDefault: false,
      },
    ],
    recommendedYears: 20,
    tags: ['benchmark', 'passive', 'long-term'],
  },

  // TODO: Add these strategies when implemented in backtesting package:

  // 'vix-hedge': { ... },
  // 'bollinger-breakout': { ... },
  // 'macd-divergence': { ... },
  // 'pairs-trading': { ... },
} as const;

/**
 * Get strategy by ID
 */
export function getStrategy(id: string): StrategyDefinition | null {
  return STRATEGIES[id] || null;
}

/**
 * Get all strategy IDs
 */
export function getStrategyIds(): string[] {
  return Object.keys(STRATEGIES);
}

/**
 * Get strategies by category
 */
export function getStrategiesByCategory(category: string): StrategyDefinition[] {
  return Object.values(STRATEGIES).filter((s) => s.category === category);
}

/**
 * Search strategies by name or tags
 */
export function searchStrategies(query: string): StrategyDefinition[] {
  const q = query.toLowerCase();
  return Object.values(STRATEGIES).filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags?.some((t) => t.toLowerCase().includes(q))
  );
}
