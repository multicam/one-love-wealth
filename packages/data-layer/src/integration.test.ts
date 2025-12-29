import { test, expect, describe } from 'bun:test';
import { coingecko } from './builders/coingecko-builder';
import { yahoo } from './builders/yahoo-builder';
import { fred } from './builders/fred-builder';
import { CoinGeckoProvider } from './providers/coingecko';
import { YahooProvider } from './providers/yahoo';
import { FREDProvider } from './providers/fred';
import { MemoryAdapter } from './cache/memory-adapter';
import { ProxyRequestAdapter } from './types/request';
import type { DataSeries } from './types/series';

describe('Integration Tests - Mock Mode', () => {
  test('CoinGecko: mock mode generates valid data', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new CoinGeckoProvider(cache, request);

    const config = coingecko('bitcoin')
      .marketChart()
      .days(30)
      .mockMode(true)
      .build();

    const result = await provider.fetch(config);
    expect(result.fromCache).toBe(false);
    expect(result.isMock).toBe(true);
    expect(result.series.data.length).toBeGreaterThan(0);
    expect(result.series.source).toBe('COINGECKO');
    expect(result.series.data[0].time).toBeGreaterThan(0);
    expect(result.series.data[0].value).toBeDefined();
  });

  test('Yahoo: mock mode generates OHLC data', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new YahooProvider(cache, request);

    const config = yahoo('SPY')
      .period('1y')
      .interval('1d')
      .mockMode(true)
      .build();

    const result = await provider.fetch(config);
    expect(result.isMock).toBe(true);
    expect(result.series.data.length).toBeGreaterThan(0);

    const firstPoint = result.series.data[0];
    expect(firstPoint.time).toBeGreaterThan(0);
    expect(firstPoint.open).toBeDefined();
    expect(firstPoint.high).toBeDefined();
    expect(firstPoint.low).toBeDefined();
    expect(firstPoint.close).toBeDefined();
  });

  test('FRED: mock mode generates simple value data', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new FREDProvider(cache, request);

    const config = fred('GDP')
      .mockMode(true)
      .build();

    const result = await provider.fetch(config);
    expect(result.isMock).toBe(true);
    expect(result.series.data.length).toBeGreaterThan(0);

    const firstPoint = result.series.data[0];
    expect(firstPoint.time).toBeGreaterThan(0);
    expect(firstPoint.value).toBeDefined();
  });
});

describe('Integration Tests - Cache Behavior', () => {
  test('Cache stores and retrieves data correctly', async () => {
    const cache = new MemoryAdapter();
    const cacheKey = 'test-key';

    const mockSeries: DataSeries = {
      id: cacheKey,
      source: 'TEST',
      lastUpdated: Date.now(),
      data: [{ time: Date.now(), value: 100 }],
    };

    // Set data in cache
    await cache.set(cacheKey, mockSeries, 60000);

    // Retrieve from cache
    const cached = await cache.get(cacheKey);
    expect(cached).not.toBeNull();
    expect(cached?.id).toBe(cacheKey);
    expect(cached?.data[0].value).toBe(100);
  });

  test('Cache respects TTL', async () => {
    const cache = new MemoryAdapter();
    const cacheKey = 'ttl-test';

    const mockSeries: DataSeries = {
      id: cacheKey,
      source: 'TEST',
      lastUpdated: Date.now(),
      data: [{ time: Date.now(), value: 100 }],
    };

    // Set with short TTL
    await cache.set(cacheKey, mockSeries, 100); // 100ms

    // Should be available immediately
    const cached1 = await cache.get(cacheKey);
    expect(cached1).not.toBeNull();

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be expired
    const cached2 = await cache.get(cacheKey);
    expect(cached2).toBeNull();

    // But stale cache should still work
    const stale = await cache.getStale(cacheKey);
    expect(stale).not.toBeNull();
  });

  test('Cache handles multiple keys independently', async () => {
    const cache = new MemoryAdapter();

    const series1: DataSeries = {
      id: 'key1',
      source: 'TEST',
      lastUpdated: Date.now(),
      data: [{ time: Date.now(), value: 100 }],
    };

    const series2: DataSeries = {
      id: 'key2',
      source: 'TEST',
      lastUpdated: Date.now(),
      data: [{ time: Date.now(), value: 200 }],
    };

    await cache.set('key1', series1);
    await cache.set('key2', series2);

    const cached1 = await cache.get('key1');
    const cached2 = await cache.get('key2');

    expect(cached1?.data[0].value).toBe(100);
    expect(cached2?.data[0].value).toBe(200);
  });
});

