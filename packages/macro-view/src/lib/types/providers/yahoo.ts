import type { BaseDataSourceConfig } from '../data-provider';

/**
 * Yahoo Finance data source configuration
 * Uses yahoo-finance2 library for stock market data
 */
export interface YahooDataSourceConfig extends BaseDataSourceConfig {
	type: 'yahoo';
	symbol: string; // e.g., '^GSPC', '^NDX', 'AAPL'
	dateRange?: {
		start?: string; // YYYY-MM-DD
		end?: string; // YYYY-MM-DD
	};
	interval?: YahooInterval;
	includeAdjustedClose?: boolean; // Default: true
}

/**
 * Supported intervals for Yahoo Finance data
 */
export type YahooInterval = '1d' | '1wk' | '1mo';

/**
 * Common stock market symbols
 */
export const YAHOO_SYMBOLS = {
	// Indices
	SP500: '^GSPC',
	NASDAQ100: '^NDX',
	DOW_JONES: '^DJI',
	VIX: '^VIX',

	// Treasury Yields
	TREASURY_10Y: '^TNX',
	TREASURY_5Y: '^FVX',

	// Commodities ETFs
	GOLD: 'GLD',
	OIL: 'USO',
	SILVER: 'SLV'
} as const;
