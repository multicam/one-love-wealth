import { DataProvider } from './base';
import type { IMFDataSourceConfig } from '../types/providers/imf';
import type { DataPoint } from '../db';

/**
 * IMF DataMapper API response format
 * Example: { values: { NGDP_RPCH: { USA: { "2020": -2.1, "2021": 6.2 } } } }
 */
interface IMFDataMapperResponse {
	values?: Record<string, Record<string, Record<string, number>>>;
	api?: { version: string };
}

/**
 * IMF (International Monetary Fund) data provider
 * Uses the DataMapper API: https://www.imf.org/external/datamapper/api/help
 * 
 * Common indicators:
 * - NGDP_RPCH: Real GDP growth (annual percent change)
 * - PCPIPCH: Inflation rate (consumer prices)
 * - LUR: Unemployment rate
 * - BCA_NGDPD: Current account balance (% of GDP)
 * - GGXWDG_NGDP: Government gross debt (% of GDP)
 */
export class IMFProvider extends DataProvider<IMFDataSourceConfig> {
	readonly name = 'IMF';
	readonly cachePrefix = 'IMF';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (IMF data updates infrequently)

	protected buildUrl(config: IMFDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('indicator', config.indicator);
		
		if (config.countryCode) {
			params.set('country', config.countryCode);
		}

		// Build periods parameter if date range specified
		if (config.startPeriod || config.endPeriod) {
			const startYear = config.startPeriod ? parseInt(config.startPeriod.substring(0, 4)) : 2000;
			const endYear = config.endPeriod ? parseInt(config.endPeriod.substring(0, 4)) : new Date().getFullYear();
			const years = [];
			for (let y = startYear; y <= endYear; y++) {
				years.push(y.toString());
			}
			params.set('periods', years.join(','));
		}

		return `/api/proxy/imf?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: IMFDataSourceConfig): DataPoint[] {
		const response = json as IMFDataMapperResponse;

		if (!response.values) {
			throw new Error('Invalid IMF response: no values');
		}

		const indicatorData = response.values[config.indicator];
		if (!indicatorData) {
			throw new Error(`No data for indicator: ${config.indicator}`);
		}

		const countryData = config.countryCode ? indicatorData[config.countryCode] : null;
		if (!countryData && config.countryCode) {
			throw new Error(`No data for country: ${config.countryCode}`);
		}

		const points: DataPoint[] = [];

		// If country specified, use that data; otherwise aggregate first country found
		const dataToProcess = countryData || Object.values(indicatorData)[0];
		
		if (dataToProcess) {
			for (const [year, value] of Object.entries(dataToProcess)) {
				if (typeof value === 'number' && !isNaN(value)) {
					const time = new Date(parseInt(year), 0, 1).getTime();
					points.push({ time, value });
				}
			}
		}

		return points.sort((a, b) => a.time - b.time);
	}

	protected generateMockData(_config: IMFDataSourceConfig): DataPoint[] {
		const points: DataPoint[] = [];
		const currentYear = new Date().getFullYear();
		
		for (let year = currentYear - 10; year <= currentYear; year++) {
			points.push({
				time: new Date(year, 0, 1).getTime(),
				value: 2 + Math.random() * 3, // Mock GDP growth 2-5%
			});
		}
		
		return points;
	}
}
