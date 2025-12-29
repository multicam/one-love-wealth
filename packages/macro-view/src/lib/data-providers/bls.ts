import { DataProvider } from './base';
import type { BLSDataSourceConfig } from '../types/providers/bls';
import type { DataPoint } from '../db';

/**
 * Bureau of Labor Statistics (BLS) API provider
 * Provides US labor market and price data
 * Optional API key via BLS_API_KEY environment variable
 */
export class BLSProvider extends DataProvider<BLSDataSourceConfig> {
	readonly name = 'BLS';
	readonly cachePrefix = 'BLS';
	protected defaultTTL = 30 * 24 * 60 * 60 * 1000; // 30 days (monthly data)

	/**
	 * Build proxy URL for BLS request
	 * Note: BLS uses POST requests, but we pass params as query string
	 * and the proxy route will convert them to POST body
	 */
	protected buildUrl(config: BLSDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('seriesId', config.seriesId);

		if (config.dateRange) {
			params.set('startYear', config.dateRange.startYear.toString());
			params.set('endYear', config.dateRange.endYear.toString());
		} else {
			// Default to last 5 years if no range specified
			const endYear = new Date().getFullYear();
			const startYear = endYear - 5;
			params.set('startYear', startYear.toString());
			params.set('endYear', endYear.toString());
		}

		if (config.calculations) {
			params.set('calculations', 'true');
		}

		if (config.annualAverage) {
			params.set('annualaverage', 'true');
		}

		return `/api/proxy/bls?${params.toString()}`;
	}

	/**
	 * Transform BLS response to DataPoint array
	 * BLS returns { status, Results: { series: [{ seriesID, data: [...] }] } }
	 */
	protected transformResponse(json: any, config: BLSDataSourceConfig): DataPoint[] {
		// Validate response
		if (json.status !== 'REQUEST_SUCCEEDED') {
			const messages = json.message?.join(', ') || 'Unknown error';
			throw new Error(`BLS API error: ${messages}`);
		}

		const series = json.Results?.series?.[0];
		if (!series || !Array.isArray(series.data)) {
			throw new Error('Invalid BLS response format');
		}

		return (
			series.data
				// Filter out annual average duplicates (M13) if not explicitly requested
				.filter((d: any) => {
					if (config.annualAverage) return true;
					return d.period !== 'M13' && d.period !== 'A01';
				})
				.map((d: any) => {
					// Convert period code to date
					// M01-M12 = months, Q01-Q04 = quarters, A01 = annual
					let date: string;

					if (d.period.startsWith('M')) {
						const month = d.period.replace('M', '').padStart(2, '0');
						date = `${d.year}-${month}-01`;
					} else if (d.period.startsWith('Q')) {
						// Use first month of quarter
						const quarter = parseInt(d.period.replace('Q', ''));
						const month = ((quarter - 1) * 3 + 1).toString().padStart(2, '0');
						date = `${d.year}-${month}-01`;
					} else {
						// Annual (A01)
						date = `${d.year}-12-31`;
					}

					return {
						time: new Date(date).getTime(),
						value: parseFloat(d.value)
					};
				})
				// BLS returns newest first, reverse for chronological order
				.reverse()
				.filter((dp: { time: number; value: number }) => !isNaN(dp.value))
		);
	}

	/**
	 * Generate mock data for BLS series
	 * Creates realistic labor market and price data
	 */
	protected generateMockData(config: BLSDataSourceConfig): DataPoint[] {
		const mockData: DataPoint[] = [];
		const endDate = new Date();
		const startDate = new Date();
		startDate.setFullYear(startDate.getFullYear() - 5); // 5 years of data

		// Different base values and patterns for different series types
		let baseValue = 5;
		let volatility = 0.1;
		let trend = 0;

		// Unemployment Rate (LNS14000000, etc.)
		if (config.seriesId.startsWith('LNS14')) {
			baseValue = 4.5; // 4.5% unemployment
			volatility = 0.15;
			trend = -0.0005; // Slight downward trend
		}

		// Labor Force Participation (LNS11300000, etc.)
		else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
			baseValue = 63; // 63% participation
			volatility = 0.05;
			trend = 0.0002; // Slight upward trend
		}

		// Nonfarm Payrolls (CES series)
		else if (config.seriesId.startsWith('CES')) {
			baseValue = 150_000_000; // 150 million jobs
			volatility = 0.002;
			trend = 0.001; // Steady growth
		}

		// Consumer Price Index (CUUR/CUSR series)
		else if (config.seriesId.startsWith('CUUR') || config.seriesId.startsWith('CUSR')) {
			baseValue = 250; // Index value ~250
			volatility = 0.01;
			trend = 0.002; // ~2% annual inflation
		}

		// Producer Price Index (WP series)
		else if (config.seriesId.startsWith('WP')) {
			baseValue = 180; // Index value ~180
			volatility = 0.015;
			trend = 0.0015;
		}

		// Generate monthly data
		let currentValue = baseValue;
		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			// Add trend and random fluctuation
			const randomChange = (Math.random() - 0.5) * 2 * volatility;
			currentValue = currentValue * (1 + trend + randomChange);

			// Ensure reasonable bounds
			if (config.seriesId.startsWith('LNS14')) {
				// Unemployment between 2% and 10%
				currentValue = Math.max(2, Math.min(10, currentValue));
			} else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
				// Labor force participation between 60% and 67%
				currentValue = Math.max(60, Math.min(67, currentValue));
			} else {
				// Non-negative for other series
				currentValue = Math.max(0, currentValue);
			}

			// Format date as YYYY-MM-01
			const year = currentDate.getFullYear();
			const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

			mockData.push({
				time: new Date(`${year}-${month}-01`).getTime(),
				value: Math.round(currentValue * 100) / 100
			});

			// Advance by 1 month
			currentDate.setMonth(currentDate.getMonth() + 1);
		}

		return mockData;
	}
}

/**
 * Singleton instance
 */
export const blsProvider = new BLSProvider();
