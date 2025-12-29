import { test, expect, describe } from 'bun:test';
import { CoinGeckoProvider, type CoinGeckoConfig } from './coingecko';
import { CoinGeckoBuilder, coingecko } from '../builders/coingecko-builder';
import { MemoryAdapter } from '../cache/memory-adapter';
import { ProxyRequestAdapter } from '../types/request';

describe('CoinGeckoBuilder', () => {
  test('builds config with coinId', () => {
    const config = coingecko('bitcoin').build();
    expect(config.coinId).toBe('bitcoin');
  });

  test('builds config with all market_chart options', () => {
    const config = coingecko('ethereum')
      .marketChart()
      .vsCurrency('eur')
      .days(30)
      .interval('daily')
      .precision(2)
      .cache({ frequency: 'daily' })
      .mockMode(true)
      .errorRecovery({ retryCount: 2 })
      .build();

    expect(config.coinId).toBe('ethereum');
    expect(config.endpoint).toBe('market_chart');
    expect(config.vsCurrency).toBe('eur');
    expect(config.days).toBe(30);
    expect(config.interval).toBe('daily');
    expect(config.precision).toBe(2);
    expect(config.cache?.frequency).toBe('daily');
    expect(config.mockMode).toBe(true);
    expect(config.errorRecovery?.retryCount).toBe(2);
  });

  test('builds config with ohlc options', () => {
    const config = coingecko('bitcoin')
      .ohlc()
      .days(7)
      .build();

    expect(config.endpoint).toBe('ohlc');
    expect(config.days).toBe(7);
  });

  test('builds config with simple_price options', () => {
    const config = coingecko('bitcoin')
      .simplePrice()
      .includeMarketCap()
      .include24hrVol()
      .include24hrChange()
      .build();

    expect(config.endpoint).toBe('simple_price');
    expect(config.includeMarketCap).toBe(true);
    expect(config.include24hrVol).toBe(true);
    expect(config.include24hrChange).toBe(true);
  });

  test('throws when coinId is missing', () => {
    const builder = new CoinGeckoBuilder();
    expect(() => builder.build()).toThrow('CoinGecko coinId is required');
  });

  test('fluent API returns same instance', () => {
    const builder = new CoinGeckoBuilder();
    const result = builder.coin('bitcoin').marketChart().days(30);
    expect(result).toBe(builder);
  });
});

