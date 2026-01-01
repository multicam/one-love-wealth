import { test, expect, describe } from 'bun:test';
import { BaseStrategy } from './strategy';
import type { Signal, StrategyContext, BacktestConfig, MultiBar } from '../types';

/**
 * Test strategy implementation
 */
class TestStrategy extends BaseStrategy {
  readonly name = 'Test Strategy';
  readonly symbols = ['SPY'];

  onBar(ctx: StrategyContext): Signal[] {
    return [];
  }

  // Expose protected methods for testing
  public testSma(values: number[], period: number) {
    return this.sma(values, period);
  }

  public testEma(values: number[], period: number) {
    return this.ema(values, period);
  }

  public testRsi(values: number[], period: number) {
    return this.rsi(values, period);
  }

  public testBuy(symbol: string, options?: { quantity?: number; percentage?: number; reason?: string }) {
    return this.buy(symbol, options);
  }

  public testSell(symbol: string, options?: { quantity?: number; percentage?: number; reason?: string }) {
    return this.sell(symbol, options);
  }

  public testClose(symbol: string, reason?: string) {
    return this.close(symbol, reason);
  }
}

describe('BaseStrategy', () => {
  const strategy = new TestStrategy();

  describe('SMA calculation', () => {
    test('calculates simple moving average', () => {
      const values = [10, 20, 30, 40, 50];
      expect(strategy.testSma(values, 3)).toBe(40); // (30+40+50)/3
    });

    test('returns undefined for insufficient data', () => {
      const values = [10, 20];
      expect(strategy.testSma(values, 3)).toBeUndefined();
    });

    test('handles exact period length', () => {
      const values = [10, 20, 30];
      expect(strategy.testSma(values, 3)).toBe(20);
    });
  });

  describe('EMA calculation', () => {
    test('calculates exponential moving average', () => {
      const values = [10, 20, 30, 40, 50];
      const ema = strategy.testEma(values, 3);
      expect(ema).toBeDefined();
      expect(ema).toBeGreaterThan(35); // EMA weights recent values more
    });

    test('returns undefined for insufficient data', () => {
      const values = [10, 20];
      expect(strategy.testEma(values, 3)).toBeUndefined();
    });
  });

  describe('RSI calculation', () => {
    test('calculates RSI for uptrend', () => {
      // Strong uptrend should have high RSI
      const values = Array.from({ length: 20 }, (_, i) => 100 + i * 2);
      const rsi = strategy.testRsi(values, 14);
      expect(rsi).toBeDefined();
      expect(rsi!).toBeGreaterThan(70);
    });

    test('calculates RSI for downtrend', () => {
      // Strong downtrend should have low RSI
      const values = Array.from({ length: 20 }, (_, i) => 100 - i * 2);
      const rsi = strategy.testRsi(values, 14);
      expect(rsi).toBeDefined();
      expect(rsi!).toBeLessThan(30);
    });

    test('returns undefined for insufficient data', () => {
      const values = [10, 20, 30];
      expect(strategy.testRsi(values, 14)).toBeUndefined();
    });

    test('RSI is bounded between 0 and 100', () => {
      const values = Array.from({ length: 30 }, (_, i) => 100 + Math.random() * 10);
      const rsi = strategy.testRsi(values, 14);
      expect(rsi).toBeDefined();
      expect(rsi!).toBeGreaterThanOrEqual(0);
      expect(rsi!).toBeLessThanOrEqual(100);
    });
  });

  describe('signal creation', () => {
    test('creates buy signal', () => {
      const signal = strategy.testBuy('SPY', { percentage: 0.5, reason: 'Test' });
      expect(signal.type).toBe('buy');
      expect(signal.symbol).toBe('SPY');
      expect(signal.percentage).toBe(0.5);
      expect(signal.reason).toBe('Test');
    });

    test('creates sell signal', () => {
      const signal = strategy.testSell('SPY', { quantity: 100 });
      expect(signal.type).toBe('sell');
      expect(signal.symbol).toBe('SPY');
      expect(signal.quantity).toBe(100);
    });

    test('creates close signal', () => {
      const signal = strategy.testClose('SPY', 'Take profit');
      expect(signal.type).toBe('close');
      expect(signal.symbol).toBe('SPY');
      expect(signal.reason).toBe('Take profit');
    });
  });
});
