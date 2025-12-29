import { DataProvider } from './base';
import type { YahooDataSourceConfig } from '../types/providers/yahoo';
import type { DataPoint } from '../db';

/**
 * Yahoo Finance data provider
 * Uses yahoo-finance2 library via server-side proxy for stock market data
 */
export class YahooProvider extends DataProvider<YahooDataSourceConfig> {
	readonly name = 'Yahoo';
	readonly cachePrefix = 'YAHOO';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours for stock data

	/**
	 * Build proxy URL for Yahoo Finance request
	 */
	protected buildUrl(config: YahooDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('symbol', config.symbol);

		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		if (config.interval) {
			params.set('interval', config.interval);
		}

		if (config.includeAdjustedClose !== undefined) {
			params.set('includeAdjustedClose', config.includeAdjustedClose.toString());
		}

		return `/api/proxy/yahoo?${params.toString()}`;
	}

	/**
	 * Transform Yahoo Finance response to DataPoint array
	 */
	protected transformResponse(json: any, config: YahooDataSourceConfig): DataPoint[] {
		if (!Array.isArray(json)) {
			throw new Error('Invalid Yahoo Finance response format');
		}

		return json
			.map((row: any) => {
				const date = new Date(row.date).toISOString().split('T')[0];
				const value =
					config.includeAdjustedClose !== false && row.adjClose !== undefined
						? row.adjClose
						: row.close;

				return {
					date,
					value: parseFloat(value)
				};
			})
			.filter((dp: DataPoint) => !isNaN(dp.value));
	}

	/**
	 * Generate mock data for Yahoo Finance series
	 * Creates realistic stock index movements with trends and volatility
	 */
	protected generateMockData(config: YahooDataSourceConfig): DataPoint[] {
		const mockData: DataPoint[] = [];
		const endDate = new Date();
		const startDate = new Date();
		startDate.setFullYear(startDate.getFullYear() - 2); // 2 years of data

		// Different base values for different symbols
		let baseValue = 4500; // Default (S&P 500 range)
		let volatility = 0.01; // 1% daily volatility

		if (config.symbol.includes('NDX') || config.symbol.includes('NASDAQ')) {
			baseValue = 15000; // NASDAQ-100 range
			volatility = 0.015; // Higher volatility
		} else if (config.symbol.includes('DJI') || config.symbol.includes('DOW')) {
			baseValue = 35000; // Dow Jones range
			volatility = 0.008;
		} else if (config.symbol.includes('VIX')) {
			baseValue = 18; // VIX range
			volatility = 0.05; // Very high volatility
		} else if (config.symbol.includes('TNX')) {
			baseValue = 4; // 10-year yield %
			volatility = 0.02;
		}

		let currentValue = baseValue;
		const trend = 0.0003; // Slight upward trend per day

		let currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			// Skip weekends for stock data (unless it's VIX or rates)
			const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
			if (!isWeekend || config.symbol.includes('VIX') || config.symbol.includes('TNX')) {
				// Random walk with trend
				const randomChange = (Math.random() - 0.5) * 2 * volatility;
				currentValue = currentValue * (1 + trend + randomChange);

				// Ensure non-negative values
				currentValue = Math.max(currentValue, baseValue * 0.5);

				mockData.push({
					date: currentDate.toISOString().split('T')[0],
					value: Math.round(currentValue * 100) / 100
				});
			}

			// Advance by 1 day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return mockData;
	}
}

/**
 * Singleton instance
 */
export const yahooProvider = new YahooProvider();
