import { DataProvider } from './base';
import type { YahooDataSourceConfig } from '../types/providers/yahoo';
import type { DataPoint } from '../db';
import {
	YahooProvider as SharedYahooProvider,
	type YahooConfig as SharedYahooConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedYahooProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: YahooDataSourceConfig): SharedYahooConfig {
	return {
		symbol: config.symbol,
		period: '1y',
		interval: config.interval as SharedYahooConfig['interval'],
	};
}

/**
 * Convert shared DataPoint to macro-view DataPoint
 */
function toMacroViewDataPoint(point: SharedDataPoint): DataPoint {
	return {
		time: point.time,
		value: point.value ?? point.close ?? 0,
	};
}

/**
 * Yahoo Finance data provider
 * Uses yahoo-finance2 library via server-side proxy for stock market data
 */
export class YahooProvider extends DataProvider<YahooDataSourceConfig> {
	readonly name = 'Yahoo';
	readonly cachePrefix = 'YAHOO';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours for stock data

	protected buildUrl(config: YahooDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('symbol', config.symbol);

		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		if (config.interval) {
			params.set('interval', config.interval);
		}

		if (config.includeAdjustedClose !== undefined) {
			params.set('includeAdjustedClose', config.includeAdjustedClose.toString());
		}

		return `/api/proxy/yahoo?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: YahooDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: YahooDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const yahooProvider = new YahooProvider();
