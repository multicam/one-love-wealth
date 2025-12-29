import type { BaseDataSourceConfig } from '../data-provider';

/**
 * IMF (International Monetary Fund) API configuration
 * International monetary and economic data
 * Free tier: No rate limit (as of 2025)
 */
export interface IMFDataSourceConfig extends BaseDataSourceConfig {
	type: 'imf';
	databaseId: string; // e.g., 'IFS' (International Financial Statistics)
	indicator: string; // e.g., 'NGDP_R_SA_XDC' (Real GDP)
	frequency: 'A' | 'Q' | 'M'; // Annual, Quarterly, Monthly
	countryCode: string; // ISO 3-letter code (e.g., 'USA', 'CHN')

	// Optional parameters
	startPeriod?: string; // e.g., '2010' or '2010-Q1' or '2010-01'
	endPeriod?: string;
}

/**
 * IMF database IDs
 */
export const IMF_DATABASES = {
	IFS: 'IFS', // International Financial Statistics
	DOT: 'DOT', // Direction of Trade Statistics
	BOP: 'BOP', // Balance of Payments
	GFS: 'GFS', // Government Finance Statistics
	FSI: 'FSI', // Financial Soundness Indicators
	COMMP: 'COMMP' // Commodity Prices
} as const;

/**
 * Common IMF indicators for International Financial Statistics (IFS)
 */
export const IMF_IFS_INDICATORS = {
	// GDP indicators
	NGDP_R_SA_XDC: 'NGDP_R_SA_XDC', // Real GDP, Seasonally Adjusted
	NGDP_XDC: 'NGDP_XDC', // Nominal GDP
	NGDP_D_SA_IX: 'NGDP_D_SA_IX', // GDP Deflator, Seasonally Adjusted

	// Price indices
	PCPI_IX: 'PCPI_IX', // Consumer Price Index
	PCPI_PC_CP_A_PT: 'PCPI_PC_CP_A_PT', // CPI, Percent Change, Year-over-year

	// Employment
	LUR_PT: 'LUR_PT', // Unemployment Rate

	// Money & Banking
	FM_XDC: 'FM_XDC', // M2
	FILR_PA: 'FILR_PA', // Interest Rate (Lending)

	// Exchange rates
	ENDA_XDC_USD_RATE: 'ENDA_XDC_USD_RATE', // Exchange Rate vs USD

	// Balance of Payments
	BCA_BP6_USD: 'BCA_BP6_USD', // Current Account Balance

	// International reserves
	RAFA_USD: 'RAFA_USD' // Total Reserves
} as const;

/**
 * Common country codes (ISO 3166-1 alpha-3)
 */
export const IMF_COUNTRY_CODES = {
	// G7
	USA: 'USA',
	JAPAN: 'JPN',
	GERMANY: 'DEU',
	UK: 'GBR',
	FRANCE: 'FRA',
	ITALY: 'ITA',
	CANADA: 'CAN',

	// BRICS
	CHINA: 'CHN',
	INDIA: 'IND',
	BRAZIL: 'BRA',
	RUSSIA: 'RUS',
	SOUTH_AFRICA: 'ZAF',

	// Others
	MEXICO: 'MEX',
	SOUTH_KOREA: 'KOR',
	AUSTRALIA: 'AUS',
	SPAIN: 'ESP',
	NETHERLANDS: 'NLD',

	// Aggregates
	WORLD: 'W00', // World
	EURO_AREA: 'U2' // Euro Area (19 countries)
} as const;
