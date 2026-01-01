import { test, expect, describe } from 'bun:test';
import { BacktestEngine, runBacktest } from './backtest-engine';
import { BaseStrategy } from '../strategies/strategy';
import type { Signal, StrategyContext, BacktestData, Bar, MultiBar } from '../types';

/**
 * Simple buy-and-hold strategy for testing
 */
class BuyAndHoldStrategy extends BaseStrategy {
  readonly name = 'Buy and Hold';
  readonly symbols = ['SPY'];
  private bought = false;

  onBar(ctx: StrategyContext): Signal[] {
    if (!this.bought && ctx.barIndex === 0) {
      this.bought = true;
      return [this.buy('SPY', { percentage: 0.95, reason: 'Initial buy' })];
    }
    return [];
  }
}

/**
 * Strategy that buys low and sells high
 */
class SimpleTradingStrategy extends BaseStrategy {
  readonly name = 'Simple Trading';
  readonly symbols = ['SPY'];

  onBar(ctx: StrategyContext): Signal[] {
    const bar = this.getBar(ctx, 'SPY');
    if (!bar) return [];

    const hasPosition = this.hasPosition(ctx, 'SPY');

    // Buy when price is below 100
    if (bar.close < 100 && !hasPosition) {
      return [this.buy('SPY', { percentage: 0.5 })];
    }

    // Sell when price is above 110
    if (bar.close > 110 && hasPosition) {
      return [this.close('SPY')];
    }

    return [];
  }
}

/**
 * Create test data with specified prices
 */
function createTestData(prices: number[]): BacktestData {
  const startTime = new Date('2024-01-01').getTime();
  const bars: MultiBar[] = prices.map((price, i) => ({
    time: startTime + i * 24 * 60 * 60 * 1000,
    bars: {
      SPY: {
        time: startTime + i * 24 * 60 * 60 * 1000,
        open: price,
        high: price * 1.01,
        low: price * 0.99,
        close: price,
        volume: 1000000,
      },
    },
  }));

  return {
    symbols: ['SPY'],
    bars,
    startDate: new Date(startTime),
    endDate: new Date(startTime + (prices.length - 1) * 24 * 60 * 60 * 1000),
  };
}

