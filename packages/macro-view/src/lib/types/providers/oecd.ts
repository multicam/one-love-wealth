import type { BaseDataSourceConfig } from '../data-provider';

/**
 * OECD (Organisation for Economic Co-operation and Development) API configuration
 * Development statistics and economic indicators for developed nations
 * Free tier: No authentication required
 */
export interface OECDDataSourceConfig extends BaseDataSourceConfig {
	type: 'oecd';
	dataset: string; // e.g., 'QNA' (Quarterly National Accounts)
	indicator: string; // e.g., 'GDP', 'B1_GE'
	location: string; // e.g., 'USA', 'OECD' (aggregate)

	// Optional parameters
	frequency?: 'A' | 'Q' | 'M'; // Annual, Quarterly, Monthly
	startTime?: string; // e.g., '2010'
	endTime?: string;
}

/**
 * Common OECD datasets
 */
export const OECD_DATASETS = {
	// National Accounts
	QNA: 'QNA', // Quarterly National Accounts
	SNA_TABLE1: 'SNA_TABLE1', // Annual National Accounts

	// Prices & Inflation
	MEI: 'MEI', // Main Economic Indicators (includes CPI, PPI, etc.)
	PRICES_CPI: 'PRICES_CPI', // Consumer Price Index

	// Labor Market
	MIG: 'MIG', // International Migration Database
	LFS_SEXAGE_I_R: 'LFS_SEXAGE_I_R', // Labor Force Statistics

	// Trade
	BTDIXE_I4: 'BTDIXE_I4', // Balanced International Trade in Services
	MEI_TRADE: 'MEI_TRADE', // Trade indicators

	// Energy
	IEA_MONTHLY_OIL_STATISTICS: 'IEA_MONTHLY_OIL_STATISTICS', // Oil statistics

	// Finance
	FI_INDICATORS: 'FI_INDICATORS', // Financial indicators
	KEI: 'KEI' // Key Economic Indicators
} as const;

/**
 * Common OECD indicators for Quarterly National Accounts (QNA)
 */
export const OECD_QNA_INDICATORS = {
	// GDP indicators
	GDP: 'GDP', // Gross Domestic Product
	B1_GE: 'B1_GE', // GDP expenditure approach

	// Components of GDP
	P3: 'P3', // Government consumption
	P31S14_S15: 'P31S14_S15', // Household consumption
	P5: 'P5', // Gross fixed capital formation
	P6: 'P6', // Exports
	P7: 'P7' // Imports
} as const;

/**
 * Common OECD Main Economic Indicators (MEI)
 */
export const OECD_MEI_INDICATORS = {
	// Prices
	CPI: 'CPALTT01', // Consumer Price Index
	PPI: 'PPPGTT01', // Producer Price Index

	// Employment
	UNEMP: 'LRHUTTTT', // Harmonized Unemployment Rate
	EMP: 'LREMTTTT', // Employment

	// Trade
	XTEXVA01: 'XTEXVA01', // Exports value
	XTIMVA01: 'XTIMVA01', // Imports value

	// Production
	PRMNTO01: 'PRMNTO01', // Industrial production
	PRINTO01: 'PRINTO01' // Manufacturing production
} as const;

/**
 * Common OECD country/region codes
 */
export const OECD_LOCATIONS = {
	// G7
	USA: 'USA',
	JPN: 'JPN',
	DEU: 'DEU', // Germany
	GBR: 'GBR',
	FRA: 'FRA',
	ITA: 'ITA',
	CAN: 'CAN',

	// Other major economies
	CHN: 'CHN',
	IND: 'IND',
	BRA: 'BRA',
	RUS: 'RUS',
	MEX: 'MEX',
	KOR: 'KOR',
	AUS: 'AUS',
	ESP: 'ESP',
	NLD: 'NLD',

	// Aggregates
	OECD: 'OECD', // OECD total
	OECDE: 'OECDE', // OECD Europe
	EU27_2020: 'EU27_2020', // European Union (27 countries)
	EA19: 'EA19', // Euro area (19 countries)
	G7: 'G7', // G7 countries
	G20: 'G20' // G20 countries
} as const;
