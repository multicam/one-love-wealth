import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';

describe('MacroViewDatabase', () => {
	beforeEach(async () => {
		await db.series.clear();
		await db.scenarios.clear();
	});

	it('should save and retrieve an economic series', async () => {
		const series = {
			id: 'FRED:M2SL',
			source: 'FRED' as const,
			lastUpdated: Date.now(),
			data: [{ time: new Date('2023-01-01').getTime(), value: 100 }],
			meta: { units: 'Billions of Dollars' }
		};

		await db.saveSeries(series);
		const retrieved = await db.getSeries('FRED:M2SL');
		expect(retrieved).toEqual(series);
	});

	it('should save a user scenario', async () => {
		const scenario = {
			id: 'test-uuid',
			name: 'Test Scenario',
			createdAt: Date.now(),
			assumptions: {
				liquidityGrowth: 5,
				gdpGrowth: 2,
				customMultipliers: {}
			},
			output: {
				btcTarget: 100000,
				confidenceInterval: [90000, 110000] as [number, number]
			}
		};

		await db.saveScenario(scenario);
		const retrieved = await db.scenarios.get('test-uuid');
		expect(retrieved).toEqual(scenario);
	});
});
