import type { BaseDataSourceConfig } from '../data-provider';

/**
 * IMF DataMapper API configuration
 * API Documentation: https://www.imf.org/external/datamapper/api/help
 * Free tier: No rate limit (as of 2025)
 */
export interface IMFDataSourceConfig extends BaseDataSourceConfig {
	type: 'imf';
	indicator: string; // e.g., 'NGDP_RPCH' (Real GDP growth)
	countryCode?: string; // ISO 3-letter code (e.g., 'USA', 'CHN')

	// Optional parameters
	startPeriod?: string; // e.g., '2010'
	endPeriod?: string;

	// Legacy fields (kept for backward compatibility, not used by DataMapper API)
	databaseId?: string;
	frequency?: 'A' | 'Q' | 'M';
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
 * Common IMF DataMapper indicators
 * Full list: https://www.imf.org/external/datamapper/api/v1/indicators
 */
export const IMF_INDICATORS = {
	// GDP & Growth
	NGDP_RPCH: 'NGDP_RPCH', // Real GDP growth (annual percent change)
	NGDPD: 'NGDPD', // GDP, current prices (USD billions)
	PPPGDP: 'PPPGDP', // GDP based on PPP (international dollars)
	NGDPDPC: 'NGDPDPC', // GDP per capita, current prices (USD)

	// Inflation & Prices
	PCPIPCH: 'PCPIPCH', // Inflation rate (consumer prices, annual %)
	PCPIEPCH: 'PCPIEPCH', // Inflation rate, end of period (annual %)

	// Employment
	LUR: 'LUR', // Unemployment rate (% of labor force)

	// Government Finance
	GGXWDG_NGDP: 'GGXWDG_NGDP', // General government gross debt (% of GDP)
	GGXCNL_NGDP: 'GGXCNL_NGDP', // General government net lending/borrowing (% of GDP)
	GGR_NGDP: 'GGR_NGDP', // General government revenue (% of GDP)
	GGX_NGDP: 'GGX_NGDP', // General government total expenditure (% of GDP)

	// External Sector
	BCA_NGDPD: 'BCA_NGDPD', // Current account balance (% of GDP)
	TM_RPCH: 'TM_RPCH', // Volume of imports (goods & services, annual % change)
	TX_RPCH: 'TX_RPCH', // Volume of exports (goods & services, annual % change)

	// Population
	LP: 'LP' // Population (millions)
} as const;

// Legacy alias for backward compatibility
export const IMF_IFS_INDICATORS = IMF_INDICATORS;

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
