import { DataProvider } from './base';
import type { IMFDataSourceConfig } from '../types/providers/imf';
import type { DataPoint } from '../db';
import {
	IMFProvider as SharedIMFProvider,
	type IMFConfig as SharedIMFConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedIMFProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: IMFDataSourceConfig): SharedIMFConfig {
	return {
		databaseId: config.databaseId,
		indicator: config.indicator,
		frequency: config.frequency,
		countryCode: config.countryCode,
		startPeriod: config.startPeriod,
		endPeriod: config.endPeriod,
	};
}

/**
 * Convert shared DataPoint to macro-view DataPoint
 */
function toMacroViewDataPoint(point: SharedDataPoint): DataPoint {
	return {
		time: point.time,
		value: point.value ?? 0,
	};
}

/**
 * IMF (International Monetary Fund) data provider
 * International monetary and economic data
 */
export class IMFProvider extends DataProvider<IMFDataSourceConfig> {
	readonly name = 'IMF';
	readonly cachePrefix = 'IMF';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (IMF data updates infrequently)

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

	protected transformResponse(json: unknown, config: IMFDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: IMFDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}