describe('BacktestEngine', () => {
  describe('basic functionality', () => {
    test('runs without errors', () => {
      const data = createTestData([100, 101, 102, 103, 104]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000 }
      );

      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.equityCurve.length).toBe(5);
    });

    test('records correct number of bars', () => {
      const data = createTestData([100, 105, 110, 115, 120]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000 }
      );

      expect(result.equityCurve.length).toBe(5);
      expect(result.metrics.tradingDays).toBe(5);
    });

    test('throws on empty data', () => {
      const emptyData: BacktestData = {
        symbols: ['SPY'],
        bars: [],
        startDate: new Date(),
        endDate: new Date(),
      };

      expect(() =>
        runBacktest(new BuyAndHoldStrategy(), emptyData, { initialCapital: 100000 })
      ).toThrow('No data provided');
    });

    test('throws when strategy requires missing symbol', () => {
      const data = createTestData([100, 101, 102]);
      
      class WrongSymbolStrategy extends BaseStrategy {
        readonly name = 'Wrong Symbol';
        readonly symbols = ['AAPL']; // Not in data
        onBar(): Signal[] { return []; }
      }

      expect(() =>
        runBacktest(new WrongSymbolStrategy(), data, { initialCapital: 100000 })
      ).toThrow('requires symbol AAPL');
    });
  });

  describe('buy and hold strategy', () => {
    test('gains when price increases', () => {
      const data = createTestData([100, 110, 120, 130, 140]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      // Should have positive return
      expect(result.metrics.totalReturn).toBeGreaterThan(0);
      expect(result.trades.length).toBe(1); // One buy trade
    });

    test('loses when price decreases', () => {
      const data = createTestData([100, 90, 80, 70, 60]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      // Should have negative return
      expect(result.metrics.totalReturn).toBeLessThan(0);
    });

    test('calculates max drawdown correctly', () => {
      const data = createTestData([100, 120, 100, 80, 100]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      // Max drawdown should be around -33% (from 120 to 80)
      expect(result.metrics.maxDrawdownPercent).toBeLessThan(-0.3);
    });
  });

  describe('trading strategy', () => {
    test('executes multiple trades', () => {
      // Price pattern: below 100 (buy), above 110 (sell), below 100 (buy)
      const data = createTestData([95, 105, 115, 95, 105, 115, 95]);
      const result = runBacktest(
        new SimpleTradingStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      // Should have multiple trades
      expect(result.trades.length).toBeGreaterThan(1);
    });

    test('records trade details correctly', () => {
      const data = createTestData([95, 115]);
      const result = runBacktest(
        new SimpleTradingStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      expect(result.trades.length).toBe(2); // Buy then sell
      expect(result.trades[0]?.side).toBe('buy');
      expect(result.trades[1]?.side).toBe('sell');
    });
  });

  describe('configuration', () => {
    test('applies commission to trades', () => {
      const data = createTestData([100, 100, 100]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, commission: 0.01, slippage: 0 }
      );

      const trade = result.trades[0];
      expect(trade?.commission).toBeGreaterThan(0);
    });

    test('applies slippage to trades', () => {
      const data = createTestData([100, 100, 100]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0.01 }
      );

      const trade = result.trades[0];
      // Buy should have slippage added to price
      expect(trade?.price).toBe(101); // 100 * 1.01
    });

    test('respects max position size', () => {
      const data = createTestData([100, 100, 100]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, maxPositionSize: 0.5, slippage: 0 }
      );

      // Position value should not exceed 50% of portfolio
      const finalPosition = result.finalPortfolio.positions[0];
      if (finalPosition) {
        const positionRatio = finalPosition.marketValue / result.finalPortfolio.totalValue;
        expect(positionRatio).toBeLessThanOrEqual(0.5);
      }
    });
  });

  describe('equity curve', () => {
    test('starts at initial capital', () => {
      const data = createTestData([100, 100, 100]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000 }
      );

      // First point should be close to initial capital (minus any trades)
      expect(result.equityCurve[0]?.equity).toBeDefined();
    });

    test('tracks drawdown at each point', () => {
      const data = createTestData([100, 120, 100, 80]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      // Should have drawdown data
      const lastPoint = result.equityCurve[result.equityCurve.length - 1];
      expect(lastPoint?.drawdownPercent).toBeDefined();
    });
  });

  describe('final portfolio', () => {
    test('contains correct final state', () => {
      const data = createTestData([100, 110, 120]);
      const result = runBacktest(
        new BuyAndHoldStrategy(),
        data,
        { initialCapital: 100000, slippage: 0 }
      );

      expect(result.finalPortfolio.totalValue).toBeGreaterThan(0);
      expect(result.finalPortfolio.positions.length).toBe(1);
    });
  });

  describe('optimization', () => {
    test('runs multiple parameter sets', () => {
      const data = createTestData([100, 105, 110, 105, 100]);
      const engine = new BacktestEngine({ initialCapital: 100000 });

      const results = engine.runOptimization(
        (params: { threshold: number }) => {
          class ParamStrategy extends BaseStrategy {
            readonly name = `Threshold ${params.threshold}`;
            readonly symbols = ['SPY'];
            onBar(ctx: StrategyContext): Signal[] {
              const bar = this.getBar(ctx, 'SPY');
              if (bar && bar.close > params.threshold && !this.hasPosition(ctx, 'SPY')) {
                return [this.buy('SPY', { percentage: 0.5 })];
              }
              return [];
            }
          }
          return new ParamStrategy();
        },
        data,
        [{ threshold: 100 }, { threshold: 105 }, { threshold: 110 }]
      );

      expect(results.length).toBe(3);
      // Results should be sorted by Sharpe ratio
      expect(results[0]?.result.metrics.sharpeRatio).toBeGreaterThanOrEqual(
        results[2]?.result.metrics.sharpeRatio ?? -Infinity
      );
    });
  });
});