describe('Integration Tests - Builder Pattern', () => {
  test('Builder creates valid config with all options', () => {
    const config = coingecko('bitcoin')
      .marketChart()
      .days(30)
      .interval('daily')
      .vsCurrency('usd')
      .cache({ ttl: 60000, frequency: 'daily' })
      .mockMode(true)
      .errorRecovery({ fallbackToMock: true, retryCount: 3 })
      .build();

    expect(config.coinId).toBe('bitcoin');
    expect(config.endpoint).toBe('market_chart');
    expect(config.days).toBe(30);
    expect(config.interval).toBe('daily');
    expect(config.vsCurrency).toBe('usd');
    expect(config.mockMode).toBe(true);
    expect(config.cache?.ttl).toBe(60000);
    expect(config.errorRecovery?.retryCount).toBe(3);
  });

  test('Builder validates required fields', () => {
    const builder = coingecko('bitcoin');
    // Should build successfully with just coinId
    const config = builder.build();
    expect(config.coinId).toBe('bitcoin');
  });

  test('Yahoo builder with all options', () => {
    const config = yahoo('AAPL')
      .period('1y')
      .interval('1d')
      .cache({ frequency: 'daily' })
      .build();

    expect(config.symbol).toBe('AAPL');
    expect(config.period).toBe('1y');
    expect(config.interval).toBe('1d');
  });

  test('FRED builder with frequency hint', () => {
    const config = fred('GDP')
      .cache({ frequency: 'quarterly' })
      .build();

    expect(config.seriesId).toBe('GDP');
    expect(config.cache?.frequency).toBe('quarterly');
  });
});

describe('Integration Tests - Provider + Builder + Cache', () => {
  test('Full flow: builder config works with provider and cache', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new CoinGeckoProvider(cache, request);

    // Create config with builder
    const config = coingecko('bitcoin')
      .marketChart()
      .days(7)
      .mockMode(true)
      .build();

    // Use provider to fetch with that config
    const result = await provider.fetch(config);

    // Verify the full integration
    expect(result.series.data).toBeDefined();
    expect(result.series.data.length).toBeGreaterThan(0);
    expect(result.series.source).toBe('COINGECKO');
    expect(result.isMock).toBe(true);
  });

  test('Different providers produce different cache keys', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');

    const cgProvider = new CoinGeckoProvider(cache, request);
    const yahooProvider = new YahooProvider(cache, request);

    const cgConfig = coingecko('bitcoin').marketChart().mockMode(true).build();
    const yahooConfig = yahoo('BTC-USD').mockMode(true).build();

    const cgResult = await cgProvider.fetch(cgConfig);
    const yahooResult = await yahooProvider.fetch(yahooConfig);

    // Different providers should generate different cache keys
    expect(cgResult.series.id).not.toBe(yahooResult.series.id);
    expect(cgResult.series.source).toBe('COINGECKO');
    expect(yahooResult.series.source).toBe('YAHOO');
  });

  test('Same provider with different params produces different keys', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new CoinGeckoProvider(cache, request);

    const btcConfig = coingecko('bitcoin').marketChart().days(30).mockMode(true).build();
    const ethConfig = coingecko('ethereum').marketChart().days(30).mockMode(true).build();

    const btcResult = await provider.fetch(btcConfig);
    const ethResult = await provider.fetch(ethConfig);

    expect(btcResult.series.id).not.toBe(ethResult.series.id);
  });

  test('Multiple endpoints for same coin produce different keys', async () => {
    const cache = new MemoryAdapter();
    const request = new ProxyRequestAdapter('/api/proxy');
    const provider = new CoinGeckoProvider(cache, request);

    const marketConfig = coingecko('bitcoin').marketChart().mockMode(true).build();
    const ohlcConfig = coingecko('bitcoin').ohlc().mockMode(true).build();
    const priceConfig = coingecko('bitcoin').simplePrice().mockMode(true).build();

    const marketResult = await provider.fetch(marketConfig);
    const ohlcResult = await provider.fetch(ohlcConfig);
    const priceResult = await provider.fetch(priceConfig);

    // All should have different cache keys
    expect(marketResult.series.id).not.toBe(ohlcResult.series.id);
    expect(marketResult.series.id).not.toBe(priceResult.series.id);
    expect(ohlcResult.series.id).not.toBe(priceResult.series.id);

    // Verify correct data structures
    expect(marketResult.series.data[0].value).toBeDefined();
    expect(ohlcResult.series.data[0].open).toBeDefined();
    expect(priceResult.series.data[0].value).toBeDefined();
  });
});

describe('Integration Tests - Frequency to TTL', () => {
  test('Frequency hints convert to appropriate TTLs', () => {
    const frequencies = ['realtime', 'daily', 'weekly', 'monthly', 'quarterly', 'annual'] as const;

    frequencies.forEach(frequency => {
      const config = fred('GDP')
        .cache({ frequency })
        .build();

      expect(config.cache?.frequency).toBe(frequency);
    });
  });
});
