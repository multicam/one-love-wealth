import { DataProvider } from './base';
import type { OECDDataSourceConfig } from '../types/providers/oecd';
import type { DataPoint } from '../db';

/**
 * OECD (Organisation for Economic Co-operation and Development) data provider
 * Development statistics and economic indicators
 */
export class OECDProvider extends DataProvider<OECDDataSourceConfig> {
	readonly name = 'OECD';
	readonly cachePrefix = 'OECD';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (OECD data updates infrequently)

	/**
	 * Build proxy URL for OECD request
	 */
	protected buildUrl(config: OECDDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('dataset', config.dataset);
		params.set('indicator', config.indicator);
		params.set('location', config.location);

		if (config.frequency) {
			params.set('frequency', config.frequency);
		}

		if (config.startTime) {
			params.set('start', config.startTime);
		}

		if (config.endTime) {
			params.set('end', config.endTime);
		}

		return `/api/proxy/oecd?${params.toString()}`;
	}

	/**
	 * Transform OECD API response to DataPoint array
	 */
	protected transformResponse(json: any, config: OECDDataSourceConfig): DataPoint[] {
		// OECD SDMX-JSON format has complex nested structure
		const dataSets = json.dataSets;
		const structure = json.structure;

		if (!dataSets || !structure) {
			throw new Error('Invalid OECD response format');
		}

		// Extract observations from first dataset
		const dataset = dataSets[0];

		if (!dataset || !dataset.observations) {
			throw new Error(`No data found for ${config.location}/${config.indicator}`);
		}

		// Get time dimension from structure
		const dimensions = structure.dimensions.observation;
		const timeDimension = dimensions.find((d: any) => d.id === 'TIME_PERIOD');

		if (!timeDimension || !timeDimension.values) {
			throw new Error('No time dimension found in OECD response');
		}

		const timePeriods = timeDimension.values;

		// Parse observations
		const points: DataPoint[] = [];

		for (const [key, value] of Object.entries(dataset.observations)) {
			// Key format: "0:1:2" where last index is time
			const indices = key.split(':').map((i) => parseInt(i));
			const timeIndex = indices[indices.length - 1];

			const period = timePeriods[timeIndex];

			if (!period || !period.id) {
				continue;
			}

			// value is an array: [observationValue, observationStatus]
			const obsValue = Array.isArray(value) ? value[0] : value;

			if (obsValue === null || obsValue === undefined) {
				continue;
			}

			// Convert period to date
			const date = this.convertPeriodToDate(period.id, config.frequency);

			points.push({
				date: date,
				value: parseFloat(obsValue)
			});
		}

		return points
			.filter((point) => !isNaN(point.value))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	/**
	 * Convert OECD period format to ISO date
	 */
	private convertPeriodToDate(period: string, frequency?: 'A' | 'Q' | 'M'): string {
		// OECD formats: '2020', '2020-Q1', '2020-01'

		if (period.includes('-Q')) {
			// Quarterly: '2020-Q1' → '2020-03-31'
			const [year, quarter] = period.split('-Q');
			const month = (parseInt(quarter) * 3).toString().padStart(2, '0');
			return `${year}-${month}-01`;
		} else if (period.includes('-')) {
			// Monthly: '2020-01' → '2020-01-01'
			return `${period}-01`;
		} else {
			// Annual: '2020' → '2020-12-31'
			return `${period}-12-31`;
		}
	}

	/**
	 * Generate mock data for development/fallback
	 */
	protected generateMockData(config: OECDDataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const currentYear = new Date().getFullYear();
		let value = 100;

		// Determine frequency
		const frequency = config.frequency || 'A';

		if (frequency === 'A') {
			// Annual: 20 years
			for (let i = currentYear - 19; i <= currentYear; i++) {
				value += (Math.random() - 0.45) * 5;
				points.push({
					date: `${i}-12-31`,
					value: value
				});
			}
		} else if (frequency === 'Q') {
			// Quarterly: 10 years (40 quarters)
			for (let i = 0; i < 40; i++) {
				const year = currentYear - 9 + Math.floor(i / 4);
				const quarter = (i % 4) + 1;
				const month = quarter * 3;
				value += (Math.random() - 0.48) * 3;
				points.push({
					date: `${year}-${month.toString().padStart(2, '0')}-01`,
					value: value
				});
			}
		} else {
			// Monthly: 5 years (60 months)
			for (let i = 0; i < 60; i++) {
				const date = new Date();
				date.setMonth(date.getMonth() - (59 - i));
				value += (Math.random() - 0.48) * 2;
				points.push({
					date: date.toISOString().split('T')[0],
					value: value
				});
			}
		}

		return points;
	}
}
