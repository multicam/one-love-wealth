import type { BaseDataSourceConfig } from '../data-provider';

/**
 * Bureau of Labor Statistics (BLS) API configuration
 * Provides US labor market and price data
 * Optional API key increases rate limits from 25 to 500 queries/day
 */
export interface BLSDataSourceConfig extends BaseDataSourceConfig {
	type: 'bls';
	seriesId: string; // e.g., 'LNS14000000', 'CUUR0000SA0'
	dateRange?: {
		startYear: number; // e.g., 2020
		endYear: number; // e.g., 2023
	};
	calculations?: boolean; // Include percent changes (API v2 only)
	annualAverage?: boolean; // Include annual averages (API v2 only)
}

/**
 * Common BLS series IDs for labor market analysis
 */
export const BLS_SERIES = {
	// Unemployment Rate
	UNEMPLOYMENT_RATE: 'LNS14000000', // Seasonally adjusted
	UNEMPLOYMENT_WHITE: 'LNS14000003',
	UNEMPLOYMENT_BLACK: 'LNS14000006',
	UNEMPLOYMENT_HISPANIC: 'LNS14000009',

	// Labor Force Participation
	LABOR_FORCE_PARTICIPATION: 'LNS11300000', // Seasonally adjusted
	CIVILIAN_EMPLOYMENT: 'LNS11000000',
	EMPLOYMENT_LEVEL: 'LNS12000000',

	// Employment
	NONFARM_PAYROLLS: 'CES0000000001', // Total, seasonally adjusted
	MANUFACTURING_EMPLOYMENT: 'CES3000000001',

	// Consumer Price Index (CPI)
	CPI_ALL_ITEMS: 'CUUR0000SA0', // Not seasonally adjusted
	CPI_ALL_ITEMS_SA: 'CUSR0000SA0', // Seasonally adjusted
	CPI_CORE: 'CUSR0000SA0L2', // Ex food & energy, seasonally adjusted
	CPI_FOOD: 'CUUR0000SAF',
	CPI_HOUSING: 'CUUR0000SAH',
	CPI_MEDICAL: 'CUUR0000SAM',

	// Producer Price Index (PPI)
	PPI_FINAL_DEMAND: 'WPUFD4', // Not seasonally adjusted
	PPI_FINAL_DEMAND_SA: 'WPSFD4', // Seasonally adjusted
	PPI_SERVICES: 'WPUFD49116',
	PPI_GOODS: 'WPUFD49207'
} as const;

/**
 * BLS period codes
 */
export type BLSPeriod =
	| 'M01'
	| 'M02'
	| 'M03'
	| 'M04'
	| 'M05'
	| 'M06'
	| 'M07'
	| 'M08'
	| 'M09'
	| 'M10'
	| 'M11'
	| 'M12' // Months
	| 'Q01'
	| 'Q02'
	| 'Q03'
	| 'Q04' // Quarters
	| 'A01' // Annual average
	| 'M13'; // Also annual average
