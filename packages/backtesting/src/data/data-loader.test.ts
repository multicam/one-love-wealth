/**
 * Tests for BacktestDataLoader
 */

import { test, expect, describe, mock, beforeEach, afterEach } from 'bun:test';
import {
  BacktestDataLoader,
  loadBacktestData,
  loadSymbol,
  type DataLoaderConfig,
} from './data-loader';

// Mock fetch to avoid real API calls
let originalFetch: typeof global.fetch;

/**
 * Create mock Yahoo Finance response
 */
function createMockYahooResponse(symbol: string, prices: number[], startTime: number = Date.now() - 30 * 24 * 60 * 60 * 1000) {
  const timestamps: number[] = [];
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  const volumes: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    timestamps.push(Math.floor((startTime + i * 24 * 60 * 60 * 1000) / 1000)); // Yahoo uses seconds
    const price = prices[i];
    opens.push(price * 0.99);
    highs.push(price * 1.02);
    lows.push(price * 0.98);
    closes.push(price);
    volumes.push(1000000 + Math.floor(Math.random() * 500000));
  }

  return {
    chart: {
      result: [{
        meta: { symbol },
        timestamp: timestamps,
        indicators: {
          quote: [{
            open: opens,
            high: highs,
            low: lows,
            close: closes,
            volume: volumes,
          }],
        },
      }],
    },
  };
}

/**
 * Create mock fetch that returns symbol-specific data
 */
