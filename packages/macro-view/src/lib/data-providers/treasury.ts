import { DataProvider } from './base';
import type { TreasuryDataSourceConfig } from '../types/providers/treasury';
import type { DataPoint } from '../db';
import {
	TreasuryProvider as SharedTreasuryProvider,
	type TreasuryConfig as SharedTreasuryConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedTreasuryProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: TreasuryDataSourceConfig): SharedTreasuryConfig {
	return {
		dataset: config.dataset,
		dateRange: config.dateRange,
		fields: config.fields,
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

/**
 * US Treasury Fiscal Data API provider
 * Provides government debt and fiscal data
 * No API key required - fully open API
 */
export class TreasuryProvider extends DataProvider<TreasuryDataSourceConfig> {
	readonly name = 'Treasury';
	readonly cachePrefix = 'TREASURY';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours (daily updates for most datasets)

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

	protected transformResponse(json: unknown, config: TreasuryDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's transformation logic
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: TreasuryDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's mock data generation
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const treasuryProvider = new TreasuryProvider();
