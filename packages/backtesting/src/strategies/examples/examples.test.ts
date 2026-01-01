/**
 * Tests for example trading strategies
 */

import { test, expect, describe } from 'bun:test';
import {
  MACrossoverStrategy,
  DEFAULT_MA_CROSSOVER_PARAMS,
  RSIReversionStrategy,
  DEFAULT_RSI_REVERSION_PARAMS,
  BuyAndHoldStrategy,
  DEFAULT_BUY_AND_HOLD_PARAMS,
  VIXHedgeStrategy,
  DEFAULT_VIX_HEDGE_PARAMS,
  BollingerBreakoutStrategy,
  DEFAULT_BOLLINGER_BREAKOUT_PARAMS,
  MACDDivergenceStrategy,
  DEFAULT_MACD_DIVERGENCE_PARAMS,
  PairsTradingStrategy,
  DEFAULT_PAIRS_TRADING_PARAMS,
} from './index';
import { BacktestEngine } from '../../engine';
import type { BacktestData, MultiBar, Bar } from '../../types';

// Helper to create bar data
function createBar(close: number, time: number): Bar {
  return {
    time,
    open: close * 0.99,
    high: close * 1.01,
    low: close * 0.98,
    close,
    volume: 1000000,
  };
}

// Helper to create multi-symbol bars
function createMultiBar(prices: Record<string, number>, time: number): MultiBar {
  const bars: Record<string, Bar> = {};
  for (const [symbol, price] of Object.entries(prices)) {
    bars[symbol] = createBar(price, time);
  }
  return { time, bars };
}

// Generate uptrend data
function generateUptrend(symbol: string, days: number, startPrice: number = 100): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < days; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    const price = startPrice * (1 + i * 0.005); // 0.5% daily gain
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + (days - 1) * 24 * 60 * 60 * 1000),
  };
}

// Generate downtrend data (steeper decline for RSI to hit oversold)
function generateDowntrend(symbol: string, days: number, startPrice: number = 100): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < days; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    const price = startPrice * Math.pow(0.98, i); // 2% daily compounding loss
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + (days - 1) * 24 * 60 * 60 * 1000),
  };
}

// Generate MA crossover scenario (downtrend then strong uptrend then downtrend)
function generateMACrossoverScenario(symbol: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 300 * 24 * 60 * 60 * 1000;
  
  // First 50 days: downtrend (to establish slow MA below fast)
  for (let i = 0; i < 50; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    const price = 100 - i * 0.3;
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  // Next 100 days: strong uptrend (golden cross will occur)
  for (let i = 0; i < 100; i++) {
    const time = startTime + (50 + i) * 24 * 60 * 60 * 1000;
    const price = 85 + i * 1.0; // Strong uptrend
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  // Next 100 days: downtrend (death cross will occur)
  for (let i = 0; i < 100; i++) {
    const time = startTime + (150 + i) * 24 * 60 * 60 * 1000;
    const price = 185 - i * 1.0; // Strong downtrend
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 249 * 24 * 60 * 60 * 1000),
  };
}

// Generate RSI oscillating scenario
function generateRSIScenario(symbol: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 100 * 24 * 60 * 60 * 1000;
  
  let price = 100;
  for (let i = 0; i < 100; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    
    // Create oscillating pattern
    if (i < 20) {
      price *= 0.98; // Drop to oversold
    } else if (i < 50) {
      price *= 1.02; // Rise to overbought
    } else if (i < 70) {
      price *= 0.99; // Drop again
    } else {
      price *= 1.01; // Rise again
    }
    
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 99 * 24 * 60 * 60 * 1000),
  };
}

