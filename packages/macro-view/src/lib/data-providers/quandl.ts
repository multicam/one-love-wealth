import { DataProvider } from './base';
import type { QuandlDataSourceConfig } from '../types/providers/quandl';
import type { DataPoint } from '../db';

/**
 * Quandl (Nasdaq Data Link) data provider
 * Alternative economic time series, commodities, and financial data
 */
export class QuandlProvider extends DataProvider<QuandlDataSourceConfig> {
	readonly name = 'Quandl';
	readonly cachePrefix = 'QUANDL';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

	/**
	 * Build proxy URL for Quandl request
	 */
	protected buildUrl(config: QuandlDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('database', config.databaseCode);
		params.set('dataset', config.datasetCode);

		if (config.column !== undefined) {
			params.set('column_index', config.column.toString());
		}

		if (config.startDate) {
			params.set('start_date', config.startDate);
		}

		if (config.endDate) {
			params.set('end_date', config.endDate);
		}

		if (config.collapse && config.collapse !== 'none') {
			params.set('collapse', config.collapse);
		}

		if (config.transform && config.transform !== 'none') {
			params.set('transform', config.transform);
		}

		if (config.rows) {
			params.set('rows', config.rows.toString());
		}

		return `/api/proxy/quandl?${params.toString()}`;
	}

	/**
	 * Transform Quandl API response to DataPoint array
	 */
	protected transformResponse(json: any, config: QuandlDataSourceConfig): DataPoint[] {
		// Quandl returns data in dataset.data array
		const dataset = json.dataset || json.dataset_data;

		if (!dataset) {
			throw new Error('Invalid Quandl response format');
		}

		const data = dataset.data;

		if (!Array.isArray(data) || data.length === 0) {
			throw new Error(`No data found for ${config.databaseCode}/${config.datasetCode}`);
		}

		// Quandl data format: [date, value1, value2, ...]
		// We use the last column by default, or specified column
		const columnNames = dataset.column_names || [];
		const columnIndex = config.column !== undefined ? config.column : columnNames.length - 1;

		return data
			.map((row: any[]) => {
				const date = row[0];
				const value = row[columnIndex];

				if (!date || value === null || value === undefined) {
					return null;
				}

				return {
					time: new Date(date).getTime(),
					value: parseFloat(value)
				};
			})
			.filter((point): point is DataPoint => point !== null && !isNaN(point.value))
			.sort((a, b) => a.time - b.time);
	}

	/**
	 * Generate mock data for development/fallback
	 */
	protected generateMockData(config: QuandlDataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const today = new Date();
		let value = 100;

		// Generate 200 days of mock data
		for (let i = 199; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);

			// Random walk
			value += (Math.random() - 0.5) * 5;
			value = Math.max(value, 50); // Floor at 50

			points.push({
				time: date.getTime(),
				value: value
			});
		}

		return points;
	}
}
