import type { BaseDataSourceConfig } from '../data-provider';

/**
 * US Treasury Fiscal Data API configuration
 * Provides US government debt and fiscal data
 * No API key required - fully open API
 */
export interface TreasuryDataSourceConfig extends BaseDataSourceConfig {
	type: 'treasury';
	dataset: TreasuryDataset;
	dateRange?: {
		start?: string; // YYYY-MM-DD
		end?: string; // YYYY-MM-DD
	};
	fields?: string[]; // Specific fields to fetch (optional)
}

/**
 * Available Treasury datasets
 */
export type TreasuryDataset =
	| 'debt_to_penny' // Daily total public debt outstanding
	| 'historical_debt' // Historical debt outstanding (back to 1789)
	| 'avg_interest_rates' // Average interest rates on Treasury securities
	| 'interest_expense'; // Monthly interest expense on debt

/**
 * Treasury API endpoint mappings
 */
export const TREASURY_ENDPOINTS: Record<TreasuryDataset, string> = {
	debt_to_penny: 'v2/accounting/od/debt_to_penny',
	historical_debt: 'v1/accounting/od/historical_debt_outstanding',
	avg_interest_rates: 'v2/accounting/od/avg_interest_rates',
	interest_expense: 'v1/accounting/od/interest_expense'
};

/**
 * Value field mappings per dataset
 */
export const TREASURY_VALUE_FIELDS: Record<TreasuryDataset, string> = {
	debt_to_penny: 'tot_pub_debt_out_amt',
	historical_debt: 'debt_outstanding_amt',
	avg_interest_rates: 'avg_interest_rate_amt',
	interest_expense: 'month_expense_amt'
};

/**
 * Date field mappings per dataset
 */
export const TREASURY_DATE_FIELDS: Record<TreasuryDataset, string> = {
	debt_to_penny: 'record_date',
	historical_debt: 'record_date',
	avg_interest_rates: 'record_date',
	interest_expense: 'record_date'
};
