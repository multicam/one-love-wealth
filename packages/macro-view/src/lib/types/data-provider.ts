/**
 * Base configuration shared by all data sources
 */
export interface BaseDataSourceConfig {
	/** Unique identifier for caching */
	id: string;
	/** Human-readable name for UI */
	name: string;
	/** Provider type discriminator */
	type: DataProviderType;
	/** Cache strategy */
	cache?: CacheStrategy;
	/** UI configuration */
	display?: DisplayConfig;
}

/**
 * Provider type enum for type guards
 */
export type DataProviderType =
	| 'fred'
	| 'coingecko'
	| 'yahoo'
	| 'worldbank'
	| 'bls'
	| 'treasury'
	| 'hyperliquid'
	| 'alphavantage'
	| 'quandl'
	| 'imf'
	| 'oecd';

/**
 * Cache configuration per data source
 */
export interface CacheStrategy {
	/** Time to live in milliseconds */
	ttl?: number;
	/** Semantic frequency hint */
	frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
	/** Force refresh on next request */
	forceRefresh?: boolean;
	/** Return stale data while fetching fresh */
	staleWhileRevalidate?: boolean;
}

/**
 * Display configuration for UI
 */
export interface DisplayConfig {
	/** Color for chart series */
	color?: string;
	/** Label override for legend */
	label?: string;
	/** Y-axis assignment */
	yAxisId?: 'left' | 'right' | string;
}

/**
 * Discriminated union for type-safe provider configurations.
 * Each provider type has its own parameter structure enforced at compile time.
 */
export type DataSourceConfig =
	| import('./providers/fred').FREDDataSourceConfig
	| import('./providers/coingecko').CoinGeckoDataSourceConfig
	| import('./providers/yahoo').YahooDataSourceConfig
	| import('./providers/worldbank').WorldBankDataSourceConfig
	| import('./providers/bls').BLSDataSourceConfig
	| import('./providers/treasury').TreasuryDataSourceConfig
	| import('./providers/hyperliquid').HyperliquidDataSourceConfig
	| import('./providers/alphavantage').AlphaVantageDataSourceConfig
	| import('./providers/quandl').QuandlDataSourceConfig
	| import('./providers/imf').IMFDataSourceConfig
	| import('./providers/oecd').OECDDataSourceConfig;