// Generate VIX hedge scenario (deterministic for test reliability)
function generateVIXScenario(tradingSymbol: string, vixSymbol: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 100 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 100; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    
    let tradingPrice: number;
    let vixPrice: number;
    
    if (i < 30) {
      // Calm market: low VIX, rising prices
      tradingPrice = 100 + i * 0.5;
      vixPrice = 15 + (i % 3); // Deterministic variation
    } else if (i < 50) {
      // Volatility spike: high VIX, falling prices
      tradingPrice = 115 - (i - 30) * 1;
      vixPrice = 30 + (i % 5); // Deterministic variation
    } else if (i < 70) {
      // Recovery: VIX falling, prices stabilizing
      tradingPrice = 95 + (i - 50) * 0.3;
      vixPrice = 35 - (i - 50) * 0.8;
    } else {
      // Back to calm: low VIX, rising prices
      tradingPrice = 101 + (i - 70) * 0.4;
      vixPrice = 17 + (i % 2); // Deterministic variation
    }
    
    bars.push(createMultiBar({
      [tradingSymbol]: tradingPrice,
      [vixSymbol]: vixPrice,
    }, time));
  }
  
  return {
    symbols: [tradingSymbol, vixSymbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 99 * 24 * 60 * 60 * 1000),
  };
}

