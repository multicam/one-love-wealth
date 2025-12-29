import { DataProvider } from './base';
import type { FREDDataSourceConfig } from '../types/providers/fred';
import type { DataPoint } from '../db';
import {
	FREDProvider as SharedFREDProvider,
	type FREDConfig as SharedFREDConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedFREDProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: FREDDataSourceConfig): SharedFREDConfig {
	return {
		seriesId: config.seriesId,
		units: config.units,
		frequency: config.frequency,
		aggregationMethod: config.aggregationMethod,
		startDate: config.dateRange?.start,
		endDate: config.dateRange?.end,
		limit: config.dateRange?.limit,
	};
}

/**
 * Convert shared DataPoint to macro-view DataPoint
 * Both now use time: number format
 */
function toMacroViewDataPoint(point: SharedDataPoint): DataPoint {
	return {
		time: point.time,
		value: point.value ?? 0,
	};
}

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

	protected transformResponse(json: unknown, config: FREDDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's transformation logic
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: FREDDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's mock data generation
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const fredProvider = new FREDProvider();
