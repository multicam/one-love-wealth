import { DataProvider } from './base';
import type { {{NAME_PASCAL}}DataSourceConfig } from '../types/providers/{{NAME}}';
import type { DataPoint } from '../db';

/**
 * {{DISPLAY_NAME}} data provider
 * [Add description of data source and usage]
 */
export class {{NAME_PASCAL}}Provider extends DataProvider<{{NAME_PASCAL}}DataSourceConfig> {
	readonly name = '{{DISPLAY_NAME}}';
	readonly cachePrefix = '{{NAME_UPPER}}';
	protected defaultTTL = {{CACHE_TTL}}; // Cache TTL in milliseconds

	/**
	 * Build proxy URL for {{DISPLAY_NAME}} request
	 */
	protected buildUrl(config: {{NAME_PASCAL}}DataSourceConfig): string {
		const params = new URLSearchParams();

		// Add required parameters
		params.set('symbol', config.symbol);

		// Add optional parameters
		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		// TODO: Add additional provider-specific parameters

		return `/api/proxy/{{NAME}}?${params.toString()}`;
	}

	/**
	 * Transform {{DISPLAY_NAME}} API response to DataPoint array
	 */
	protected transformResponse(json: any, config: {{NAME_PASCAL}}DataSourceConfig): DataPoint[] {
		// TODO: Implement response transformation based on API format
		// This is a basic example - customize based on actual API response

		if (!Array.isArray(json)) {
			throw new Error('Invalid {{DISPLAY_NAME}} response format');
		}

		return json
			.map((row: any) => {
				// TODO: Extract date and value from API response
				// Adjust field names based on actual API response structure
				const date = row.date; // Adjust field name
				const value = row.value; // Adjust field name

				if (!date || value === undefined || value === null) {
					return null;
				}

				return {
					date: new Date(date).toISOString().split('T')[0],
					value: parseFloat(value)
				};
			})
			.filter((point): point is DataPoint => point !== null);
	}

	/**
	 * Generate mock data for development/fallback
	 */
	protected generateMockData(config: {{NAME_PASCAL}}DataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const today = new Date();

		// Generate 100 days of mock data
		for (let i = 99; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);

			points.push({
				date: date.toISOString().split('T')[0],
				value: 100 + Math.random() * 20 - 10 // Random walk around 100
			});
		}

		return points;
	}
}
