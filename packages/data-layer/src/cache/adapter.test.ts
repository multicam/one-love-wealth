import { test, expect, describe, beforeEach } from 'bun:test';
import { MemoryAdapter } from './memory-adapter';
import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';

const mockSeries: DataSeries = {
  id: 'test',
  source: 'TEST',
  lastUpdated: Date.now(),
  data: [{ time: 1704067200000, value: 100 }], // 2024-01-01
};

function testAdapter(name: string, createAdapter: () => CacheAdapter) {
  describe(name, () => {
    let adapter: CacheAdapter;

    beforeEach(async () => {
      adapter = createAdapter();
      await adapter.clear();
    });

    test('get returns null for missing key', async () => {
      const result = await adapter.get('nonexistent');
      expect(result).toBeNull();
    });

    test('set and get roundtrip', async () => {
      await adapter.set('test-key', mockSeries);
      const result = await adapter.get('test-key');
      expect(result).toEqual(mockSeries);
    });

    test('respects TTL expiration', async () => {
      await adapter.set('ttl-test', mockSeries, 100); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = await adapter.get('ttl-test');
      expect(result).toBeNull();
    });

    test('getStale returns expired entries', async () => {
      await adapter.set('stale-test', mockSeries, 100); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));

      // get() returns null (expired)
      const fresh = await adapter.get('stale-test');
      expect(fresh).toBeNull();

      // getStale() still returns the data
      const stale = await adapter.getStale('stale-test');
      expect(stale).toEqual(mockSeries);
    });

    test('delete removes entry', async () => {
      await adapter.set('delete-test', mockSeries);
      await adapter.delete('delete-test');
      const result = await adapter.get('delete-test');
      expect(result).toBeNull();
    });

    test('clear removes all entries', async () => {
      await adapter.set('clear-1', mockSeries);
      await adapter.set('clear-2', mockSeries);
      await adapter.clear();
      expect(await adapter.has('clear-1')).toBe(false);
      expect(await adapter.has('clear-2')).toBe(false);
    });

    test('has returns false for expired entries', async () => {
      await adapter.set('has-test', mockSeries, 100);
      expect(await adapter.has('has-test')).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(await adapter.has('has-test')).toBe(false);
    });

    test('entries without TTL never expire', async () => {
      await adapter.set('no-ttl', mockSeries); // No TTL
      const result = await adapter.get('no-ttl');
      expect(result).toEqual(mockSeries);
      expect(await adapter.has('no-ttl')).toBe(true);
    });
  });
}

testAdapter('MemoryAdapter', () => new MemoryAdapter());
