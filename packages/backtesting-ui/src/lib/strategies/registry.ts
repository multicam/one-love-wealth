/**
 * Strategy Registry
 * Registry of all available backtesting strategies with UI metadata
 */

import {
  MACrossoverStrategy,
  RSIReversionStrategy,
  BuyAndHoldStrategy,
  VIXHedgeStrategy,
  BollingerBreakoutStrategy,
  MACDDivergenceStrategy,
  PairsTradingStrategy,
} from '@one-love-wealth/backtesting';
import type { StrategyRegistry } from './types';

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

  /**
   * VIX Hedge Strategy
   * Reduces exposure when VIX (volatility) is elevated
   * MULTI-SYMBOL: Requires trading symbol + VIX symbol
   */
  'vix-hedge': {
    id: 'vix-hedge',
    name: 'VIX Hedge',
    description:
      'Exits or reduces position when VIX exceeds threshold, re-enters when volatility subsides',
    category: 'multi-symbol',
    create: (p) => new VIXHedgeStrategy(p),
    defaults: {
      tradingSymbol: 'TQQQ',
      vixSymbol: '^VIX',
      vixExitThreshold: 25,
      vixEntryThreshold: 20,
      useMASignal: false,
      vixMAPeriod: 10,
      positionSize: 0.95,
      partialExit: false,
      reducedPositionSize: 0.5,
    },
    fields: [
      {
        key: 'tradingSymbol',
        type: 'symbol',
        label: 'Trading Symbol',
        help: 'Symbol to trade (e.g., TQQQ, SPY, QQQ)',
        showByDefault: true,
      },
      {
        key: 'vixSymbol',
        type: 'symbol',
        label: 'VIX Symbol',
        help: 'Volatility index (usually ^VIX)',
        default: '^VIX',
        showByDefault: false, // Hidden in advanced settings
      },
      {
        key: 'vixExitThreshold',
        type: 'slider',
        label: 'VIX Exit Threshold',
        help: 'Exit when VIX exceeds this level',
        min: 15,
        max: 50,
        step: 1,
        default: 25,
        showByDefault: true,
      },
      {
        key: 'vixEntryThreshold',
        type: 'slider',
        label: 'VIX Entry Threshold',
        help: 'Re-enter when VIX falls below this level',
        min: 10,
        max: 40,
        step: 1,
        default: 20,
        showByDefault: true,
      },
      {
        key: 'useMASignal',
        type: 'toggle',
        label: 'Use VIX MA Signal',
        help: 'Use VIX moving average crossover instead of absolute levels',
        default: false,
        showByDefault: false,
      },
      {
        key: 'vixMAPeriod',
        type: 'slider',
        label: 'VIX MA Period',
        help: 'VIX moving average period (if using MA signal)',
        min: 5,
        max: 30,
        step: 1,
        default: 10,
        showByDefault: false,
      },
      {
        key: 'partialExit',
        type: 'toggle',
        label: 'Partial Exit',
        help: 'Reduce position instead of full exit',
        default: false,
        showByDefault: false,
      },
      {
        key: 'reducedPositionSize',
        type: 'percent',
        label: 'Reduced Position Size',
        help: 'Position size after partial exit',
        default: 0.5,
        showByDefault: false,
      },
      {
        key: 'positionSize',
        type: 'percent',
        label: 'Position Size',
        help: 'Full position size when VIX is low',
        default: 0.95,
        showByDefault: false,
      },
    ],
    validation: (p) =>
      p.vixEntryThreshold >= p.vixExitThreshold
        ? 'Entry threshold must be below exit threshold'
        : null,
    recommendedYears: 5,
    tags: ['volatility', 'hedge', 'multi-symbol', 'defensive'],
    preset: {
      name: 'Recommended',
      rationale:
        'Exit at VIX 25, re-enter at VIX 20 balances protection and participation. Based on analysis showing VIX above 25 often precedes significant drawdowns.',
      optimizedFor: [
        'Crash protection',
        'Leveraged ETF management',
        'Volatility-based risk control',
      ],
      backtestedPeriod: '2015-2024',
      expectedMetrics: {
        sharpe: '1.0-1.5 (vs 0.8 unhedged)',
        maxDrawdown: '-20% to -30% (vs -50% unhedged)',
        winRate: 'N/A (hedge reduces losses)',
        annualReturn: '12-18% (slightly lower, much safer)',
      },
      suitableFor: [
        'TQQQ and other leveraged ETFs',
        'Risk-averse long-term holders',
        'Reducing volatility decay',
      ],
    },
  },

  /**
   * Bollinger Bands Breakout/Reversion Strategy
   * Can trade breakouts or mean reversion
   */
  'bollinger-breakout': {
    id: 'bollinger-breakout',
    name: 'Bollinger Breakout',
    description: 'Trade breakouts above/below Bollinger Bands or mean reversion',
    category: 'volatility',
    create: (p) => new BollingerBreakoutStrategy(p),
    defaults: {
      symbol: 'SPY',
      period: 20,
      stdDev: 2,
      mode: 'breakout',
      oversoldThreshold: 0.1,
      overboughtThreshold: 0.9,
      useStopLoss: true,
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
        key: 'mode',
        type: 'radio',
        label: 'Trading Mode',
        help: 'Breakout: buy breaks above upper band. Reversion: buy oversold conditions',
        options: [
          { value: 'breakout', label: 'Breakout' },
          { value: 'reversion', label: 'Mean Reversion' },
        ],
        default: 'breakout',
        showByDefault: true,
      },
      {
        key: 'period',
        type: 'slider',
        label: 'Period',
        help: 'Bollinger Bands period',
        min: 10,
        max: 50,
        step: 5,
        default: 20,
        showByDefault: true,
      },
      {
        key: 'stdDev',
        type: 'slider',
        label: 'Standard Deviations',
        help: 'Number of standard deviations for bands',
        min: 1,
        max: 3,
        step: 0.5,
        default: 2,
        showByDefault: true,
      },
      {
        key: 'oversoldThreshold',
        type: 'slider',
        label: 'Oversold %B',
        help: 'Buy when %B falls below (for reversion mode)',
        min: 0,
        max: 0.3,
        step: 0.05,
        default: 0.1,
        showByDefault: false,
      },
      {
        key: 'overboughtThreshold',
        type: 'slider',
        label: 'Overbought %B',
        help: 'Sell when %B rises above (for reversion mode)',
        min: 0.7,
        max: 1,
        step: 0.05,
        default: 0.9,
        showByDefault: false,
      },
      {
        key: 'useStopLoss',
        type: 'toggle',
        label: 'Use Stop Loss',
        help: 'Exit below middle band',
        default: true,
        showByDefault: false,
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
    recommendedYears: 3,
    tags: ['volatility', 'bollinger', 'breakout', 'mean-reversion'],
  },

  /**
   * MACD Divergence Strategy
   * Trades MACD signal line crossovers
   */
  'macd-divergence': {
    id: 'macd-divergence',
    name: 'MACD Divergence',
    description: 'Buy when MACD crosses above signal line, sell when crosses below',
    category: 'momentum',
    create: (p) => new MACDDivergenceStrategy(p),
    defaults: {
      symbol: 'SPY',
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
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
        help: 'Fast EMA period',
        min: 5,
        max: 20,
        step: 1,
        default: 12,
        showByDefault: true,
      },
      {
        key: 'slowPeriod',
        type: 'slider',
        label: 'Slow Period',
        help: 'Slow EMA period',
        min: 20,
        max: 40,
        step: 1,
        default: 26,
        showByDefault: true,
      },
      {
        key: 'signalPeriod',
        type: 'slider',
        label: 'Signal Period',
        help: 'Signal line EMA period',
        min: 5,
        max: 15,
        step: 1,
        default: 9,
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
    recommendedYears: 5,
    tags: ['momentum', 'macd', 'crossover'],
  },

  /**
   * Pairs Trading Strategy
   * Mean reversion on spread between two correlated symbols
   * MULTI-SYMBOL: Requires two symbols
   */
  'pairs-trading': {
    id: 'pairs-trading',
    name: 'Pairs Trading',
    description: 'Trade mean reversion on the spread between two correlated assets',
    category: 'multi-symbol',
    create: (p) => new PairsTradingStrategy(p),
    defaults: {
      symbol1: 'SPY',
      symbol2: 'IWM',
      lookbackPeriod: 20,
      entryThreshold: 2.0,
      exitThreshold: 0.5,
      positionSize: 0.475, // 47.5% each = 95% total
    },
    fields: [
      {
        key: 'symbol1',
        type: 'symbol',
        label: 'Symbol 1',
        help: 'First symbol of the pair (e.g., SPY)',
        showByDefault: true,
      },
      {
        key: 'symbol2',
        type: 'symbol',
        label: 'Symbol 2',
        help: 'Second symbol of the pair (e.g., IWM)',
        showByDefault: true,
      },
      {
        key: 'lookbackPeriod',
        type: 'slider',
        label: 'Lookback Period',
        help: 'Period for spread calculation',
        min: 10,
        max: 60,
        step: 5,
        default: 20,
        showByDefault: true,
      },
      {
        key: 'entryThreshold',
        type: 'slider',
        label: 'Entry Threshold (σ)',
        help: 'Standard deviations to trigger entry',
        min: 1,
        max: 3,
        step: 0.5,
        default: 2.0,
        showByDefault: true,
      },
      {
        key: 'exitThreshold',
        type: 'slider',
        label: 'Exit Threshold (σ)',
        help: 'Standard deviations to trigger exit',
        min: 0,
        max: 1.5,
        step: 0.25,
        default: 0.5,
        showByDefault: true,
      },
      {
        key: 'positionSize',
        type: 'percent',
        label: 'Position Size (per side)',
        help: 'Percentage of capital for each leg',
        default: 0.475,
        showByDefault: false,
      },
    ],
    validation: (p) =>
      p.exitThreshold >= p.entryThreshold
        ? 'Exit threshold must be less than entry threshold'
        : null,
    recommendedYears: 5,
    tags: ['pairs', 'mean-reversion', 'multi-symbol', 'advanced'],
  },
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
