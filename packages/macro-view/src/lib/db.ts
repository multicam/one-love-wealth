import Dexie, { type Table } from 'dexie';
import type { DataPoint } from '@one-love-wealth/data-layer';

// Re-export DataPoint for convenience
export type { DataPoint };

export interface EconomicSeries {
	id: string; // e.g., 'FRED:M2SL'
	source: 'FRED' | 'COINGECKO' | 'YAHOO' | 'CALCULATED';
	lastUpdated: number; // timestamp
	data: DataPoint[]; // Time series data
	meta: any; // Frequency, units, etc.
}

export interface UserScenario {
	id: string; // UUID
	name: string;
	createdAt: number;
	assumptions: {
		liquidityGrowth: number; // %
		gdpGrowth: number; // %
		customMultipliers: Record<string, number>;
	};
	output: {
		btcTarget: number;
		confidenceInterval: [number, number];
	};
}

export class MacroViewDatabase extends Dexie {
	series!: Table<EconomicSeries>;
	scenarios!: Table<UserScenario>;

	constructor() {
		super('MacroViewDB');

		// Version 1: Original schema with date: string
		this.version(1).stores({
			series: 'id, source, lastUpdated',
			scenarios: 'id, name, createdAt'
		});

		// Version 2: Migrate DataPoint from date: string to time: number
		this.version(2)
			.stores({
				series: 'id, source, lastUpdated',
				scenarios: 'id, name, createdAt'
			})
			.upgrade(async (trans) => {
				console.log('[MacroViewDB] Migrating to v2: Converting date strings to timestamps...');
				const seriesTable = trans.table('series');
				const allSeries = await seriesTable.toArray();

				for (const series of allSeries) {
					if (series.data && Array.isArray(series.data)) {
						const migratedData = series.data.map((point: { date?: string; time?: number; value: number }) => {
							// If already has time, skip
							if (point.time !== undefined) return point;
							// Convert date string to timestamp
							if (point.date && typeof point.date === 'string') {
								return {
									time: new Date(point.date).getTime(),
									value: point.value
								};
							}
							return point;
						});
						await seriesTable.update(series.id, { data: migratedData });
					}
				}
				console.log(`[MacroViewDB] Migrated ${allSeries.length} series to v2 format`);
			});
	}

	async saveSeries(series: EconomicSeries) {
		return await this.series.put(series);
	}

	async getSeries(id: string) {
		return await this.series.get(id);
	}

	async saveScenario(scenario: UserScenario) {
		return await this.scenarios.put(scenario);
	}
}

export const db = new MacroViewDatabase();