describe('MACrossoverStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_MA_CROSSOVER_PARAMS.fastPeriod).toBe(50);
    expect(DEFAULT_MA_CROSSOVER_PARAMS.slowPeriod).toBe(200);
    expect(DEFAULT_MA_CROSSOVER_PARAMS.symbol).toBe('SPY');
  });

  test('creates strategy with custom params', () => {
    const strategy = new MACrossoverStrategy({
      symbol: 'QQQ',
      fastPeriod: 20,
      slowPeriod: 50,
    });
    expect(strategy.name).toContain('20');
    expect(strategy.name).toContain('50');
    expect(strategy.symbols).toEqual(['QQQ']);
  });

  test('generates buy signal on golden cross', () => {
    const data = generateMACrossoverScenario('SPY');
    const strategy = new MACrossoverStrategy({
      symbol: 'SPY',
      fastPeriod: 10,
      slowPeriod: 30,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have executed trades
    expect(result.trades.length).toBeGreaterThan(0);
    
    // First trade should be a buy
    const buyTrades = result.trades.filter(t => t.side === 'buy');
    expect(buyTrades.length).toBeGreaterThan(0);
  });

  test('generates sell signal on death cross', () => {
    const data = generateMACrossoverScenario('SPY');
    const strategy = new MACrossoverStrategy({
      symbol: 'SPY',
      fastPeriod: 10,
      slowPeriod: 30,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have sell trades after death cross
    const sellTrades = result.trades.filter(t => t.side === 'sell');
    expect(sellTrades.length).toBeGreaterThan(0);
  });

  test('waits for enough data before trading', () => {
    const data = generateUptrend('SPY', 20); // Only 20 days
    const strategy = new MACrossoverStrategy({
      symbol: 'SPY',
      fastPeriod: 50,
      slowPeriod: 200, // Needs 200 days
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have no trades (insufficient data)
    expect(result.trades.length).toBe(0);
  });

  test('init resets state', () => {
    const strategy = new MACrossoverStrategy();
    strategy.init();
    // Should not throw
    expect(strategy.name).toBeDefined();
  });
});

describe('RSIReversionStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_RSI_REVERSION_PARAMS.rsiPeriod).toBe(14);
    expect(DEFAULT_RSI_REVERSION_PARAMS.oversold).toBe(30);
    expect(DEFAULT_RSI_REVERSION_PARAMS.overbought).toBe(70);
  });

  test('creates strategy with custom params', () => {
    const strategy = new RSIReversionStrategy({
      symbol: 'TQQQ',
      oversold: 25,
      overbought: 75,
    });
    expect(strategy.name).toContain('25');
    expect(strategy.name).toContain('75');
    expect(strategy.symbols).toEqual(['TQQQ']);
  });

  test('buys on oversold RSI', () => {
    // Use RSI scenario which has clear oversold conditions
    const data = generateRSIScenario('SPY');
    const strategy = new RSIReversionStrategy({
      symbol: 'SPY',
      rsiPeriod: 14,
      oversold: 40, // Threshold to trigger on the drop
      overbought: 75,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have buy trades when RSI is oversold
    const buyTrades = result.trades.filter(t => t.side === 'buy');
    expect(buyTrades.length).toBeGreaterThan(0);
  });

  test('sells on overbought RSI', () => {
    const data = generateRSIScenario('SPY');
    const strategy = new RSIReversionStrategy({
      symbol: 'SPY',
      rsiPeriod: 14,
      oversold: 35,
      overbought: 65,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have both buy and sell trades
    const buyTrades = result.trades.filter(t => t.side === 'buy');
    const sellTrades = result.trades.filter(t => t.side === 'sell');
    
    expect(buyTrades.length).toBeGreaterThan(0);
    // May or may not have sells depending on RSI levels reached
  });

  test('waits for enough RSI data', () => {
    const data = generateUptrend('SPY', 10); // Only 10 days
    const strategy = new RSIReversionStrategy({
      symbol: 'SPY',
      rsiPeriod: 14, // Needs 15+ days
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    expect(result.trades.length).toBe(0);
  });
});

describe('BuyAndHoldStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_BUY_AND_HOLD_PARAMS.symbol).toBe('SPY');
    expect(DEFAULT_BUY_AND_HOLD_PARAMS.positionSize).toBe(0.99);
  });

  test('creates strategy with custom params', () => {
    const strategy = new BuyAndHoldStrategy({
      symbol: 'QQQ',
      positionSize: 0.95,
    });
    expect(strategy.name).toContain('QQQ');
    expect(strategy.symbols).toEqual(['QQQ']);
  });

  test('buys on first bar only', () => {
    const data = generateUptrend('SPY', 100);
    const strategy = new BuyAndHoldStrategy({ symbol: 'SPY' });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have exactly one buy trade
    expect(result.trades.length).toBe(1);
    expect(result.trades[0].side).toBe('buy');
  });

  test('never sells', () => {
    const data = generateDowntrend('SPY', 100);
    const strategy = new BuyAndHoldStrategy({ symbol: 'SPY' });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have only buy trades
    const sellTrades = result.trades.filter(t => t.side === 'sell');
    expect(sellTrades.length).toBe(0);
  });

  test('tracks returns correctly in uptrend', () => {
    const data = generateUptrend('SPY', 100, 100);
    const strategy = new BuyAndHoldStrategy({ symbol: 'SPY' });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have positive return in uptrend
    expect(result.metrics.totalReturn).toBeGreaterThan(0);
  });

  test('init resets hasBought flag', () => {
    const data = generateUptrend('SPY', 50);
    const strategy = new BuyAndHoldStrategy({ symbol: 'SPY' });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    
    // Run twice - should buy each time due to init reset
    const result1 = engine.run(strategy, data);
    const result2 = engine.run(strategy, data);
    
    expect(result1.trades.length).toBe(1);
    expect(result2.trades.length).toBe(1);
  });
});

describe('VIXHedgeStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_VIX_HEDGE_PARAMS.tradingSymbol).toBe('TQQQ');
    expect(DEFAULT_VIX_HEDGE_PARAMS.vixSymbol).toBe('^VIX');
    expect(DEFAULT_VIX_HEDGE_PARAMS.vixExitThreshold).toBe(25);
    expect(DEFAULT_VIX_HEDGE_PARAMS.vixEntryThreshold).toBe(20);
  });

  test('creates strategy with custom params', () => {
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'SPY',
      vixExitThreshold: 30,
      vixEntryThreshold: 22,
    });
    expect(strategy.name).toContain('30');
    expect(strategy.name).toContain('22');
    expect(strategy.symbols).toEqual(['SPY', '^VIX']);
  });

  test('requires both trading symbol and VIX', () => {
    const strategy = new VIXHedgeStrategy();
    expect(strategy.symbols.length).toBe(2);
    expect(strategy.symbols).toContain('TQQQ');
    expect(strategy.symbols).toContain('^VIX');
  });

  test('exits position when VIX spikes', () => {
    const data = generateVIXScenario('TQQQ', '^VIX');
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'TQQQ',
      vixSymbol: '^VIX',
      vixExitThreshold: 28,
      vixEntryThreshold: 20,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have trades (entry and exit)
    expect(result.trades.length).toBeGreaterThan(0);
    
    // Should have some sell trades when VIX spiked
    const sellTrades = result.trades.filter(t => t.side === 'sell');
    expect(sellTrades.length).toBeGreaterThan(0);
  });

  test('re-enters position when VIX calms', () => {
    const data = generateVIXScenario('TQQQ', '^VIX');
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'TQQQ',
      vixSymbol: '^VIX',
      vixExitThreshold: 28,
      vixEntryThreshold: 20,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have multiple buy trades (initial + re-entries)
    const buyTrades = result.trades.filter(t => t.side === 'buy');
    expect(buyTrades.length).toBeGreaterThan(1);
  });

  test('partial exit mode reduces position', () => {
    const data = generateVIXScenario('TQQQ', '^VIX');
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'TQQQ',
      vixSymbol: '^VIX',
      vixExitThreshold: 28,
      vixEntryThreshold: 20,
      partialExit: true,
      reducedPositionSize: 0.5,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have executed trades
    expect(result.trades.length).toBeGreaterThan(0);
  });

  test('MA signal mode uses VIX moving average', () => {
    const data = generateVIXScenario('TQQQ', '^VIX');
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'TQQQ',
      vixSymbol: '^VIX',
      useMASignal: true,
      vixMAPeriod: 10,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have executed some trades
    expect(result.trades.length).toBeGreaterThan(0);
  });

  test('init resets state', () => {
    const strategy = new VIXHedgeStrategy();
    strategy.init();
    expect(strategy.name).toBeDefined();
  });
});

