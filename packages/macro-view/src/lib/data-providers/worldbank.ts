import { DataProvider } from './base';
import type { WorldBankDataSourceConfig } from '../types/providers/worldbank';
import type { DataPoint } from '../db';

/**
 * World Bank Open Data API provider
 * Provides access to 16,000+ global macroeconomic indicators
 * No API key required - fully open API
 */
export class WorldBankProvider extends DataProvider<WorldBankDataSourceConfig> {
	readonly name = 'WorldBank';
	readonly cachePrefix = 'WORLDBANK';
	protected defaultTTL = 90 * 24 * 60 * 60 * 1000; // 90 days (data updates quarterly/annually)

	/**
	 * Build proxy URL for World Bank request
	 */
	protected buildUrl(config: WorldBankDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('indicator', config.indicatorCode);
		params.set('country', config.countryCode || 'USA');

		if (config.dateRange) {
			params.set('date', `${config.dateRange.start}:${config.dateRange.end}`);
		}

		if (config.mrv) {
			params.set('mrv', config.mrv.toString());
		}

		return `/api/proxy/worldbank?${params.toString()}`;
	}

	/**
	 * Transform World Bank response to DataPoint array
	 * World Bank returns [pagination, data] array format
	 */
	protected transformResponse(json: any, config: WorldBankDataSourceConfig): DataPoint[] {
		// World Bank API returns [pagination, data] two-element array
		if (!Array.isArray(json) || json.length < 2) {
			throw new Error('Invalid World Bank response format');
		}

		const data = json[1] || [];

		if (!Array.isArray(data)) {
			throw new Error('World Bank data is not an array');
		}

		return (
			data
				// Filter out null values
				.filter((item: any) => item.value !== null && item.value !== undefined)
				.map((item: any) => ({
					// Use year-end date for annual data
					date: `${item.date}-12-31`,
					value: parseFloat(item.value)
				}))
				// World Bank returns newest first, reverse for chronological order
				.reverse()
				.filter((dp: DataPoint) => !isNaN(dp.value))
		);
	}

	/**
	 * Generate mock data for World Bank series
	 * Creates realistic indicator data based on indicator type
	 */
	protected generateMockData(config: WorldBankDataSourceConfig): DataPoint[] {
		const mockData: DataPoint[] = [];
		const currentYear = new Date().getFullYear();
		const startYear = currentYear - 30; // 30 years of historical data

		// Different base values and patterns for different indicator types
		let baseValue = 100;
		let growthRate = 0.02; // 2% annual growth
		let volatility = 0.05; // 5% volatility

		// GDP indicators - large values
		if (config.indicatorCode.includes('NY.GDP.MKTP')) {
			if (config.countryCode === 'USA' || config.countryCode === 'usa') {
				baseValue = 15_000_000_000_000; // $15 trillion
			} else if (config.countryCode === 'CHN' || config.countryCode === 'chn') {
				baseValue = 10_000_000_000_000; // $10 trillion
			} else {
				baseValue = 1_000_000_000_000; // $1 trillion
			}
			growthRate = 0.03;
			volatility = 0.08;
		}

		// Growth rates - percentage values
		else if (
			config.indicatorCode.includes('.ZG') ||
			config.indicatorCode.includes('.GROW') ||
			config.indicatorCode.includes('GROWTH')
		) {
			baseValue = 2.5; // 2.5% growth
			growthRate = 0;
			volatility = 0.5; // High volatility for growth rates
		}

		// Debt ratios - percentage of GDP
		else if (
			config.indicatorCode.includes('.GD.ZS') ||
			config.indicatorCode.includes('DEBT')
		) {
			baseValue = 60; // 60% of GDP
			growthRate = 0.01; // Slow increase
			volatility = 0.05;
		}

		// Population
		else if (config.indicatorCode.includes('SP.POP')) {
			if (config.countryCode === 'USA' || config.countryCode === 'usa') {
				baseValue = 280_000_000; // 280 million
			} else if (config.countryCode === 'CHN' || config.countryCode === 'chn') {
				baseValue = 1_200_000_000; // 1.2 billion
			} else {
				baseValue = 50_000_000; // 50 million
			}
			growthRate = 0.01;
			volatility = 0.005; // Low volatility for population
		}

		// Trade and current account - percentage of GDP
		else if (
			config.indicatorCode.includes('NE.EXP') ||
			config.indicatorCode.includes('NE.IMP') ||
			config.indicatorCode.includes('BN.CAB')
		) {
			baseValue = 12; // 12% of GDP
			growthRate = 0.005;
			volatility = 0.1;
		}

		// Reserves - large values
		else if (config.indicatorCode.includes('FI.RES')) {
			baseValue = 100_000_000_000; // $100 billion
			growthRate = 0.02;
			volatility = 0.1;
		}

		// Generate annual data
		let currentValue = baseValue;
		for (let year = startYear; year <= currentYear; year++) {
			// Apply growth and random fluctuation
			const randomChange = (Math.random() - 0.5) * 2 * volatility;
			currentValue = currentValue * (1 + growthRate + randomChange);

			// Ensure reasonable bounds
			if (config.indicatorCode.includes('.ZG') || config.indicatorCode.includes('GROWTH')) {
				// Growth rates typically between -5% and +10%
				currentValue = Math.max(-5, Math.min(10, currentValue));
			} else if (config.indicatorCode.includes('.GD.ZS')) {
				// Debt ratios between 20% and 150%
				currentValue = Math.max(20, Math.min(150, currentValue));
			} else {
				// Non-negative for most indicators
				currentValue = Math.max(0, currentValue);
			}

			mockData.push({
				date: `${year}-12-31`,
				value: Math.round(currentValue * 100) / 100
			});
		}

		return mockData;
	}
}

/**
 * Singleton instance
 */
export const worldBankProvider = new WorldBankProvider();
