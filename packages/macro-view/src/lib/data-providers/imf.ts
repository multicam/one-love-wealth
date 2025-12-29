import { DataProvider } from './base';
import type { IMFDataSourceConfig } from '../types/providers/imf';
import type { DataPoint } from '../db';

/**
 * IMF (International Monetary Fund) data provider
 * International monetary and economic data
 */
export class IMFProvider extends DataProvider<IMFDataSourceConfig> {
	readonly name = 'IMF';
	readonly cachePrefix = 'IMF';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (IMF data updates infrequently)

	/**
	 * Build proxy URL for IMF request
	 */
	protected buildUrl(config: IMFDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('database', config.databaseId);
		params.set('indicator', config.indicator);
		params.set('frequency', config.frequency);
		params.set('country', config.countryCode);

		if (config.startPeriod) {
			params.set('start', config.startPeriod);
		}

		if (config.endPeriod) {
			params.set('end', config.endPeriod);
		}

		return `/api/proxy/imf?${params.toString()}`;
	}

	/**
	 * Transform IMF API response to DataPoint array
	 */
	protected transformResponse(json: any, config: IMFDataSourceConfig): DataPoint[] {
		// IMF JSON-stat format has complex structure
		// The data is in CompactData.DataSet.Series.Obs array

		const compactData = json.CompactData || json;

		if (!compactData || !compactData.DataSet || !compactData.DataSet.Series) {
			throw new Error('Invalid IMF response format');
		}

		// Series can be single object or array
		const series = Array.isArray(compactData.DataSet.Series)
			? compactData.DataSet.Series
			: [compactData.DataSet.Series];

		if (series.length === 0) {
			throw new Error(`No data found for ${config.countryCode}/${config.indicator}`);
		}

		// Use first series (should be only one for our query)
		const firstSeries = series[0];

		if (!firstSeries.Obs) {
			throw new Error(`No observations found for ${config.countryCode}/${config.indicator}`);
		}

		// Obs can be single object or array
		const observations = Array.isArray(firstSeries.Obs) ? firstSeries.Obs : [firstSeries.Obs];

		const points: DataPoint[] = [];
		for (const obs of observations) {
			const period = obs['@TIME_PERIOD'];
			const rawValue = obs['@OBS_VALUE'];

			if (!period || rawValue === undefined || rawValue === null) {
				continue;
			}

			const value = parseFloat(rawValue);
			if (isNaN(value)) {
				continue;
			}

			// Convert period format to ISO date
			const date = this.convertPeriodToDate(period, config.frequency);

			points.push({
				time: new Date(date).getTime(),
				value
			});
		}
		return points.sort((a, b) => a.time - b.time);
	}

	/**
	 * Convert IMF period format to ISO date
	 */
	private convertPeriodToDate(period: string, frequency: 'A' | 'Q' | 'M'): string {
		if (frequency === 'A') {
			// Annual: '2020' → '2020-12-31'
			return `${period}-12-31`;
		} else if (frequency === 'Q') {
			// Quarterly: '2020-Q1' → '2020-03-31'
			const [year, quarter] = period.split('-Q');
			const month = (parseInt(quarter) * 3).toString().padStart(2, '0');
			const day = '31'; // Use end of quarter
			return `${year}-${month}-${day}`;
		} else {
			// Monthly: '2020-01' → '2020-01-31'
			const [year, month] = period.split('-');
			return `${year}-${month}-01`;
		}
	}

	/**
	 * Generate mock data for development/fallback
	 */
	protected generateMockData(config: IMFDataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const currentYear = new Date().getFullYear();
		let value = 100;

		// Generate data based on frequency
		if (config.frequency === 'A') {
			// Annual: 20 years
			for (let i = currentYear - 19; i <= currentYear; i++) {
				value += (Math.random() - 0.45) * 5;
				points.push({
					time: new Date(`${i}-12-31`).getTime(),
					value: value
				});
			}
		} else if (config.frequency === 'Q') {
			// Quarterly: 10 years (40 quarters)
			for (let i = 0; i < 40; i++) {
				const year = currentYear - 9 + Math.floor(i / 4);
				const quarter = (i % 4) + 1;
				const month = quarter * 3;
				value += (Math.random() - 0.48) * 3;
				points.push({
					time: new Date(`${year}-${month.toString().padStart(2, '0')}-01`).getTime(),
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
					time: date.getTime(),
					value: value
				});
			}
		}

		return points;
	}
}
