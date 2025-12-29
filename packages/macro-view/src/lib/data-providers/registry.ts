import type { DataSourceConfig, DataProviderType } from '../types/data-provider';
import type { DataProvider, FetchResult } from './base';
import { fredProvider } from './fred';
import { coinGeckoProvider } from './coingecko';
import { yahooProvider } from './yahoo';
import { worldBankProvider } from './worldbank';
import { blsProvider } from './bls';
import { treasuryProvider } from './treasury';
import { hyperliquidProvider } from './hyperliquid';
import { AlphaVantageProvider } from './alphavantage';
import { QuandlProvider } from './quandl';
import { IMFProvider } from './imf';
import { OECDProvider } from './oecd';

/**
 * Registry of all available data providers
 */
class DataProviderRegistry {
	private providers: Map<DataProviderType, DataProvider<any>> = new Map();

	constructor() {
		this.register('fred', fredProvider);
		this.register('coingecko', coinGeckoProvider);
		this.register('yahoo', yahooProvider);
		this.register('worldbank', worldBankProvider);
		this.register('bls', blsProvider);
		this.register('treasury', treasuryProvider);
		this.register('hyperliquid', hyperliquidProvider);
		this.register('alphavantage', new AlphaVantageProvider());
		this.register('quandl', new QuandlProvider());
		this.register('imf', new IMFProvider());
		this.register('oecd', new OECDProvider());
	}

	/**
	 * Register a new provider
	 */
	register(type: DataProviderType, provider: DataProvider<any>): void {
		this.providers.set(type, provider);
	}

	/**
	 * Get provider for a type
	 */
	getProvider(type: DataProviderType): DataProvider<any> | undefined {
		return this.providers.get(type);
	}

	/**
	 * Fetch data using the appropriate provider based on config type
	 */
	async fetch(config: DataSourceConfig): Promise<FetchResult> {
		const provider = this.providers.get(config.type);
		if (!provider) {
			throw new Error(`Unknown data provider type: ${config.type}`);
		}
		return provider.fetch(config);
	}

	/**
	 * Fetch multiple data sources in parallel
	 */
	async fetchAll(configs: DataSourceConfig[]): Promise<FetchResult[]> {
		return Promise.all(configs.map((config) => this.fetch(config)));
	}

	/**
	 * Get all registered provider types
	 */
	getAvailableProviders(): DataProviderType[] {
		return Array.from(this.providers.keys());
	}
}

export const dataProviderRegistry = new DataProviderRegistry();
