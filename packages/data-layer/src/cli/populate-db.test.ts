import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { unlinkSync, existsSync } from 'node:fs';
import { SQLiteAdapter } from '../storage/sqlite-adapter';
import { createDirectAdapter } from '../types/request';
import { FREDProvider } from '../providers/fred';
import { CoinGeckoProvider } from '../providers/coingecko';
import { YahooProvider } from '../providers/yahoo';
import { TreasuryProvider } from '../providers/treasury';

/**
 * Mock API responses for testing
 */
const MOCK_RESPONSES = {
  fred: {
    observations: [
      { date: '2024-01-01', value: '100.5' },
      { date: '2024-02-01', value: '101.2' },
      { date: '2024-03-01', value: '102.0' },
      { date: '2024-04-01', value: '103.1' },
      { date: '2024-05-01', value: '104.5' },
    ],
  },
  coingecko: {
    prices: [
      [1704067200000, 42000],
      [1704153600000, 42500],
      [1704240000000, 43000],
      [1704326400000, 43500],
      [1704412800000, 44000],
    ],
    market_caps: [
      [1704067200000, 820000000000],
      [1704153600000, 830000000000],
      [1704240000000, 840000000000],
      [1704326400000, 850000000000],
      [1704412800000, 860000000000],
    ],
    total_volumes: [
      [1704067200000, 15000000000],
      [1704153600000, 16000000000],
      [1704240000000, 17000000000],
      [1704326400000, 18000000000],
      [1704412800000, 19000000000],
    ],
  },
  yahoo: {
    chart: {
      result: [
        {
          meta: { symbol: 'SPY', currency: 'USD' },
          timestamp: [1704067200, 1704153600, 1704240000, 1704326400, 1704412800],
          indicators: {
            quote: [
              {
                open: [470, 472, 474, 476, 478],
                high: [475, 477, 479, 481, 483],
                low: [468, 470, 472, 474, 476],
                close: [473, 475, 477, 479, 481],
                volume: [50000000, 52000000, 54000000, 56000000, 58000000],
              },
            ],
          },
        },
      ],
    },
  },
  treasury: {
    data: [
      { record_date: '2024-01-01', tot_pub_debt_out_amt: '34000000000000' },
      { record_date: '2024-01-02', tot_pub_debt_out_amt: '34010000000000' },
      { record_date: '2024-01-03', tot_pub_debt_out_amt: '34020000000000' },
    ],
    meta: { total_count: 3 },
  },
};

/**
 * Create a mock fetch function that returns provider-specific responses
 */
