import type { BaseDataSourceConfig } from '../data-provider';

/**
 * Alpha Vantage API configuration
 * Stock market data, forex, crypto, and economic indicators
 * Free tier: 25 requests/day
 */
export interface AlphaVantageDataSourceConfig extends BaseDataSourceConfig {
	type: 'alphavantage';
	function: AlphaVantageFunction;
	symbol: string; // Stock ticker (e.g., 'AAPL'), forex pair (e.g., 'EUR/USD'), or crypto (e.g., 'BTC')

	// Time series parameters
	interval?: AlphaVantageInterval;
	outputsize?: 'compact' | 'full'; // compact = 100 data points, full = 20+ years
	datatype?: 'json' | 'csv';

	// Forex parameters
	fromCurrency?: string;
	toCurrency?: string;

	// Date range (for economic indicators)
	dateRange?: {
		start?: string;
		end?: string;
	};
}

/**
 * Alpha Vantage API functions
 */
export type AlphaVantageFunction =
	// Time series (stocks)
	| 'TIME_SERIES_INTRADAY'
	| 'TIME_SERIES_DAILY'
	| 'TIME_SERIES_DAILY_ADJUSTED'
	| 'TIME_SERIES_WEEKLY'
	| 'TIME_SERIES_WEEKLY_ADJUSTED'
	| 'TIME_SERIES_MONTHLY'
	| 'TIME_SERIES_MONTHLY_ADJUSTED'
	// Forex
	| 'FX_INTRADAY'
	| 'FX_DAILY'
	| 'FX_WEEKLY'
	| 'FX_MONTHLY'
	// Crypto
	| 'DIGITAL_CURRENCY_DAILY'
	| 'DIGITAL_CURRENCY_WEEKLY'
	| 'DIGITAL_CURRENCY_MONTHLY'
	// Economic indicators
	| 'REAL_GDP'
	| 'REAL_GDP_PER_CAPITA'
	| 'TREASURY_YIELD'
	| 'FEDERAL_FUNDS_RATE'
	| 'CPI'
	| 'INFLATION'
	| 'RETAIL_SALES'
	| 'DURABLES'
	| 'UNEMPLOYMENT'
	| 'NONFARM_PAYROLL';

/**
 * Time intervals for intraday data
 */
export type AlphaVantageInterval = '1min' | '5min' | '15min' | '30min' | '60min';

/**
 * Common Alpha Vantage series for reference
 */
export const ALPHA_VANTAGE_SERIES = {
	// Major stocks
	AAPL: 'AAPL',
	MSFT: 'MSFT',
	GOOGL: 'GOOGL',
	AMZN: 'AMZN',
	TSLA: 'TSLA',

	// Indices (via ETFs)
	SPY: 'SPY', // S&P 500
	QQQ: 'QQQ', // NASDAQ
	DIA: 'DIA', // Dow Jones

	// Forex pairs
	EUR_USD: 'EUR/USD',
	GBP_USD: 'GBP/USD',
	USD_JPY: 'USD/JPY',

	// Crypto
	BTC: 'BTC',
	ETH: 'ETH'
} as const;

/**
 * Economic indicator maturity (for TREASURY_YIELD)
 */
export type TreasuryMaturity = '3month' | '2year' | '5year' | '7year' | '10year' | '30year';
