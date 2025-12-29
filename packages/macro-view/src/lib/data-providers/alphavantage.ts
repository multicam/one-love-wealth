import { DataProvider } from './base';
import type { AlphaVantageDataSourceConfig } from '../types/providers/alphavantage';
import type { DataPoint } from '../db';

/**
 * Alpha Vantage data provider
 * Stock market data, forex, crypto, and economic indicators
 */
export class AlphaVantageProvider extends DataProvider<AlphaVantageDataSourceConfig> {
	readonly name = 'Alpha Vantage';
	readonly cachePrefix = 'ALPHAVANTAGE';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours (due to 25 req/day limit)

	/**
	 * Build proxy URL for Alpha Vantage request
	 */
	protected buildUrl(config: AlphaVantageDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('function', config.function);
		params.set('symbol', config.symbol);

		if (config.interval) {
			params.set('interval', config.interval);
		}

		if (config.outputsize) {
			params.set('outputsize', config.outputsize);
		}

		if (config.datatype) {
			params.set('datatype', config.datatype);
		}

		if (config.fromCurrency) {
			params.set('from_currency', config.fromCurrency);
		}

		if (config.toCurrency) {
			params.set('to_currency', config.toCurrency);
		}

		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		return `/api/proxy/alphavantage?${params.toString()}`;
	}

	/**
	 * Transform Alpha Vantage API response to DataPoint array
	 */
	protected transformResponse(json: any, config: AlphaVantageDataSourceConfig): DataPoint[] {
		// Handle error responses
		if (json['Error Message']) {
			throw new Error(json['Error Message']);
		}

		if (json['Note']) {
			throw new Error('Alpha Vantage API rate limit exceeded');
		}

		// Determine the time series key based on function
		let timeSeriesKey = this.getTimeSeriesKey(config.function);

		const timeSeries = json[timeSeriesKey];

		if (!timeSeries) {
			throw new Error(`No data found for ${config.symbol}`);
		}

		// Convert to DataPoint array
		const points: DataPoint[] = [];

		for (const [date, values] of Object.entries(timeSeries)) {
			let value: number;

			// Extract appropriate value based on function type
			if (config.function.startsWith('TIME_SERIES')) {
				// Stock data - use close price (or adjusted close)
				value = parseFloat((values as any)['4. close'] || (values as any)['5. adjusted close']);
			} else if (config.function.startsWith('FX_')) {
				// Forex data
				value = parseFloat((values as any)['4. close']);
			} else if (config.function.startsWith('DIGITAL_CURRENCY')) {
				// Crypto data - use close in USD
				value = parseFloat((values as any)['4a. close (USD)']);
			} else {
				// Economic indicators - use 'value' field
				value = parseFloat((values as any)['value']);
			}

			if (!isNaN(value)) {
				points.push({
					date: date,
					value: value
				});
			}
		}

		// Sort by date (Alpha Vantage returns newest first)
		return points.sort((a, b) => a.date.localeCompare(b.date));
	}

	/**
	 * Get the time series key based on function
	 */
	private getTimeSeriesKey(func: string): string {
		const keyMap: Record<string, string> = {
			TIME_SERIES_INTRADAY: 'Time Series',
			TIME_SERIES_DAILY: 'Time Series (Daily)',
			TIME_SERIES_DAILY_ADJUSTED: 'Time Series (Daily)',
			TIME_SERIES_WEEKLY: 'Weekly Time Series',
			TIME_SERIES_WEEKLY_ADJUSTED: 'Weekly Adjusted Time Series',
			TIME_SERIES_MONTHLY: 'Monthly Time Series',
			TIME_SERIES_MONTHLY_ADJUSTED: 'Monthly Adjusted Time Series',
			FX_INTRADAY: 'Time Series FX (Intraday)',
			FX_DAILY: 'Time Series FX (Daily)',
			FX_WEEKLY: 'Time Series FX (Weekly)',
			FX_MONTHLY: 'Time Series FX (Monthly)',
			DIGITAL_CURRENCY_DAILY: 'Time Series (Digital Currency Daily)',
			DIGITAL_CURRENCY_WEEKLY: 'Time Series (Digital Currency Weekly)',
			DIGITAL_CURRENCY_MONTHLY: 'Time Series (Digital Currency Monthly)',
			// Economic indicators use 'data' key
			REAL_GDP: 'data',
			REAL_GDP_PER_CAPITA: 'data',
			TREASURY_YIELD: 'data',
			FEDERAL_FUNDS_RATE: 'data',
			CPI: 'data',
			INFLATION: 'data',
			RETAIL_SALES: 'data',
			DURABLES: 'data',
			UNEMPLOYMENT: 'data',
			NONFARM_PAYROLL: 'data'
		};

		return keyMap[func] || 'Time Series (Daily)';
	}

	/**
	 * Generate mock data for development/fallback
	 */
	protected generateMockData(config: AlphaVantageDataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const today = new Date();
		const baseValue = config.function.startsWith('DIGITAL') ? 40000 : 150;

		// Generate 200 days of mock data
		for (let i = 199; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);

			// Random walk with slight upward trend
			const randomChange = (Math.random() - 0.48) * (baseValue * 0.02);
			const value = i === 199 ? baseValue : points[points.length - 1].value + randomChange;

			points.push({
				date: date.toISOString().split('T')[0],
				value: Math.max(value, baseValue * 0.5) // Prevent going too low
			});
		}

		return points;
	}
}
