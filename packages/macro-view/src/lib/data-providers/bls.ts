import { DataProvider } from './base';
import type { BLSDataSourceConfig } from '../types/providers/bls';
import type { DataPoint } from '../db';
import {
	BLSProvider as SharedBLSProvider,
	type BLSConfig as SharedBLSConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedBLSProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: BLSDataSourceConfig): SharedBLSConfig {
	return {
		seriesId: config.seriesId,
		dateRange: config.dateRange,
		calculations: config.calculations,
		annualAverage: config.annualAverage,
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
 * Bureau of Labor Statistics (BLS) API provider
 * Provides US labor market and price data
 * Optional API key via BLS_API_KEY environment variable
 */
export class BLSProvider extends DataProvider<BLSDataSourceConfig> {
	readonly name = 'BLS';
	readonly cachePrefix = 'BLS';
	protected defaultTTL = 30 * 24 * 60 * 60 * 1000; // 30 days (monthly data)

	protected buildUrl(config: BLSDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('seriesId', config.seriesId);

		if (config.dateRange) {
			params.set('startYear', config.dateRange.startYear.toString());
			params.set('endYear', config.dateRange.endYear.toString());
		} else {
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

	protected transformResponse(json: unknown, config: BLSDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's transformation logic
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: BLSDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's mock data generation
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const blsProvider = new BLSProvider();
