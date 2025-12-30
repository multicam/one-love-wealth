import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { SQLiteAdapter } from './sqlite-adapter';
import type { DataSeries } from '../types/series';
import { unlink } from 'node:fs/promises';

const TEST_DB_PATH = ':memory:'; // Use in-memory database for tests

describe('SQLiteAdapter', () => {
  let adapter: SQLiteAdapter;

  beforeEach(() => {
    adapter = new SQLiteAdapter(TEST_DB_PATH);
  });

  afterEach(() => {
    adapter.close();
  });

  const createMockSeries = (
    id: string,
    source: string = 'TEST',
    dataPoints: number = 10
  ): DataSeries => ({
    id,
    source,
    lastUpdated: Date.now(),
    data: Array.from({ length: dataPoints }, (_, i) => ({
      time: Date.now() - i * 86400000,
      value: Math.random() * 100,
    })),
    meta: { test: true },
  });

  describe('Basic Operations', () => {
    test('set and get series', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series);

      const retrieved = await adapter.get('test-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-1');
      expect(retrieved?.source).toBe('TEST');
      expect(retrieved?.data.length).toBe(10);
    });

    test('returns null for non-existent key', async () => {
      const retrieved = await adapter.get('non-existent');
      expect(retrieved).toBeNull();
    });

    test('delete removes entry', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series);

      await adapter.delete('test-1');

      const retrieved = await adapter.get('test-1');
      expect(retrieved).toBeNull();
    });

    test('clear removes all entries', async () => {
      await adapter.set('test-1', createMockSeries('test-1'));
      await adapter.set('test-2', createMockSeries('test-2'));

      await adapter.clear();

      const retrieved1 = await adapter.get('test-1');
      const retrieved2 = await adapter.get('test-2');
      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });

    test('has returns true for existing non-expired entry', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series);

      const exists = await adapter.has('test-1');
      expect(exists).toBe(true);
    });

    test('has returns false for non-existent entry', async () => {
      const exists = await adapter.has('non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('TTL and Expiration', () => {
    test('get returns null for expired entry', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series, 1); // 1ms TTL

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const retrieved = await adapter.get('test-1');
      expect(retrieved).toBeNull();
    });

    test('getStale returns expired entry', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series, 1); // 1ms TTL

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const stale = await adapter.getStale('test-1');
      expect(stale).not.toBeNull();
      expect(stale?.id).toBe('test-1');
    });

    test('has returns false for expired entry', async () => {
      const series = createMockSeries('test-1');
      await adapter.set('test-1', series, 1); // 1ms TTL

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const exists = await adapter.has('test-1');
      expect(exists).toBe(false);
    });

    test('cleanExpired removes expired entries', async () => {
      await adapter.set('test-1', createMockSeries('test-1'), 1);
      await adapter.set('test-2', createMockSeries('test-2')); // No TTL

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cleaned = await adapter.cleanExpired();
      expect(cleaned).toBe(1);

      const stale1 = await adapter.getStale('test-1');
      const stale2 = await adapter.getStale('test-2');
      expect(stale1).toBeNull(); // Cleaned
      expect(stale2).not.toBeNull(); // Still there
    });
  });

  describe('List Operations', () => {
    beforeEach(async () => {
      // Create test data
      await adapter.set('fred-1', createMockSeries('fred-1', 'FRED', 100));
      await adapter.set('fred-2', createMockSeries('fred-2', 'FRED', 50));
      await adapter.set('yahoo-1', createMockSeries('yahoo-1', 'YAHOO', 200));
      await new Promise((resolve) => setTimeout(resolve, 10));
      await adapter.set('yahoo-2', createMockSeries('yahoo-2', 'YAHOO', 150));
    });

    test('list returns all series', async () => {
      const series = await adapter.list();
      expect(series.length).toBe(4);
    });

    test('list filters by source', async () => {
      const fredSeries = await adapter.list({ source: 'FRED' });
      expect(fredSeries.length).toBe(2);
      expect(fredSeries.every((s) => s.source === 'FRED')).toBe(true);
    });

    test('list respects limit', async () => {
      const series = await adapter.list({ limit: 2 });
      expect(series.length).toBe(2);
    });

    test('list respects offset', async () => {
      const page1 = await adapter.list({ limit: 2, offset: 0 });
      const page2 = await adapter.list({ limit: 2, offset: 2 });

      expect(page1.length).toBe(2);
      expect(page2.length).toBe(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    test('list sorts by lastUpdated desc', async () => {
      const series = await adapter.list({
        sortBy: 'lastUpdated',
        sortDir: 'desc',
      });

      // yahoo-2 was created last
      expect(series[0].id).toBe('yahoo-2');
    });

    test('list sorts by id asc', async () => {
      const series = await adapter.list({ sortBy: 'id', sortDir: 'asc' });

      expect(series[0].id).toBe('fred-1');
      expect(series[series.length - 1].id).toBe('yahoo-2');
    });
  });

  describe('Query Operations', () => {
    test('listUpdatedSince returns recent series', async () => {
      const timestamp = Date.now();

      await adapter.set('old', createMockSeries('old'));
      await new Promise((resolve) => setTimeout(resolve, 10));
      await adapter.set('new', createMockSeries('new'));

      const recent = await adapter.listUpdatedSince(timestamp);
      expect(recent.length).toBeGreaterThanOrEqual(1);
      expect(recent.some((s) => s.id === 'new')).toBe(true);
    });

    test('getOutdated returns old series', async () => {
      const oldSeries = createMockSeries('old');
      oldSeries.lastUpdated = Date.now() - 10000; // 10 seconds ago

      await adapter.set('old', oldSeries);
      await adapter.set('new', createMockSeries('new'));

      const outdated = await adapter.getOutdated(5000); // 5 seconds max age
      expect(outdated).toContain('old');
      expect(outdated).not.toContain('new');
    });

    test('getAllKeys returns all series IDs', async () => {
      await adapter.set('test-1', createMockSeries('test-1'));
      await adapter.set('test-2', createMockSeries('test-2'));
      await adapter.set('test-3', createMockSeries('test-3'));

      const keys = await adapter.getAllKeys();
      expect(keys.length).toBe(3);
      expect(keys).toContain('test-1');
      expect(keys).toContain('test-2');
      expect(keys).toContain('test-3');
    });
  });

  describe('Batch Operations', () => {
    test('setMany inserts multiple series', async () => {
      const entries = [
        { key: 'batch-1', series: createMockSeries('batch-1') },
        { key: 'batch-2', series: createMockSeries('batch-2') },
        { key: 'batch-3', series: createMockSeries('batch-3') },
      ];

      await adapter.setMany(entries);

      const retrieved1 = await adapter.get('batch-1');
      const retrieved2 = await adapter.get('batch-2');
      const retrieved3 = await adapter.get('batch-3');

      expect(retrieved1).not.toBeNull();
      expect(retrieved2).not.toBeNull();
      expect(retrieved3).not.toBeNull();
    });

    test('deleteMany removes multiple series', async () => {
      await adapter.set('test-1', createMockSeries('test-1'));
      await adapter.set('test-2', createMockSeries('test-2'));
      await adapter.set('test-3', createMockSeries('test-3'));

      await adapter.deleteMany(['test-1', 'test-3']);

      const retrieved1 = await adapter.get('test-1');
      const retrieved2 = await adapter.get('test-2');
      const retrieved3 = await adapter.get('test-3');

      expect(retrieved1).toBeNull();
      expect(retrieved2).not.toBeNull();
      expect(retrieved3).toBeNull();
    });
  });

  describe('Statistics', () => {
    test('getStats returns correct statistics', async () => {
      await adapter.set('fred-1', createMockSeries('fred-1', 'FRED', 100));
      await adapter.set('fred-2', createMockSeries('fred-2', 'FRED', 50));
      await adapter.set('yahoo-1', createMockSeries('yahoo-1', 'YAHOO', 200));

      const stats = await adapter.getStats();

      expect(stats.totalSeries).toBe(3);
      expect(stats.totalDataPoints).toBe(350); // 100 + 50 + 200
      expect(stats.bySource.FRED).toBe(2);
      expect(stats.bySource.YAHOO).toBe(1);
      expect(stats.oldestEntry).toBeDefined();
      expect(stats.newestEntry).toBeDefined();
    });

    test('getStats handles empty database', async () => {
      const stats = await adapter.getStats();

      expect(stats.totalSeries).toBe(0);
      expect(stats.totalDataPoints).toBe(0);
      expect(Object.keys(stats.bySource).length).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    test('preserves data types', async () => {
      const series = createMockSeries('test');
      series.meta = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };

      await adapter.set('test', series);

      const retrieved = await adapter.get('test');
      expect(retrieved?.meta).toEqual(series.meta);
    });

    test('handles large datasets', async () => {
      const largeSeries = createMockSeries('large', 'TEST', 10000);
      await adapter.set('large', largeSeries);

      const retrieved = await adapter.get('large');
      expect(retrieved?.data.length).toBe(10000);
    });

    test('handles special characters in keys', async () => {
      const specialKey = 'test:with/special.chars@123';
      const series = createMockSeries(specialKey);

      await adapter.set(specialKey, series);

      const retrieved = await adapter.get(specialKey);
      expect(retrieved?.id).toBe(specialKey);
    });
  });
});
