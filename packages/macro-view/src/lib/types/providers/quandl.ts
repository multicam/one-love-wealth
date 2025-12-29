import type { BaseDataSourceConfig } from '../data-provider';

/**
 * Quandl (Nasdaq Data Link) API configuration
 * Alternative economic time series, commodities, and financial data
 * Free tier: 50 calls/day (anonymous), 500 calls/day (with API key)
 */
export interface QuandlDataSourceConfig extends BaseDataSourceConfig {
	type: 'quandl';
	databaseCode: string; // e.g., 'FRED', 'WIKI', 'LBMA'
	datasetCode: string; // e.g., 'GDP', 'AAPL', 'GOLD'

	// Query parameters
	column?: number; // Which column to extract (default: last column)
	startDate?: string; // YYYY-MM-DD
	endDate?: string; // YYYY-MM-DD
	collapse?: QuandlCollapse; // Data frequency
	transform?: QuandlTransform; // Data transformation
	rows?: number; // Limit number of rows
}

/**
 * Quandl data frequency options
 */
export type QuandlCollapse = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

/**
 * Quandl transformation options
 */
export type QuandlTransform = 'none' | 'diff' | 'rdiff' | 'rdiff_from' | 'cumul' | 'normalize';

/**
 * Common Quandl datasets for reference
 */
export const QUANDL_DATASETS = {
	// FRED datasets (Federal Reserve Economic Data)
	FRED_GDP: { database: 'FRED', dataset: 'GDP' },
	FRED_UNRATE: { database: 'FRED', dataset: 'UNRATE' },
	FRED_CPIAUCSL: { database: 'FRED', dataset: 'CPIAUCSL' },

	// LBMA datasets (London Bullion Market Association)
	LBMA_GOLD: { database: 'LBMA', dataset: 'GOLD' },
	LBMA_SILVER: { database: 'LBMA', dataset: 'SILVER' },

	// CHRIS datasets (CME futures)
	CME_CL1: { database: 'CHRIS', dataset: 'CME_CL1' }, // Crude oil
	CME_GC1: { database: 'CHRIS', dataset: 'CME_GC1' }, // Gold futures

	// OPEC datasets
	OPEC_ORB: { database: 'OPEC', dataset: 'ORB' } // OPEC basket price
} as const;