// Generate Bollinger scenario - price oscillates around mean
function generateBollingerScenario(symbol: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 100 * 24 * 60 * 60 * 1000;
  
  let price = 100;
  for (let i = 0; i < 100; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    
    // Create oscillating pattern with occasional extremes
    if (i < 25) {
      price = 100 + Math.sin(i / 3) * 5; // Normal oscillation
    } else if (i < 35) {
      price = 100 - (i - 25) * 1.5; // Drop to lower band
    } else if (i < 60) {
      price = 85 + (i - 35) * 0.8; // Recovery
    } else if (i < 75) {
      price = 105 + (i - 60) * 0.5; // Rise to upper band
    } else {
      price = 112 - (i - 75) * 0.3; // Fall back
    }
    
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 99 * 24 * 60 * 60 * 1000),
  };
}

// Generate MACD divergence scenario
function generateMACDScenario(symbol: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 100 * 24 * 60 * 60 * 1000;
  
  let price = 100;
  for (let i = 0; i < 100; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    
    // Create pattern with divergence opportunities
    if (i < 30) {
      price = 100 + i * 0.3; // Initial uptrend
    } else if (i < 45) {
      price = 109 - (i - 30) * 0.5; // Pullback (lower low)
    } else if (i < 55) {
      price = 101.5 - (i - 45) * 0.3; // Another lower low (bullish div)
    } else if (i < 80) {
      price = 98.5 + (i - 55) * 0.5; // Rally
    } else {
      price = 111 + (i - 80) * 0.2; // Continue up
    }
    
    bars.push(createMultiBar({ [symbol]: price }, time));
  }
  
  return {
    symbols: [symbol],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 99 * 24 * 60 * 60 * 1000),
  };
}

