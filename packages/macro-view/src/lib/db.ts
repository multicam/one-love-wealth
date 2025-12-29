import Dexie, { type Table } from 'dexie';

export interface EconomicSeries {
	id: string; // e.g., 'FRED:M2SL'
	source: 'FRED' | 'COINGECKO' | 'CALCULATED';
	lastUpdated: number; // timestamp
	data: DataPoint[]; // Time series data
	meta: any; // Frequency, units, etc.
}

export interface DataPoint {
	date: string; // ISO Date
	value: number;
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
		this.version(1).stores({
			series: 'id, source, lastUpdated',
			scenarios: 'id, name, createdAt'
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
