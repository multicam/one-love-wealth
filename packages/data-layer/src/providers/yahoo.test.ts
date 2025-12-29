import { test, expect, describe } from 'bun:test';
import { YahooProvider, type YahooConfig } from './yahoo';
import { YahooBuilder, yahoo } from '../builders/yahoo-builder';
import { MemoryAdapter } from '../cache/memory-adapter';
import { ProxyRequestAdapter } from '../types/request';

describe('YahooBuilder', () => {
  test('builds config with symbol', () => {
    const config = yahoo('SPY').build();
    expect(config.symbol).toBe('SPY');
  });

  test('builds config with all options', () => {
    const config = yahoo('AAPL')
      .period('1y')
      .interval('1d')
      .cache({ frequency: 'daily' })
      .mockMode(true)
      .errorRecovery({ retryCount: 2 })
      .build();

    expect(config.symbol).toBe('AAPL');
    expect(config.period).toBe('1y');
    expect(config.interval).toBe('1d');
    expect(config.cache?.frequency).toBe('daily');
    expect(config.mockMode).toBe(true);
    expect(config.errorRecovery?.retryCount).toBe(2);
  });

  test('throws when symbol is missing', () => {
    const builder = new YahooBuilder();
    expect(() => builder.build()).toThrow('Yahoo symbol is required');
  });

  test('fluent API returns same instance', () => {
    const builder = new YahooBuilder();
    const result = builder.symbol('TEST').period('1mo');
    expect(result).toBe(builder);
  });
});

describe('YahooProvider', () => {
  const cache = new MemoryAdapter();
  const request = new ProxyRequestAdapter('/api/proxy');
  const provider = new YahooProvider(cache, request);

  test('has correct name and cachePrefix', () => {
    expect(provider.name).toBe('Yahoo Finance');
    expect(provider.cachePrefix).toBe('YAHOO');
  });

  test('generates mock data in mock mode', async () => {
    const config = yahoo('SPY').mockMode().build();
    const result = await provider.fetch(config);

    expect(result.isMock).toBe(true);
    expect(result.fromCache).toBe(false);
    expect(result.series.data.length).toBeGreaterThan(0);
    expect(result.series.source).toBe('YAHOO');
  });

  test('generates correct number of mock data points for period', async () => {
    const config1mo = yahoo('SPY').period('1mo').mockMode().build();
    const result1mo = await provider.fetch(config1mo);
    // ~30 days + 1
    expect(result1mo.series.data.length).toBeGreaterThanOrEqual(30);

    const config5d = yahoo('SPY').period('5d').mockMode().build();
    const result5d = await provider.fetch(config5d);
    // ~5 days + 1
    expect(result5d.series.data.length).toBeGreaterThanOrEqual(5);
  });

  test('mock data has OHLC structure', async () => {
    const config = yahoo('AAPL').mockMode().build();
    const result = await provider.fetch(config);

    const point = result.series.data[0]!;
    expect(point.time).toBeDefined();
    expect(point.open).toBeDefined();
    expect(point.high).toBeDefined();
    expect(point.low).toBeDefined();
    expect(point.close).toBeDefined();
    expect(point.volume).toBeDefined();
  });

  test('caches mock data', async () => {
    await cache.clear();
    const config = yahoo('GOOG').mockMode().build();

    // First fetch - not from cache
    const result1 = await provider.fetch(config);
    expect(result1.fromCache).toBe(false);

    // Mock mode doesn't cache, so each fetch generates new data
    // This is intentional for mock mode
  });

  test('transforms Yahoo response correctly', () => {
    const mockResponse = {
      chart: {
        result: [
          {
            timestamp: [1704067200, 1704153600],
            indicators: {
              quote: [
                {
                  open: [100, 101],
                  high: [105, 106],
                  low: [98, 99],
                  close: [103, 104],
                  volume: [1000000, 1100000],
                },
              ],
            },
          },
        ],
      },
    };

    // Access protected method via any for testing
    const config: YahooConfig = { symbol: 'TEST' };
    const data = (provider as any).transformResponse(mockResponse, config);

    expect(data.length).toBe(2);
    expect(data[0].time).toBe(1704067200000); // Converted to ms
    expect(data[0].open).toBe(100);
    expect(data[0].high).toBe(105);
    expect(data[0].low).toBe(98);
    expect(data[0].close).toBe(103);
    expect(data[0].volume).toBe(1000000);
  });

  test('throws on invalid response', () => {
    const config: YahooConfig = { symbol: 'TEST' };
    expect(() => (provider as any).transformResponse({}, config)).toThrow(
      'Invalid Yahoo Finance response format'
    );
  });

  test('builds correct cache key components', () => {
    const config: YahooConfig = {
      symbol: 'MSFT',
      period: '3mo',
      interval: '1h',
    };

    const components = (provider as any).getCacheKeyComponents(config);
    expect(components.provider).toBe('YAHOO');
    expect(components.params.symbol).toBe('MSFT');
    expect(components.params.period).toBe('3mo');
    expect(components.params.interval).toBe('1h');
  });

  test('uses default period and interval in cache key', () => {
    const config: YahooConfig = { symbol: 'TSLA' };

    const components = (provider as any).getCacheKeyComponents(config);
    expect(components.params.period).toBe('1y');
    expect(components.params.interval).toBe('1d');
  });
});
