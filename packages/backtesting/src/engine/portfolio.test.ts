import { test, expect, describe, beforeEach } from 'bun:test';
import { Portfolio } from './portfolio';
import type { BacktestConfig, Bar } from '../types';

const defaultConfig: BacktestConfig = {
  initialCapital: 100000,
  commission: 0,
  commissionPercent: 0,
  slippage: 0,
  maxPositionSize: 1,
  allowShort: false,
  marginRequirement: 1.5,
};

describe('Portfolio', () => {
  let portfolio: Portfolio;

  beforeEach(() => {
    portfolio = new Portfolio(defaultConfig);
  });

  describe('initialization', () => {
    test('starts with initial capital as cash', () => {
      expect(portfolio.getCash()).toBe(100000);
    });

    test('starts with no positions', () => {
      expect(portfolio.getPositions()).toHaveLength(0);
    });

    test('total value equals initial capital', () => {
      expect(portfolio.getTotalValue()).toBe(100000);
    });
  });

  describe('buying', () => {
    test('executes buy order and updates cash', () => {
      const trade = portfolio.executeBuy('AAPL', 100, 150, 0, 0);

      expect(trade).not.toBeNull();
      expect(trade?.symbol).toBe('AAPL');
      expect(trade?.side).toBe('buy');
      expect(trade?.quantity).toBe(100);
      expect(trade?.price).toBe(150);
      expect(portfolio.getCash()).toBe(85000); // 100000 - 15000
    });

    test('creates position after buy', () => {
      portfolio.executeBuy('AAPL', 100, 150, 0, 0);

      const position = portfolio.getPosition('AAPL');
      expect(position).toBeDefined();
      expect(position?.quantity).toBe(100);
      expect(position?.averageCost).toBe(150);
    });

    test('rejects buy when insufficient cash', () => {
      const trade = portfolio.executeBuy('AAPL', 1000, 150, 0, 0);
      expect(trade).toBeNull();
      expect(portfolio.getCash()).toBe(100000);
    });

    test('applies slippage to buy price', () => {
      const trade = portfolio.executeBuy('AAPL', 100, 100, 0, 0.01);

      expect(trade?.price).toBe(101); // 100 * 1.01
      expect(portfolio.getCash()).toBe(89900); // 100000 - 10100
    });

    test('deducts commission from cash', () => {
      const trade = portfolio.executeBuy('AAPL', 100, 100, 10, 0);

      expect(portfolio.getCash()).toBe(89990); // 100000 - 10000 - 10
    });

    test('averages cost when adding to position', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      portfolio.executeBuy('AAPL', 100, 200, 0, 0);

      const position = portfolio.getPosition('AAPL');
      expect(position?.quantity).toBe(200);
      expect(position?.averageCost).toBe(150); // (100*100 + 100*200) / 200
    });
  });

  describe('selling', () => {
    beforeEach(() => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
    });

    test('executes sell order and updates cash', () => {
      const trade = portfolio.executeSell('AAPL', 50, 120, 0, 0);

      expect(trade).not.toBeNull();
      expect(trade?.symbol).toBe('AAPL');
      expect(trade?.side).toBe('sell');
      expect(trade?.quantity).toBe(50);
      expect(portfolio.getCash()).toBe(96000); // 90000 + 6000
    });

    test('reduces position after sell', () => {
      portfolio.executeSell('AAPL', 50, 120, 0, 0);

      const position = portfolio.getPosition('AAPL');
      expect(position?.quantity).toBe(50);
    });

    test('removes position when fully sold', () => {
      portfolio.executeSell('AAPL', 100, 120, 0, 0);

      const position = portfolio.getPosition('AAPL');
      expect(position).toBeUndefined();
    });

    test('applies slippage to sell price', () => {
      const trade = portfolio.executeSell('AAPL', 100, 100, 0, 0.01);

      expect(trade?.price).toBe(99); // 100 * 0.99
    });

    test('rejects sell without position when short not allowed', () => {
      const trade = portfolio.executeSell('MSFT', 100, 200, 0, 0);
      expect(trade).toBeNull();
    });
  });

  describe('closing positions', () => {
    test('closes entire long position', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      const trade = portfolio.closePosition('AAPL', 120, 0, 0);

      expect(trade).not.toBeNull();
      expect(trade?.side).toBe('sell');
      expect(trade?.quantity).toBe(100);
      expect(portfolio.getPosition('AAPL')).toBeUndefined();
    });

    test('returns null when no position to close', () => {
      const trade = portfolio.closePosition('AAPL', 100, 0, 0);
      expect(trade).toBeNull();
    });
  });

  describe('total value calculation', () => {
    test('includes cash and position values', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      portfolio.updatePrices({ AAPL: { time: 0, open: 120, high: 125, low: 115, close: 120 } });

      expect(portfolio.getTotalValue()).toBe(102000); // 90000 cash + 12000 position
    });

    test('reflects unrealized gains', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      portfolio.updatePrices({ AAPL: { time: 0, open: 150, high: 155, low: 145, close: 150 } });

      const position = portfolio.getPosition('AAPL');
      expect(position?.unrealizedPnL).toBe(5000); // (150-100) * 100
    });

    test('reflects unrealized losses', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      portfolio.updatePrices({ AAPL: { time: 0, open: 80, high: 85, low: 75, close: 80 } });

      const position = portfolio.getPosition('AAPL');
      expect(position?.unrealizedPnL).toBe(-2000); // (80-100) * 100
    });
  });

  describe('drawdown tracking', () => {
    test('tracks peak equity', () => {
      portfolio.executeBuy('AAPL', 100, 100, 0, 0);
      
      // Price goes up
      portfolio.updatePrices({ AAPL: { time: 0, open: 150, high: 155, low: 145, close: 150 } });
      expect(portfolio.getTotalValue()).toBe(105000);

      // Price drops
      portfolio.updatePrices({ AAPL: { time: 0, open: 120, high: 125, low: 115, close: 120 } });
      
      const { drawdown, drawdownPercent } = portfolio.getDrawdown();
      expect(drawdown).toBe(-3000); // 102000 - 105000
      expect(drawdownPercent).toBeCloseTo(-0.0286, 3); // -3000 / 105000
    });
  });

  describe('percentage-based orders', () => {
    test('calculates quantity from portfolio percentage', () => {
      const quantity = portfolio.calculateQuantityFromPercentage('AAPL', 0.5, 100);
      expect(quantity).toBe(500); // 50000 / 100
    });

    test('rounds down to whole shares', () => {
      const quantity = portfolio.calculateQuantityFromPercentage('AAPL', 0.5, 33);
      expect(quantity).toBe(1515); // floor(50000 / 33)
    });
  });

  describe('max position size', () => {
    test('detects when order would exceed max position', () => {
      const config = { ...defaultConfig, maxPositionSize: 0.25 };
      const portfolio = new Portfolio(config);

      // 50% position would exceed 25% max
      expect(portfolio.wouldExceedMaxPosition('AAPL', 500, 100)).toBe(true);

      // 20% position is fine
      expect(portfolio.wouldExceedMaxPosition('AAPL', 200, 100)).toBe(false);
    });
  });
});