function createMockFetch(symbolData: Record<string, number[]>, startTime?: number) {
  return mock((input: string | URL | Request) => {
    const url = input instanceof Request ? input.url : input.toString();
    
    // Extract symbol from Yahoo URL pattern: /chart/{symbol}
    const symbolMatch = url.match(/\/chart\/([^?]+)/);
    const symbol = symbolMatch ? symbolMatch[1] : 'UNKNOWN';
    
    const prices = symbolData[symbol] || [100, 101, 102, 103, 104];
    const response = createMockYahooResponse(symbol, prices, startTime);
    
    return Promise.resolve(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  });
}

describe('BacktestDataLoader', () => {
  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('single symbol loading', () => {
    test('loads single symbol data', async () => {
      const prices = [100, 105, 110, 108, 112];
      global.fetch = createMockFetch({ 'SPY': prices });

      const loader = new BacktestDataLoader();
      const result = await loader.loadSingle('SPY', '1mo');

      expect(result.data.symbols).toEqual(['SPY']);
      expect(result.data.bars.length).toBe(prices.length);
      expect(result.stats.totalBars).toBe(prices.length);
    });

    test('converts data points to correct Bar format', async () => {
      const prices = [100, 110];
      global.fetch = createMockFetch({ 'AAPL': prices });

      const loader = new BacktestDataLoader();
      const result = await loader.loadSingle('AAPL', '1mo');

      const firstBar = result.data.bars[0].bars['AAPL'];
      expect(firstBar).toBeDefined();
      expect(firstBar.close).toBeCloseTo(100, 0);
      expect(firstBar.open).toBeDefined();
      expect(firstBar.high).toBeDefined();
      expect(firstBar.low).toBeDefined();
      expect(firstBar.volume).toBeDefined();
    });

    test('sets correct date range', async () => {
      const prices = [100, 105, 110];
      global.fetch = createMockFetch({ 'QQQ': prices });

      const loader = new BacktestDataLoader();
      const result = await loader.loadSingle('QQQ', '1mo');

      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
      expect(result.data.startDate.getTime()).toBeLessThan(result.data.endDate.getTime());
      expect(result.stats.dateRange.start).toEqual(result.data.startDate);
      expect(result.stats.dateRange.end).toEqual(result.data.endDate);
    });
  });

  describe('multi-symbol loading', () => {
    test('loads multiple symbols in parallel', async () => {
      const symbolData = {
        'SPY': [100, 102, 104],
        'QQQ': [200, 205, 210],
        'IWM': [150, 152, 154],
      };
      global.fetch = createMockFetch(symbolData);

      const loader = new BacktestDataLoader();
      const result = await loader.load({
        symbols: ['SPY', 'QQQ', 'IWM'],
        period: '1mo',
      });

      expect(result.data.symbols).toEqual(['SPY', 'QQQ', 'IWM']);
      expect(result.data.bars.length).toBe(3);

      // Each bar should have data for all symbols
      const firstBar = result.data.bars[0];
      expect(firstBar.bars['SPY']).toBeDefined();
      expect(firstBar.bars['QQQ']).toBeDefined();
      expect(firstBar.bars['IWM']).toBeDefined();
    });

    test('aligns timestamps across symbols', async () => {
      const symbolData = {
        'TQQQ': [50, 55, 60],
        '^VIX': [15, 18, 16],
      };
      global.fetch = createMockFetch(symbolData);

      const loader = new BacktestDataLoader();
      const result = await loader.load({
        symbols: ['TQQQ', '^VIX'],
        period: '1mo',
      });

      // All bars should have the same timestamp structure
      for (const bar of result.data.bars) {
        expect(typeof bar.time).toBe('number');
        expect(bar.bars['TQQQ']).toBeDefined();
        expect(bar.bars['^VIX']).toBeDefined();
      }
    });
  });

  describe('gap filling strategies', () => {
    test('forward-fill fills gaps with last known value', async () => {
      // Create data with a gap in the second symbol
      const startTime = Date.now() - 10 * 24 * 60 * 60 * 1000;
      
      global.fetch = mock((input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : input.toString();
        const isSymbolA = url.includes('/chart/A');
        
        // Symbol A has all 5 days
        // Symbol B is missing day 2 and 3
        let response;
        if (isSymbolA) {
          response = createMockYahooResponse('A', [100, 101, 102, 103, 104], startTime);
        } else {
          // Symbol B only has days 0, 1, 4 (missing 2, 3)
          const timestamps = [0, 1, 4].map(i => Math.floor((startTime + i * 24 * 60 * 60 * 1000) / 1000));
          response = {
            chart: {
              result: [{
                meta: { symbol: 'B' },
                timestamp: timestamps,
                indicators: {
                  quote: [{
                    open: [200, 201, 204].map(p => p * 0.99),
                    high: [200, 201, 204].map(p => p * 1.02),
                    low: [200, 201, 204].map(p => p * 0.98),
                    close: [200, 201, 204],
                    volume: [1000000, 1000000, 1000000],
                  }],
                },
              }],
            },
          };
        }
        
        return Promise.resolve(new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }));
      });

      const loader = new BacktestDataLoader();
      const result = await loader.load({
        symbols: ['A', 'B'],
        period: '1mo',
        gapFillStrategy: 'forward-fill',
      });

      // Should have 5 bars total
      expect(result.data.bars.length).toBe(5);
      
      // Check that gaps were filled
      expect(result.stats.filledGaps['B']).toBeGreaterThan(0);
    });

    test('drop strategy removes bars with missing data', async () => {
      const startTime = Date.now() - 10 * 24 * 60 * 60 * 1000;
      
      global.fetch = mock((input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : input.toString();
        const isSymbolA = url.includes('/chart/A');
        
        let response;
        if (isSymbolA) {
          response = createMockYahooResponse('A', [100, 101, 102, 103, 104], startTime);
        } else {
          // Symbol B only has 3 days
          const timestamps = [0, 1, 4].map(i => Math.floor((startTime + i * 24 * 60 * 60 * 1000) / 1000));
          response = {
            chart: {
              result: [{
                timestamp: timestamps,
                indicators: {
                  quote: [{
                    open: [200, 201, 204],
                    high: [202, 203, 206],
                    low: [198, 199, 202],
                    close: [200, 201, 204],
                    volume: [1000000, 1000000, 1000000],
                  }],
                },
              }],
            },
          };
        }
        
        return Promise.resolve(new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }));
      });

      const loader = new BacktestDataLoader();
      const result = await loader.load({
        symbols: ['A', 'B'],
        period: '1mo',
        gapFillStrategy: 'drop',
      });

      // Should only have 3 bars (where both symbols have data)
      expect(result.data.bars.length).toBe(3);
      expect(result.stats.droppedBars).toBe(2);
    });
  });

  describe('error handling', () => {
    test('throws error when no symbols provided', async () => {
      const loader = new BacktestDataLoader();
      
      await expect(loader.load({
        symbols: [],
        period: '1mo',
      })).rejects.toThrow('At least one symbol is required');
    });
  });

  describe('convenience functions', () => {
    test('loadBacktestData returns BacktestData directly', async () => {
      global.fetch = createMockFetch({ 'SPY': [100, 105, 110] });

      const data = await loadBacktestData({
        symbols: ['SPY'],
        period: '1mo',
      });

      expect(data.symbols).toEqual(['SPY']);
      expect(data.bars.length).toBeGreaterThan(0);
      expect(data.startDate).toBeInstanceOf(Date);
      expect(data.endDate).toBeInstanceOf(Date);
    });

    test('loadSymbol loads single symbol', async () => {
      global.fetch = createMockFetch({ 'AAPL': [150, 155, 160] });

      const data = await loadSymbol('AAPL', '1mo');

      expect(data.symbols).toEqual(['AAPL']);
      expect(data.bars.length).toBe(3);
    });
  });

  describe('timestamp normalization', () => {
    test('normalizes timestamps to start of day', async () => {
      global.fetch = createMockFetch({ 'SPY': [100, 105, 110] });

      const loader = new BacktestDataLoader();
      const result = await loader.loadSingle('SPY', '1mo');

      for (const bar of result.data.bars) {
        const date = new Date(bar.time);
        // Timestamps should be normalized to UTC midnight
        expect(date.getUTCHours()).toBe(0);
        expect(date.getUTCMinutes()).toBe(0);
        expect(date.getUTCSeconds()).toBe(0);
      }
    });
  });
});

describe('DataLoader with VIX Hedge use case', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('loads TQQQ and VIX data for VIX Hedge strategy', async () => {
    const symbolData = {
      'TQQQ': [50, 52, 48, 55, 53],
      '^VIX': [15, 18, 25, 20, 16],
    };
    global.fetch = createMockFetch(symbolData);

    const loader = new BacktestDataLoader();
    const result = await loader.load({
      symbols: ['TQQQ', '^VIX'],
      period: '1mo',
      gapFillStrategy: 'forward-fill',
    });

    expect(result.data.symbols).toContain('TQQQ');
    expect(result.data.symbols).toContain('^VIX');

    // Each bar should have both symbols
    for (const bar of result.data.bars) {
      expect(bar.bars['TQQQ']).toBeDefined();
      expect(bar.bars['^VIX']).toBeDefined();
    }
  });
});