function createMockFetch() {
  return mock((input: string | URL | Request, _options?: RequestInit) => {
    // Handle Request objects from DirectRequestAdapter
    const urlString = input instanceof Request ? input.url : input.toString();

    // FRED API
    if (urlString.includes('stlouisfed.org')) {
      return Promise.resolve(
        new Response(JSON.stringify(MOCK_RESPONSES.fred), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // CoinGecko API
    if (urlString.includes('coingecko.com')) {
      return Promise.resolve(
        new Response(JSON.stringify(MOCK_RESPONSES.coingecko), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // Yahoo Finance API
    if (urlString.includes('finance.yahoo.com')) {
      return Promise.resolve(
        new Response(JSON.stringify(MOCK_RESPONSES.yahoo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // Treasury API
    if (urlString.includes('fiscaldata.treasury.gov')) {
      return Promise.resolve(
        new Response(JSON.stringify(MOCK_RESPONSES.treasury), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // Default: return 404
    return Promise.resolve(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
}

/**
 * Create a mock fetch that fails with an error
 */
function createFailingMockFetch(errorMessage: string) {
  return mock(() => {
    return Promise.resolve(
      new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
}

describe('Populate DB Integration Tests', () => {
  let originalFetch: typeof global.fetch;
  const TEST_DB_PATH = 'test-populate-db.sqlite';

  beforeEach(() => {
    originalFetch = global.fetch;
    // Clean up test database if it exists
    try {
      if (existsSync(TEST_DB_PATH)) {
        unlinkSync(TEST_DB_PATH);
      }
    } catch { /* ignore */ }
  });

  afterEach(() => {
    global.fetch = originalFetch;
    // Clean up test database
    try {
      if (existsSync(TEST_DB_PATH)) {
        unlinkSync(TEST_DB_PATH);
      }
    } catch { /* ignore */ }
  });

  describe('Provider Data Fetching with Mock API', () => {
    test('FRED provider fetches and parses mock data correctly', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-api-key' });
      const provider = new FREDProvider(storage, request);

      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });

      expect(result.series).toBeDefined();
      expect(result.series.source).toBe('FRED');
      expect(result.series.data.length).toBe(5);
      expect(result.series.data[0].value).toBe(100.5);
      expect(result.series.data[4].value).toBe(104.5);

      storage.close();
    });

    test('CoinGecko provider fetches and parses mock data correctly', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new CoinGeckoProvider(storage, request);

      const result = await provider.fetch({
        coinId: 'bitcoin',
        endpoint: 'market_chart',
        days: 30,
        mockMode: false,
      });

      expect(result.series).toBeDefined();
      expect(result.series.source).toBe('COINGECKO');
      expect(result.series.data.length).toBe(5);
      expect(result.series.data[0].value).toBe(42000);
      expect(result.series.data[4].value).toBe(44000);

      storage.close();
    });

    test('Yahoo provider fetches and parses mock OHLC data correctly', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new YahooProvider(storage, request);

      const result = await provider.fetch({
        symbol: 'SPY',
        period: '1y',
        interval: '1d',
        mockMode: false,
      });

      expect(result.series).toBeDefined();
      expect(result.series.source).toBe('YAHOO');
      expect(result.series.data.length).toBe(5);

      const firstPoint = result.series.data[0];
      expect(firstPoint.open).toBe(470);
      expect(firstPoint.high).toBe(475);
      expect(firstPoint.low).toBe(468);
      expect(firstPoint.close).toBe(473);

      storage.close();
    });

    test('Treasury provider fetches and parses mock data correctly', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new TreasuryProvider(storage, request);

      const result = await provider.fetch({
        dataset: 'debt_to_penny',
        mockMode: false,
      });

      expect(result.series).toBeDefined();
      expect(result.series.source).toBe('TREASURY');
      expect(result.series.data.length).toBe(3);

      storage.close();
    });
  });

  describe('SQLite Storage Integration', () => {
    test('creates new database and stores fetched data', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      // Fetch data
      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });

      // Verify data is in storage
      const stats = await storage.getStats();
      expect(stats.totalSeries).toBeGreaterThanOrEqual(1);
      expect(stats.totalDataPoints).toBeGreaterThanOrEqual(5);

      // Verify we can retrieve it
      const cached = await storage.get(result.series.id);
      expect(cached).not.toBeNull();
      expect(cached?.data.length).toBe(5);

      storage.close();
    });

    test('subsequent fetches return cached data', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      // First fetch
      const result1 = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });
      expect(result1.fromCache).toBe(false);

      // Second fetch should be from cache
      const result2 = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });
      expect(result2.fromCache).toBe(true);
      expect(result2.series.data.length).toBe(result1.series.data.length);

      storage.close();
    });

    test('force refresh bypasses cache', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      // First fetch
      await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });

      // Force refresh
      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
        cache: { forceRefresh: true },
      });

      expect(result.fromCache).toBe(false);

      storage.close();
    });

    test('multiple providers store data independently', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });

      const fredProvider = new FREDProvider(storage, request);
      const coingeckoProvider = new CoinGeckoProvider(storage, request);
      const yahooProvider = new YahooProvider(storage, request);

      // Fetch from all providers
      await fredProvider.fetch({ seriesId: 'M2SL', mockMode: false });
      await coingeckoProvider.fetch({ coinId: 'bitcoin', endpoint: 'market_chart', days: 30, mockMode: false });
      await yahooProvider.fetch({ symbol: 'SPY', period: '1y', interval: '1d', mockMode: false });

      // Verify all are stored
      const stats = await storage.getStats();
      expect(stats.totalSeries).toBe(3);

      // Verify by source
      expect(stats.bySource['FRED']).toBe(1);
      expect(stats.bySource['COINGECKO']).toBe(1);
      expect(stats.bySource['YAHOO']).toBe(1);

      storage.close();
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully with mock fallback', async () => {
      global.fetch = createFailingMockFetch('Service unavailable');

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      // Should fall back to mock data when API fails
      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
        errorRecovery: { fallbackToMock: true, retryCount: 0 },
      });

      expect(result.isMock).toBe(true);
      expect(result.series.data.length).toBeGreaterThan(0);

      storage.close();
    });

    test('handles network errors with retry', async () => {
      let callCount = 0;
      global.fetch = mock(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(
          new Response(JSON.stringify(MOCK_RESPONSES.fred), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
        errorRecovery: { retryCount: 3, retryDelay: 10 },
      });

      expect(result.series.data.length).toBe(5);
      expect(callCount).toBe(3);

      storage.close();
    });
  });

  describe('Data Consistency', () => {
    test('stored data matches fetched data exactly', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'test-key' });
      const provider = new FREDProvider(storage, request);

      const result = await provider.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });

      const cached = await storage.get(result.series.id);

      expect(cached).not.toBeNull();
      expect(cached!.id).toBe(result.series.id);
      expect(cached!.source).toBe(result.series.source);
      expect(cached!.data.length).toBe(result.series.data.length);

      // Verify each data point
      for (let i = 0; i < result.series.data.length; i++) {
        expect(cached!.data[i].time).toBe(result.series.data[i].time);
        expect(cached!.data[i].value).toBe(result.series.data[i].value);
      }

      storage.close();
    });

    test('OHLC data preserves all fields', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new YahooProvider(storage, request);

      const result = await provider.fetch({
        symbol: 'SPY',
        period: '1y',
        interval: '1d',
        mockMode: false,
      });

      const cached = await storage.get(result.series.id);

      expect(cached).not.toBeNull();

      // Verify OHLC fields are preserved
      for (let i = 0; i < result.series.data.length; i++) {
        const original = result.series.data[i];
        const stored = cached!.data[i];

        expect(stored.open).toBe(original.open);
        expect(stored.high).toBe(original.high);
        expect(stored.low).toBe(original.low);
        expect(stored.close).toBe(original.close);
        expect(stored.volume).toBe(original.volume);
      }

      storage.close();
    });
  });

  describe('Persistent Storage Integration', () => {
    test('data persists across database sessions', async () => {
      global.fetch = createMockFetch();

      // First session: store data
      const storage1 = new SQLiteAdapter(TEST_DB_PATH);
      const request1 = createDirectAdapter({ fred: 'test-key' });
      const provider1 = new FREDProvider(storage1, request1);

      const result = await provider1.fetch({
        seriesId: 'M2SL',
        mockMode: false,
      });

      const seriesId = result.series.id;
      storage1.close();

      // Second session: retrieve data
      const storage2 = new SQLiteAdapter(TEST_DB_PATH);
      const cached = await storage2.get(seriesId);

      expect(cached).not.toBeNull();
      expect(cached!.data.length).toBe(5);
      expect(cached!.source).toBe('FRED');

      storage2.close();
    });

    test('getStats returns correct counts after multiple fetches', async () => {
      global.fetch = createMockFetch();

      const storage = new SQLiteAdapter(TEST_DB_PATH);
      const request = createDirectAdapter({ fred: 'test-key' });

      const fredProvider = new FREDProvider(storage, request);
      const yahooProvider = new YahooProvider(storage, request);

      // Fetch from multiple providers
      await fredProvider.fetch({ seriesId: 'M2SL', mockMode: false });
      await yahooProvider.fetch({ symbol: 'SPY', period: '1y', interval: '1d', mockMode: false });

      const stats = await storage.getStats();

      expect(stats.totalSeries).toBe(2);
      expect(stats.totalDataPoints).toBe(10); // 5 FRED + 5 Yahoo
      expect(stats.bySource['FRED']).toBe(1);
      expect(stats.bySource['YAHOO']).toBe(1);

      storage.close();
    });
  });

  describe('DirectRequestAdapter URL Construction', () => {
    test('constructs correct FRED API URL', async () => {
      let capturedUrl = '';
      global.fetch = mock((input: string | URL | Request) => {
        capturedUrl = input instanceof Request ? input.url : input.toString();
        return Promise.resolve(
          new Response(JSON.stringify(MOCK_RESPONSES.fred), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter({ fred: 'my-api-key' });
      const provider = new FREDProvider(storage, request);

      await provider.fetch({ seriesId: 'GDP', mockMode: false });

      expect(capturedUrl).toContain('api.stlouisfed.org');
      expect(capturedUrl).toContain('series_id=GDP');
      expect(capturedUrl).toContain('api_key=my-api-key');
      expect(capturedUrl).toContain('file_type=json');

      storage.close();
    });

    test('constructs correct CoinGecko API URL', async () => {
      let capturedUrl = '';
      global.fetch = mock((input: string | URL | Request) => {
        capturedUrl = input instanceof Request ? input.url : input.toString();
        return Promise.resolve(
          new Response(JSON.stringify(MOCK_RESPONSES.coingecko), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new CoinGeckoProvider(storage, request);

      await provider.fetch({
        coinId: 'ethereum',
        endpoint: 'market_chart',
        days: 7,
        vsCurrency: 'usd',
        mockMode: false,
      });

      expect(capturedUrl).toContain('coingecko.com');
      expect(capturedUrl).toContain('ethereum');
      expect(capturedUrl).toContain('market_chart');

      storage.close();
    });

    test('constructs correct Yahoo Finance API URL', async () => {
      let capturedUrl = '';
      global.fetch = mock((input: string | URL | Request) => {
        capturedUrl = input instanceof Request ? input.url : input.toString();
        return Promise.resolve(
          new Response(JSON.stringify(MOCK_RESPONSES.yahoo), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      const storage = new SQLiteAdapter(':memory:');
      const request = createDirectAdapter();
      const provider = new YahooProvider(storage, request);

      await provider.fetch({
        symbol: 'AAPL',
        period: '1y',
        interval: '1d',
        mockMode: false,
      });

      expect(capturedUrl).toContain('finance.yahoo.com');
      expect(capturedUrl).toContain('AAPL');

      storage.close();
    });
  });
});

describe('Populate DB CLI Simulation', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('simulates full populate-db flow with multiple providers', async () => {
    global.fetch = createMockFetch();

    const storage = new SQLiteAdapter(':memory:');
    const request = createDirectAdapter({ fred: 'test-key' });

    // Simulate the provider registry creation from populate-db
    const providers = {
      fred: new FREDProvider(storage, request),
      coingecko: new CoinGeckoProvider(storage, request),
      yahoo: new YahooProvider(storage, request),
      treasury: new TreasuryProvider(storage, request),
    };

    // Simulate fetching from each provider like populate-db does
    const results: Array<{ provider: string; success: boolean; dataPoints: number }> = [];

    // FRED
    try {
      const result = await providers.fred.fetch({ seriesId: 'M2SL', mockMode: false });
      results.push({ provider: 'fred', success: true, dataPoints: result.series.data.length });
    } catch (e) {
      results.push({ provider: 'fred', success: false, dataPoints: 0 });
    }

    // CoinGecko
    try {
      const result = await providers.coingecko.fetch({
        coinId: 'bitcoin',
        endpoint: 'market_chart',
        days: 30,
        mockMode: false,
      });
      results.push({ provider: 'coingecko', success: true, dataPoints: result.series.data.length });
    } catch (e) {
      results.push({ provider: 'coingecko', success: false, dataPoints: 0 });
    }

    // Yahoo
    try {
      const result = await providers.yahoo.fetch({
        symbol: 'SPY',
        period: '1y',
        interval: '1d',
        mockMode: false,
      });
      results.push({ provider: 'yahoo', success: true, dataPoints: result.series.data.length });
    } catch (e) {
      results.push({ provider: 'yahoo', success: false, dataPoints: 0 });
    }

    // Treasury
    try {
      const result = await providers.treasury.fetch({
        dataset: 'debt_to_penny',
        mockMode: false,
      });
      results.push({ provider: 'treasury', success: true, dataPoints: result.series.data.length });
    } catch (e) {
      results.push({ provider: 'treasury', success: false, dataPoints: 0 });
    }

    // Verify all providers succeeded
    expect(results.filter((r) => r.success).length).toBe(4);
    expect(results.every((r) => r.dataPoints > 0)).toBe(true);

    // Verify storage stats
    const stats = await storage.getStats();
    expect(stats.totalSeries).toBe(4);
    expect(stats.totalDataPoints).toBe(18); // 5 + 5 + 5 + 3

    storage.close();
  });

  test('simulates dry-run mode (in-memory database)', async () => {
    global.fetch = createMockFetch();

    // Dry-run uses in-memory database
    const storage = new SQLiteAdapter(':memory:');
    const request = createDirectAdapter({ fred: 'test-key' });
    const provider = new FREDProvider(storage, request);

    await provider.fetch({ seriesId: 'M2SL', mockMode: false });

    const stats = await storage.getStats();
    expect(stats.totalSeries).toBe(1);

    // When storage is closed, data is lost (simulating dry-run)
    storage.close();

    // New storage instance has no data
    const newStorage = new SQLiteAdapter(':memory:');
    const newStats = await newStorage.getStats();
    expect(newStats.totalSeries).toBe(0);
    newStorage.close();
  });

  test('simulates tracking changes (added vs updated vs unchanged)', async () => {
    global.fetch = createMockFetch();

    const storage = new SQLiteAdapter(':memory:');
    const request = createDirectAdapter({ fred: 'test-key' });
    const provider = new FREDProvider(storage, request);

    // First fetch - should be "added"
    const result1 = await provider.fetch({ seriesId: 'M2SL', mockMode: false });
    const action1 = result1.fromCache ? 'unchanged' : 'added';
    expect(action1).toBe('added');

    // Second fetch - should be "unchanged" (from cache)
    const result2 = await provider.fetch({ seriesId: 'M2SL', mockMode: false });
    const action2 = result2.fromCache ? 'unchanged' : 'updated';
    expect(action2).toBe('unchanged');

    // Force refresh - should be "updated"
    const result3 = await provider.fetch({
      seriesId: 'M2SL',
      mockMode: false,
      cache: { forceRefresh: true },
    });
    const action3 = result3.fromCache ? 'unchanged' : 'updated';
    expect(action3).toBe('updated');

    storage.close();
  });
});
