import { DataProvider } from './base';
import type { CoinGeckoDataSourceConfig } from '../types/providers/coingecko';
import type { DataPoint } from '../db';
import {
	CoinGeckoProvider as SharedCoinGeckoProvider,
	type CoinGeckoConfig as SharedCoinGeckoConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedCoinGeckoProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: CoinGeckoDataSourceConfig): SharedCoinGeckoConfig {
	return {
		coinId: config.coinId,
		vsCurrency: config.vsCurrency || 'usd',
		days: config.days,
		interval: config.interval === '5m' ? 'hourly' : config.interval,
		precision: typeof config.precision === 'number' ? config.precision : undefined,
		endpoint: 'market_chart',
	};
}

/**
 * Convert shared DataPoint to macro-view DataPoint
 * Both now use time: number format
 */
function toMacroViewDataPoint(point: SharedDataPoint): DataPoint {
	return {
		time: point.time,
		value: point.value ?? point.close ?? 0,
	};
}

export class CoinGeckoProvider extends DataProvider<CoinGeckoDataSourceConfig> {
	readonly name = 'CoinGecko';
	readonly cachePrefix = 'COINGECKO';

	protected buildUrl(config: CoinGeckoDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('coin_id', config.coinId);
		params.set('vs_currency', config.vsCurrency || 'usd');
		params.set('days', (config.days || 'max').toString());

		if (config.interval) {
			params.set('interval', config.interval);
		}
		if (config.precision !== undefined) {
			params.set('precision', config.precision.toString());
		}

		return `/api/proxy/coingecko?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: CoinGeckoDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's transformation logic
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: CoinGeckoDataSourceConfig): DataPoint[] {
		// Delegate to shared provider's mock data generation
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}

// Singleton export
export const coinGeckoProvider = new CoinGeckoProvider();
