import { DataProvider } from './base';
import type { TreasuryDataSourceConfig } from '../types/providers/treasury';
import { TREASURY_VALUE_FIELDS, TREASURY_DATE_FIELDS } from '../types/providers/treasury';
import type { DataPoint } from '../db';

/**
 * US Treasury Fiscal Data API provider
 * Provides government debt and fiscal data
 * No API key required - fully open API
 */
export class TreasuryProvider extends DataProvider<TreasuryDataSourceConfig> {
	readonly name = 'Treasury';
	readonly cachePrefix = 'TREASURY';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours (daily updates for most datasets)

	/**
	 * Build proxy URL for Treasury request
	 */
	protected buildUrl(config: TreasuryDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('dataset', config.dataset);

		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		if (config.fields && config.fields.length > 0) {
			params.set('fields', config.fields.join(','));
		}

		return `/api/proxy/treasury?${params.toString()}`;
	}

	/**
	 * Transform Treasury response to DataPoint array
	 * Treasury returns { data: [], meta: {}, links: {} }
	 */
	protected transformResponse(json: any, config: TreasuryDataSourceConfig): DataPoint[] {
		// Validate response structure
		if (!json.data || !Array.isArray(json.data)) {
			throw new Error('Invalid Treasury API response format');
		}

		const data = json.data;

		// Get the correct field names for this dataset
		const dateField = TREASURY_DATE_FIELDS[config.dataset];
		const valueField = TREASURY_VALUE_FIELDS[config.dataset];

		return (
			data
				.map((row: any): DataPoint | null => {
					const date = row[dateField];
					const value = row[valueField];

					// Skip rows with missing data
					if (!date || value === null || value === undefined) {
						return null;
					}

					return {
						time: new Date(date).getTime(),
						value: parseFloat(value)
					};
				})
				.filter((dp: { time: number; value: number } | null): dp is DataPoint => dp !== null && !isNaN(dp.value))
		);
	}

	/**
	 * Generate mock data for Treasury series
	 * Creates realistic debt and fiscal data
	 */
	protected generateMockData(config: TreasuryDataSourceConfig): DataPoint[] {
		const mockData: DataPoint[] = [];
		const endDate = new Date();
		const startDate = new Date();

		// Different date ranges for different datasets
		if (config.dataset === 'historical_debt') {
			startDate.setFullYear(startDate.getFullYear() - 30); // 30 years for historical
		} else {
			startDate.setFullYear(startDate.getFullYear() - 5); // 5 years for recent data
		}

		// Different base values and patterns for different datasets
		let baseValue = 1;
		let growthRate = 0.0005; // Daily growth rate
		let volatility = 0.001;

		// Debt to the Penny - daily total debt
		if (config.dataset === 'debt_to_penny' || config.dataset === 'historical_debt') {
			baseValue = 25_000_000_000_000; // $25 trillion
			growthRate = 0.0003; // Steady growth
			volatility = 0.0005; // Low volatility for debt
		}

		// Average Interest Rates - percentage values
		else if (config.dataset === 'avg_interest_rates') {
			baseValue = 2.5; // 2.5% average rate
			growthRate = 0.00005; // Slow increase
			volatility = 0.02; // Some volatility in rates
		}

		// Interest Expense - monthly spending
		else if (config.dataset === 'interest_expense') {
			baseValue = 60_000_000_000; // $60 billion per month
			growthRate = 0.001; // Growing expense
			volatility = 0.05; // Some monthly variation
		}

		// Generate data (daily for most, monthly for interest_expense)
		let currentValue = baseValue;
		let currentDate = new Date(startDate);

		const isMonthly = config.dataset === 'interest_expense';

		while (currentDate <= endDate) {
			// Add growth and random fluctuation
			const randomChange = (Math.random() - 0.5) * 2 * volatility;
			currentValue = currentValue * (1 + growthRate + randomChange);

			// Ensure reasonable bounds
			if (config.dataset === 'avg_interest_rates') {
				// Interest rates between 0.5% and 5%
				currentValue = Math.max(0.5, Math.min(5, currentValue));
			} else {
				// Non-negative for debt and expense
				currentValue = Math.max(0, currentValue);
			}

			// Format date
			const year = currentDate.getFullYear();
			const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
			const day = currentDate.getDate().toString().padStart(2, '0');
			const date = `${year}-${month}-${day}`;

			mockData.push({
				time: new Date(date).getTime(),
				value: Math.round(currentValue * 100) / 100
			});

			// Advance date
			if (isMonthly) {
				currentDate.setMonth(currentDate.getMonth() + 1);
			} else {
				currentDate.setDate(currentDate.getDate() + 1);
			}
		}

		return mockData;
	}
}

/**
 * Singleton instance
 */
export const treasuryProvider = new TreasuryProvider();
