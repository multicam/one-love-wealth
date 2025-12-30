import { DataProvider } from './base';
import type { OECDDataSourceConfig } from '../types/providers/oecd';
import type { DataPoint } from '../db';
import {
	OECDProvider as SharedOECDProvider,
	type OECDConfig as SharedOECDConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedOECDProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: OECDDataSourceConfig): SharedOECDConfig {
	return {
		dataset: config.dataset,
		indicator: config.indicator,
		location: config.location,
		frequency: config.frequency,
		startTime: config.startTime,
		endTime: config.endTime,
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
 * OECD (Organisation for Economic Co-operation and Development) data provider
 * Development statistics and economic indicators
 */
export class OECDProvider extends DataProvider<OECDDataSourceConfig> {
	readonly name = 'OECD';
	readonly cachePrefix = 'OECD';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (OECD data updates infrequently)

	protected buildUrl(config: OECDDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('dataset', config.dataset);
		params.set('indicator', config.indicator);
		params.set('location', config.location);

		if (config.frequency) {
			params.set('frequency', config.frequency);
		}

		if (config.startTime) {
			params.set('start', config.startTime);
		}

		if (config.endTime) {
			params.set('end', config.endTime);
		}

		return `/api/proxy/oecd?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: OECDDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: OECDDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}
