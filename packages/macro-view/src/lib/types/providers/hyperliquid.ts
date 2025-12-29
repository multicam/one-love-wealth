import type { BaseDataSourceConfig } from '../data-provider';

/**
 * Hyperliquid DEX API configuration
 * Provides crypto perpetual futures data
 * No API key required for market data
 */
export interface HyperliquidDataSourceConfig extends BaseDataSourceConfig {
	type: 'hyperliquid';
	coin: string; // e.g., 'BTC', 'ETH', 'SOL'
	dataType: HyperliquidDataType;
	interval?: HyperliquidInterval; // Required for 'candles', ignored for others
	dateRange?: {
		startTime?: number; // Unix timestamp in milliseconds
		endTime?: number; // Unix timestamp in milliseconds
	};
}

/**
 * Types of data available from Hyperliquid
 */
export type HyperliquidDataType =
	| 'candles' // OHLCV price data
	| 'fundingHistory' // Historical funding rates
	| 'openInterest'; // Current open interest

/**
 * Candlestick intervals
 */
export type HyperliquidInterval =
	| '1m'
	| '5m'
	| '15m'
	| '30m'
	| '1h'
	| '4h'
	| '12h'
	| '1d'
	| '1w';

/**
 * Common crypto coins on Hyperliquid
 */
export const HYPERLIQUID_COINS = {
	BTC: 'BTC',
	ETH: 'ETH',
	SOL: 'SOL',
	DOGE: 'DOGE',
	ARB: 'ARB',
	AVAX: 'AVAX',
	MATIC: 'MATIC',
	OP: 'OP'
} as const;
