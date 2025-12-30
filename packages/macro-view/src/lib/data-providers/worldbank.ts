import { DataProvider } from './base';
import type { WorldBankDataSourceConfig } from '../types/providers/worldbank';
import type { DataPoint } from '../db';
import {
	WorldBankProvider as SharedWorldBankProvider,
	type WorldBankConfig as SharedWorldBankConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedWorldBankProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: WorldBankDataSourceConfig): SharedWorldBankConfig {
	return {
		indicatorCode: config.indicatorCode,
		countryCode: config.countryCode,
		dateRange: config.dateRange,
		mrv: config.mrv,
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
 * World Bank Open Data API provider
 * Provides access to 16,000+ global macroeconomic indicators
 * No API key required - fully open API
 */
export class WorldBankProvider extends DataProvider<WorldBankDataSourceConfig> {
	readonly name = 'WorldBank';
	readonly cachePrefix = 'WORLDBANK';
	protected defaultTTL = 90 * 24 * 60 * 60 * 1000; // 90 days (data updates quarterly/annually)

	protected buildUrl(config: WorldBankDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('indicator', config.indicatorCode);
		params.set('country', config.countryCode || 'USA');

		if (config.dateRange) {
			params.set('date', `${config.dateRange.start}:${config.dateRange.end}`);
		}

		if (config.mrv) {
			params.set('mrv', config.mrv.toString());
		}

		return `/api/proxy/worldbank?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: WorldBankDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: WorldBankDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const worldBankProvider = new WorldBankProvider();
