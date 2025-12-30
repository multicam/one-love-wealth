import { DataProvider } from './base';
import type { AlphaVantageDataSourceConfig } from '../types/providers/alphavantage';
import type { DataPoint } from '../db';
import {
	AlphaVantageProvider as SharedAlphaVantageProvider,
	type AlphaVantageConfig as SharedAlphaVantageConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedAlphaVantageProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: AlphaVantageDataSourceConfig): SharedAlphaVantageConfig {
	return {
		function: config.function,
		symbol: config.symbol,
		interval: config.interval,
		outputsize: config.outputsize,
		datatype: config.datatype,
		fromCurrency: config.fromCurrency,
		toCurrency: config.toCurrency,
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
 * Alpha Vantage data provider
 * Stock market data, forex, crypto, and economic indicators
 */
export class AlphaVantageProvider extends DataProvider<AlphaVantageDataSourceConfig> {
	readonly name = 'Alpha Vantage';
	readonly cachePrefix = 'ALPHAVANTAGE';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours (due to 25 req/day limit)

	protected buildUrl(config: AlphaVantageDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('function', config.function);
		params.set('symbol', config.symbol);

		if (config.interval) {
			params.set('interval', config.interval);
		}

		if (config.outputsize) {
			params.set('outputsize', config.outputsize);
		}

		if (config.datatype) {
			params.set('datatype', config.datatype);
		}

		if (config.fromCurrency) {
			params.set('from_currency', config.fromCurrency);
		}

		if (config.toCurrency) {
			params.set('to_currency', config.toCurrency);
		}

		if (config.dateRange?.start) {
			params.set('start', config.dateRange.start);
		}

		if (config.dateRange?.end) {
			params.set('end', config.dateRange.end);
		}

		return `/api/proxy/alphavantage?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: AlphaVantageDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: AlphaVantageDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}