describe('CoinGeckoProvider', () => {
  const cache = new MemoryAdapter();
  const request = new ProxyRequestAdapter('/api/proxy');
  const provider = new CoinGeckoProvider(cache, request);

  test('has correct name and cachePrefix', () => {
    expect(provider.name).toBe('CoinGecko');
    expect(provider.cachePrefix).toBe('COINGECKO');
  });

  describe('market_chart endpoint', () => {
    test('generates mock data', async () => {
      const config = coingecko('bitcoin').marketChart().days(30).mockMode().build();
      const result = await provider.fetch(config);

      expect(result.isMock).toBe(true);
      expect(result.fromCache).toBe(false);
      expect(result.series.data.length).toBeGreaterThanOrEqual(30);
      expect(result.series.source).toBe('COINGECKO');
    });

    test('mock data has value structure', async () => {
      const config = coingecko('bitcoin').marketChart().mockMode().build();
      const result = await provider.fetch(config);

      const point = result.series.data[0]!;
      expect(point.time).toBeDefined();
      expect(point.value).toBeDefined();
    });

    test('transforms market_chart response correctly', () => {
      const mockResponse = {
        prices: [
          [1704067200000, 42000],
          [1704153600000, 43000],
        ],
      };

      const config: CoinGeckoConfig = { coinId: 'bitcoin' };
      const data = (provider as any).transformResponse(mockResponse, config);

      expect(data.length).toBe(2);
      expect(data[0].time).toBe(1704067200000);
      expect(data[0].value).toBe(42000);
    });

    test('throws on invalid market_chart response', () => {
      const config: CoinGeckoConfig = { coinId: 'bitcoin', endpoint: 'market_chart' };
      expect(() => (provider as any).transformResponse({}, config)).toThrow(
        'Invalid market_chart response'
      );
    });
  });

  describe('ohlc endpoint', () => {
    test('generates mock OHLC data', async () => {
      const config = coingecko('bitcoin').ohlc().days(7).mockMode().build();
      const result = await provider.fetch(config);

      expect(result.isMock).toBe(true);
      expect(result.series.data.length).toBeGreaterThanOrEqual(7);
    });

    test('mock OHLC data has correct structure', async () => {
      const config = coingecko('ethereum').ohlc().mockMode().build();
      const result = await provider.fetch(config);

      const point = result.series.data[0]!;
      expect(point.time).toBeDefined();
      expect(point.open).toBeDefined();
      expect(point.high).toBeDefined();
      expect(point.low).toBeDefined();
      expect(point.close).toBeDefined();
    });

    test('transforms OHLC response correctly', () => {
      const mockResponse = [
        [1704067200000, 42000, 43000, 41000, 42500],
        [1704153600000, 42500, 44000, 42000, 43500],
      ];

      const config: CoinGeckoConfig = { coinId: 'bitcoin', endpoint: 'ohlc' };
      const data = (provider as any).transformResponse(mockResponse, config);

      expect(data.length).toBe(2);
      expect(data[0].time).toBe(1704067200000);
      expect(data[0].open).toBe(42000);
      expect(data[0].high).toBe(43000);
      expect(data[0].low).toBe(41000);
      expect(data[0].close).toBe(42500);
    });

    test('throws on invalid OHLC response', () => {
      const config: CoinGeckoConfig = { coinId: 'bitcoin', endpoint: 'ohlc' };
      expect(() => (provider as any).transformResponse({}, config)).toThrow(
        'Invalid OHLC response'
      );
    });
  });

  describe('simple_price endpoint', () => {
    test('generates mock simple price data', async () => {
      const config = coingecko('bitcoin').simplePrice().mockMode().build();
      const result = await provider.fetch(config);

      expect(result.isMock).toBe(true);
      expect(result.series.data.length).toBe(1);
      expect(result.series.data[0]!.value).toBeDefined();
    });

    test('generates mock data with optional fields', async () => {
      const config = coingecko('bitcoin')
        .simplePrice()
        .includeMarketCap()
        .include24hrVol()
        .include24hrChange()
        .mockMode()
        .build();

      const result = await provider.fetch(config);
      const point = result.series.data[0] as any;

      expect(point.value).toBeDefined();
      expect(point.marketCap).toBeDefined();
      expect(point.volume).toBeDefined();
      expect(point.change24h).toBeDefined();
    });

    test('transforms simple_price response correctly', () => {
      const mockResponse = {
        bitcoin: {
          usd: 42000,
          usd_market_cap: 800000000000,
          usd_24h_vol: 30000000000,
          usd_24h_change: 2.5,
        },
      };

      const config: CoinGeckoConfig = {
        coinId: 'bitcoin',
        endpoint: 'simple_price',
        includeMarketCap: true,
        include24hrVol: true,
        include24hrChange: true,
      };

      const data = (provider as any).transformResponse(mockResponse, config);

      expect(data.length).toBe(1);
      expect(data[0].value).toBe(42000);
      expect(data[0].marketCap).toBe(800000000000);
      expect(data[0].volume).toBe(30000000000);
      expect(data[0].change24h).toBe(2.5);
    });

    test('throws on invalid simple_price response', () => {
      const config: CoinGeckoConfig = { coinId: 'bitcoin', endpoint: 'simple_price' };
      expect(() => (provider as any).transformResponse({}, config)).toThrow(
        'Invalid simple_price response'
      );
    });
  });

  describe('cache key components', () => {
    test('generates correct cache key for market_chart', () => {
      const config: CoinGeckoConfig = {
        coinId: 'bitcoin',
        endpoint: 'market_chart',
        vsCurrency: 'eur',
        days: 30,
        interval: 'hourly',
      };

      const components = (provider as any).getCacheKeyComponents(config);
      expect(components.provider).toBe('COINGECKO');
      expect(components.endpoint).toBe('market_chart');
      expect(components.params.coinId).toBe('bitcoin');
      expect(components.params.vsCurrency).toBe('eur');
      expect(components.params.days).toBe(30);
      expect(components.params.interval).toBe('hourly');
    });

    test('generates correct cache key for ohlc', () => {
      const config: CoinGeckoConfig = {
        coinId: 'ethereum',
        endpoint: 'ohlc',
        days: 14,
      };

      const components = (provider as any).getCacheKeyComponents(config);
      expect(components.provider).toBe('COINGECKO');
      expect(components.endpoint).toBe('ohlc');
      expect(components.params.coinId).toBe('ethereum');
      expect(components.params.days).toBe(14);
    });

    test('uses default values in cache key', () => {
      const config: CoinGeckoConfig = { coinId: 'bitcoin' };

      const components = (provider as any).getCacheKeyComponents(config);
      expect(components.params.vsCurrency).toBe('usd');
      expect(components.params.days).toBe('max');
      expect(components.params.interval).toBe('daily');
    });
  });
});
