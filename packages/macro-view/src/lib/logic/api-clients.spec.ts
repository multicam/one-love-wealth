import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { FREDClient } from './api-clients';
import { db } from '../db';

describe('FREDClient', () => {
	beforeEach(async () => {
		await db.series.clear();
		vi.stubGlobal('fetch', vi.fn());
	});

	it('should fetch and cache series data', async () => {
		const mockData = {
			observations: [
				{ date: '2023-01-01', value: '100.5' },
				{ date: '2023-01-02', value: '101.2' }
			]
		};

		(fetch as any).mockResolvedValue({
			ok: true,
			json: async () => mockData
		});

		const client = new FREDClient();
		const result = await client.fetchSeries('M2SL');

		expect(result.id).toBe('FRED:M2SL');
		expect(result.data).toHaveLength(2);
		expect(result.data[0].value).toBe(100.5);

		const cached = await db.getSeries('FRED:M2SL');
		expect(cached).toBeDefined();
		expect(cached?.data[0].value).toBe(100.5);
	});

	it('should return cached data if not stale', async () => {
		const cachedSeries = {
			id: 'FRED:M2SL',
			source: 'FRED' as const,
			lastUpdated: Date.now(),
			data: [{ date: '2023-01-01', value: 99 }],
			meta: {}
		};
		await db.saveSeries(cachedSeries);

		const client = new FREDClient();
		const result = await client.fetchSeries('M2SL');

		expect(result.data[0].value).toBe(99);
		expect(fetch).not.toHaveBeenCalled();
	});
});
