import type { BaseDataSourceConfig } from '../data-provider';

export interface CoinGeckoDataSourceConfig extends BaseDataSourceConfig {
	type: 'coingecko';
	/** Coin identifier (e.g., 'bitcoin', 'ethereum') */
	coinId: string;
	/** Target currency for price conversion */
	vsCurrency?: CoinGeckoCurrency;
	/** Number of days of historical data */
	days?: number | 'max';
	/**
	 * Data interval
	 * Note: 5m and hourly require paid plans
	 */
	interval?: 'daily' | 'hourly' | '5m';
	/** Decimal precision for prices */
	precision?: 'full' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

/**
 * Supported vs_currencies (subset - 50+ available)
 */
export type CoinGeckoCurrency =
	// Crypto
	| 'btc'
	| 'eth'
	| 'ltc'
	| 'bch'
	| 'bnb'
	| 'eos'
	| 'xrp'
	| 'xlm'
	// Fiat - Major
	| 'usd'
	| 'eur'
	| 'gbp'
	| 'jpy'
	| 'cny'
	| 'cad'
	| 'aud'
	| 'chf'
	// Fiat - Other
	| 'krw'
	| 'inr'
	| 'brl'
	| 'mxn'
	| 'rub'
	| 'try'
	| 'hkd'
	| 'sgd'
	// Commodities
	| 'xau' // Gold
	| 'xag'; // Silver
