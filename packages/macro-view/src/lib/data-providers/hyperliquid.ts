import { DataProvider } from './base';
import type { HyperliquidDataSourceConfig } from '../types/providers/hyperliquid';
import type { DataPoint } from '../db';
import {
	HyperliquidProvider as SharedHyperliquidProvider,
	type HyperliquidConfig as SharedHyperliquidConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedHyperliquidProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: HyperliquidDataSourceConfig): SharedHyperliquidConfig {
	return {
		coin: config.coin,
		dataType: config.dataType,
		interval: config.interval,
		dateRange: config.dateRange,
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
 * Hyperliquid DEX API provider
 * Provides crypto perpetual futures data
 * No API key required for market data
 */
export class HyperliquidProvider extends DataProvider<HyperliquidDataSourceConfig> {
	readonly name = 'Hyperliquid';
	readonly cachePrefix = 'HYPERLIQUID';
	protected defaultTTL = 5 * 60 * 1000; // 5 minutes for crypto data

	protected buildUrl(config: HyperliquidDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('coin', config.coin);
		params.set('dataType', config.dataType);

		if (config.dataType === 'candles' && config.interval) {
			params.set('interval', config.interval);
		}

		if (config.dateRange?.startTime) {
			params.set('startTime', config.dateRange.startTime.toString());
		}

		if (config.dateRange?.endTime) {
			params.set('endTime', config.dateRange.endTime.toString());
		}

		return `/api/proxy/hyperliquid?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: HyperliquidDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: HyperliquidDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const hyperliquidProvider = new HyperliquidProvider();
