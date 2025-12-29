import { DataProvider } from './base';
import type { FREDDataSourceConfig } from '../types/providers/fred';
import type { DataPoint } from '../db';

export class FREDProvider extends DataProvider<FREDDataSourceConfig> {
	readonly name = 'FRED';
	readonly cachePrefix = 'FRED';

	protected buildUrl(config: FREDDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('series_id', config.seriesId);

		// Date range
		if (config.dateRange?.start) {
			params.set('observation_start', config.dateRange.start);
		}
		if (config.dateRange?.end) {
			params.set('observation_end', config.dateRange.end);
		}
		if (config.dateRange?.limit) {
			params.set('limit', config.dateRange.limit.toString());
			params.set('sort_order', 'desc'); // Get most recent
		}

		// Units transformation - THE KEY PARAMETER!
		if (config.units) {
			params.set('units', config.units);
		}

		// Frequency aggregation
		if (config.frequency) {
			params.set('frequency', config.frequency);
		}
		if (config.aggregationMethod) {
			params.set('aggregation_method', config.aggregationMethod);
		}

		// Real-time period
		if (config.realtime?.start) {
			params.set('realtime_start', config.realtime.start);
		}
		if (config.realtime?.end) {
			params.set('realtime_end', config.realtime.end);
		}

		// Vintage dates
		if (config.vintageDates?.length) {
			params.set('vintage_dates', config.vintageDates.join(','));
		}

		return `/api/proxy/fred?${params.toString()}`;
	}

	protected transformResponse(json: any, config: FREDDataSourceConfig): DataPoint[] {
		if (!json.observations) {
			throw new Error('Invalid FRED response format');
		}

		return json.observations
			.map((obs: any) => ({
				date: obs.date,
				value: parseFloat(obs.value)
			}))
			.filter((dp: DataPoint) => !isNaN(dp.value));
	}

	protected generateMockData(config: FREDDataSourceConfig): DataPoint[] {
		return generateFREDMockSeries(config.seriesId, config.units);
	}
}

/**
 * Generate mock FRED data series for development/fallback
 * Extracted from original api-clients.ts implementation
 */
function generateFREDMockSeries(seriesId: string, units?: string): DataPoint[] {
	const data: DataPoint[] = [];
	const now = new Date();
	let value = 100; // Default baseline

	// Set baseline and trend based on series
	if (seriesId === 'IPMAN') value = 100; // Industrial Production (ISM proxy)
	else if (seriesId === 'GFDEGDQ188S') value = 120; // Debt to GDP %
	else if (seriesId === 'A091RC1Q027SBEA') value = 500; // Interest Payments (B)
	else if (seriesId === 'PPIACO') value = 250; // PPI All Commodities (Gold proxy)
	else if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') value = 4.0; // Rates
	else if (seriesId === 'NFCI') value = -0.5; // Financial Conditions
	else if (seriesId === 'WPU10') value = 120; // Industrial Metals
	else if (seriesId === 'CIVPART') value = 62; // Labor Force
	else if (seriesId === 'SP500' || seriesId === 'NASDAQ100') value = 4000; // Equities
	else if (seriesId === 'GDPC1') value = 20000; // Real GDP
	else if (seriesId === 'DTWEXBGS') value = 100; // DXY
	else if (seriesId === 'SPDYNCBRTINUSA') value = 11; // Birth Rate
	else if (seriesId === 'OPHNFB') value = 110; // Productivity
	else if (seriesId === 'TOTDTEUSQ163N') value = 350; // Total Debt
	else if (seriesId === 'UMCSENT') value = 70; // Consumer Sentiment
	else if (seriesId === 'GFDEBTN') value = 30000; // Federal Debt
	else if (seriesId === 'TDSP') value = 10; // Household Debt Service
	else value = 20000; // M2 Baseline / Default

	for (let i = 60; i >= 0; i--) {
		// 5 years monthly
		const d = new Date(now);
		d.setMonth(d.getMonth() - i);

		if (seriesId === 'IPMAN') {
			value = 100 + 5 * Math.sin((i * Math.PI) / 24); // Industrial Production cycles
		} else if (seriesId === 'GFDEGDQ188S' || seriesId === 'TOTDTEUSQ163N') {
			value = value * 1.002;
		} else if (seriesId === 'A091RC1Q027SBEA') {
			value = value * 1.01;
		} else if (seriesId === 'PPIACO') {
			value = value * (1 + (Math.random() - 0.4) * 0.08);
		} else if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') {
			value = 4.0 + 1.5 * Math.sin((i * Math.PI) / 36);
		} else if (seriesId === 'NFCI') {
			value = -0.5 + Math.random() * 0.5;
		} else if (seriesId === 'SP500' || seriesId === 'NASDAQ100') {
			value = value * (1 + (Math.random() - 0.35) * 0.05); // Upward with vol
		} else {
			// Default slight upward trend
			value = value * 1.001;
		}

		data.push({
			date: d.toISOString().split('T')[0],
			value
		});
	}

	// Apply units transformation for mock data
	if (units === 'pc1' && data.length > 12) {
		// Simulate YoY percentage change
		return data.slice(12).map((point, i) => ({
			date: point.date,
			value: ((point.value - data[i].value) / data[i].value) * 100
		}));
	} else if (units === 'pch' && data.length > 1) {
		// Simulate percent change from previous period
		return data.slice(1).map((point, i) => ({
			date: point.date,
			value: ((point.value - data[i].value) / data[i].value) * 100
		}));
	} else if (units === 'log') {
		// Natural log transformation
		return data.map((point) => ({
			date: point.date,
			value: Math.log(point.value)
		}));
	}

	return data;
}

// Singleton export
export const fredProvider = new FREDProvider();
