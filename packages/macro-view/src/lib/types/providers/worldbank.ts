import type { BaseDataSourceConfig } from '../data-provider';

/**
 * World Bank Open Data API configuration
 * Provides access to 16,000+ global macroeconomic indicators
 */
export interface WorldBankDataSourceConfig extends BaseDataSourceConfig {
	type: 'worldbank';
	indicatorCode: string; // e.g., 'NY.GDP.MKTP.CD'
	countryCode?: string; // e.g., 'USA', 'CHN', 'all' (default: 'USA')
	dateRange?: {
		start?: number; // Year (e.g., 2000)
		end?: number; // Year (e.g., 2023)
	};
	mrv?: number; // Most recent values (alternative to dateRange)
}

/**
 * Common World Bank indicator codes for macroeconomic analysis
 */
export const WORLD_BANK_INDICATORS = {
	// GDP Indicators
	GDP_CURRENT: 'NY.GDP.MKTP.CD', // GDP (current US$)
	GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG', // GDP growth (annual %)
	GDP_PER_CAPITA: 'NY.GDP.PCAP.CD', // GDP per capita (current US$)

	// Population
	POPULATION: 'SP.POP.TOTL', // Population, total
	POPULATION_GROWTH: 'SP.POP.GROW', // Population growth (annual %)
	BIRTH_RATE: 'SP.DYN.CBRT.IN', // Birth rate, crude (per 1,000 people)

	// Debt Indicators
	DEBT_GDP: 'GC.DOD.TOTL.GD.ZS', // Central government debt (% of GDP)
	EXTERNAL_DEBT_GNI: 'DT.DOD.DECT.GN.ZS', // External debt stocks (% of GNI)

	// Money & Finance
	BROAD_MONEY_GDP: 'FM.LBL.BMNY.GD.ZS', // Broad money (% of GDP)
	RESERVES: 'FI.RES.TOTL.CD', // Total reserves (current US$)

	// Trade
	EXPORTS_GDP: 'NE.EXP.GNFS.ZS', // Exports of goods/services (% GDP)
	IMPORTS_GDP: 'NE.IMP.GNFS.ZS', // Imports of goods/services (% GDP)
	CURRENT_ACCOUNT_GDP: 'BN.CAB.XOKA.GD.ZS', // Current account balance (% GDP)

	// Inflation
	INFLATION_CONSUMER: 'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
	INFLATION_GDP: 'NY.GDP.DEFL.KD.ZG' // Inflation, GDP deflator (annual %)
} as const;

/**
 * Common country codes (ISO 3166-1 alpha-3)
 */
export const WORLD_BANK_COUNTRIES = {
	// Major Economies (G7)
	USA: 'USA',
	CHINA: 'CHN',
	JAPAN: 'JPN',
	GERMANY: 'DEU',
	UK: 'GBR',
	FRANCE: 'FRA',
	ITALY: 'ITA',
	CANADA: 'CAN',

	// Other Major Economies
	INDIA: 'IND',
	BRAZIL: 'BRA',
	RUSSIA: 'RUS',
	SOUTH_KOREA: 'KOR',
	AUSTRALIA: 'AUS',
	MEXICO: 'MEX',

	// Aggregates
	ALL: 'all', // All countries
	WORLD: 'WLD', // World aggregate
	EURO_AREA: 'EMU' // Euro area
} as const;