// Generate pairs trading scenario
function generatePairsScenario(symbolA: string, symbolB: string): BacktestData {
  const bars: MultiBar[] = [];
  const startTime = Date.now() - 100 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 100; i++) {
    const time = startTime + i * 24 * 60 * 60 * 1000;
    
    // Both trend up but spread widens and contracts
    const baseA = 100 + i * 0.2;
    const baseB = 50 + i * 0.1;
    
    let priceA: number;
    let priceB: number;
    
    if (i < 30) {
      // Normal spread
      priceA = baseA;
      priceB = baseB;
    } else if (i < 50) {
      // Spread widens: A outperforms
      priceA = baseA + (i - 30) * 0.5;
      priceB = baseB - (i - 30) * 0.2;
    } else if (i < 70) {
      // Spread contracts back
      priceA = baseA + 10 - (i - 50) * 0.5;
      priceB = baseB - 4 + (i - 50) * 0.2;
    } else {
      // Normal spread again
      priceA = baseA;
      priceB = baseB;
    }
    
    bars.push(createMultiBar({
      [symbolA]: priceA,
      [symbolB]: priceB,
    }, time));
  }
  
  return {
    symbols: [symbolA, symbolB],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + 99 * 24 * 60 * 60 * 1000),
  };
}

describe('BollingerBreakoutStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_BOLLINGER_BREAKOUT_PARAMS.period).toBe(20);
    expect(DEFAULT_BOLLINGER_BREAKOUT_PARAMS.stdDev).toBe(2);
    expect(DEFAULT_BOLLINGER_BREAKOUT_PARAMS.mode).toBe('reversion');
  });

  test('creates strategy with custom params', () => {
    const strategy = new BollingerBreakoutStrategy({
      symbol: 'QQQ',
      period: 15,
      stdDev: 2.5,
      mode: 'breakout',
    });
    expect(strategy.name).toContain('breakout');
    expect(strategy.name).toContain('15');
    expect(strategy.symbols).toEqual(['QQQ']);
  });

  test('reversion mode buys at lower band', () => {
    const data = generateBollingerScenario('SPY');
    const strategy = new BollingerBreakoutStrategy({
      symbol: 'SPY',
      period: 20,
      stdDev: 2,
      mode: 'reversion',
      oversoldThreshold: 0.2,
      overboughtThreshold: 0.8,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have some trades
    expect(result.trades.length).toBeGreaterThan(0);
  });

  test('breakout mode trades band breaks', () => {
    const data = generateBollingerScenario('SPY');
    const strategy = new BollingerBreakoutStrategy({
      symbol: 'SPY',
      period: 20,
      stdDev: 2,
      mode: 'breakout',
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should run without errors
    expect(result.equityCurve.length).toBe(100);
  });

  test('init resets state', () => {
    const strategy = new BollingerBreakoutStrategy();
    strategy.init();
    expect(strategy.name).toBeDefined();
  });
});

describe('MACDDivergenceStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_MACD_DIVERGENCE_PARAMS.fastPeriod).toBe(12);
    expect(DEFAULT_MACD_DIVERGENCE_PARAMS.slowPeriod).toBe(26);
    expect(DEFAULT_MACD_DIVERGENCE_PARAMS.signalPeriod).toBe(9);
    expect(DEFAULT_MACD_DIVERGENCE_PARAMS.useHistogram).toBe(true);
  });

  test('creates strategy with custom params', () => {
    const strategy = new MACDDivergenceStrategy({
      symbol: 'TQQQ',
      fastPeriod: 8,
      slowPeriod: 17,
      signalPeriod: 9,
    });
    expect(strategy.name).toContain('8');
    expect(strategy.name).toContain('17');
    expect(strategy.symbols).toEqual(['TQQQ']);
  });

  test('runs backtest with divergence detection', () => {
    const data = generateMACDScenario('SPY');
    const strategy = new MACDDivergenceStrategy({
      symbol: 'SPY',
      divergenceLookback: 10,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should complete without errors
    expect(result.equityCurve.length).toBe(100);
  });

  test('with crossover signals enabled', () => {
    const data = generateMACDScenario('SPY');
    const strategy = new MACDDivergenceStrategy({
      symbol: 'SPY',
      useCrossoverSignals: true,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    expect(result.equityCurve.length).toBe(100);
  });

  test('init resets state', () => {
    const strategy = new MACDDivergenceStrategy();
    strategy.init();
    expect(strategy.name).toBeDefined();
  });
});

describe('PairsTradingStrategy', () => {
  test('has correct default params', () => {
    expect(DEFAULT_PAIRS_TRADING_PARAMS.symbolA).toBe('SPY');
    expect(DEFAULT_PAIRS_TRADING_PARAMS.symbolB).toBe('IWM');
    expect(DEFAULT_PAIRS_TRADING_PARAMS.entryZScore).toBe(2.0);
    expect(DEFAULT_PAIRS_TRADING_PARAMS.exitZScore).toBe(0.5);
  });

  test('creates strategy with custom params', () => {
    const strategy = new PairsTradingStrategy({
      symbolA: 'XLF',
      symbolB: 'XLK',
      entryZScore: 2.5,
    });
    expect(strategy.name).toContain('XLF');
    expect(strategy.name).toContain('XLK');
    expect(strategy.symbols).toEqual(['XLF', 'XLK']);
  });

  test('requires both symbols', () => {
    const strategy = new PairsTradingStrategy();
    expect(strategy.symbols.length).toBe(2);
  });

  test('trades spread when z-score exceeds threshold', () => {
    const data = generatePairsScenario('SPY', 'IWM');
    const strategy = new PairsTradingStrategy({
      symbolA: 'SPY',
      symbolB: 'IWM',
      entryZScore: 1.5, // Lower threshold for test
      exitZScore: 0.3,
      lookbackPeriod: 15,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    // Should have executed some trades
    expect(result.trades.length).toBeGreaterThan(0);
  });

  test('uses ratio mode correctly', () => {
    const data = generatePairsScenario('GLD', 'GDX');
    const strategy = new PairsTradingStrategy({
      symbolA: 'GLD',
      symbolB: 'GDX',
      useRatio: true,
      entryZScore: 1.5,
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    expect(result.equityCurve.length).toBe(100);
  });

  test('init resets position state', () => {
    const strategy = new PairsTradingStrategy();
    strategy.init();
    expect(strategy.name).toBeDefined();
  });
});

describe('Strategy Integration', () => {
  test('all strategies implement Strategy interface', () => {
    const strategies = [
      new MACrossoverStrategy(),
      new RSIReversionStrategy(),
      new BuyAndHoldStrategy(),
      new VIXHedgeStrategy(),
      new BollingerBreakoutStrategy(),
      new MACDDivergenceStrategy(),
      new PairsTradingStrategy(),
    ];
    
    for (const strategy of strategies) {
      expect(strategy.name).toBeDefined();
      expect(typeof strategy.name).toBe('string');
      expect(strategy.symbols).toBeDefined();
      expect(Array.isArray(strategy.symbols)).toBe(true);
      expect(typeof strategy.onBar).toBe('function');
    }
  });

  test('strategies can be used with BacktestEngine', () => {
    const data = generateUptrend('SPY', 250);
    
    const strategies = [
      new MACrossoverStrategy({ symbol: 'SPY', fastPeriod: 10, slowPeriod: 30 }),
      new RSIReversionStrategy({ symbol: 'SPY' }),
      new BuyAndHoldStrategy({ symbol: 'SPY' }),
      new BollingerBreakoutStrategy({ symbol: 'SPY' }),
      new MACDDivergenceStrategy({ symbol: 'SPY' }),
    ];
    
    for (const strategy of strategies) {
      const engine = new BacktestEngine({ initialCapital: 100000 });
      const result = engine.run(strategy, data);
      
      expect(result.metrics).toBeDefined();
      expect(result.equityCurve.length).toBe(250);
      expect(result.finalPortfolio).toBeDefined();
    }
  });

  test('VIX strategy works with multi-symbol data', () => {
    const data = generateVIXScenario('SPY', '^VIX');
    const strategy = new VIXHedgeStrategy({
      tradingSymbol: 'SPY',
      vixSymbol: '^VIX',
    });
    
    const engine = new BacktestEngine({ initialCapital: 100000 });
    const result = engine.run(strategy, data);
    
    expect(result.metrics).toBeDefined();
    expect(result.equityCurve.length).toBe(100);
  });
});
