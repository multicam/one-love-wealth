import type { BaseDataSourceConfig } from '../data-provider';

export interface FREDDataSourceConfig extends BaseDataSourceConfig {
	type: 'fred';
	/** FRED series identifier (e.g., 'M2SL', 'IPMAN') */
	seriesId: string;
	/** Date range configuration */
	dateRange?: {
		/** Start date (YYYY-MM-DD) */
		start?: string;
		/** End date (YYYY-MM-DD) */
		end?: string;
		/** Alternative: most recent N observations */
		limit?: number;
	};
	/**
	 * Server-side data transformation
	 * FRED computes these for you - no client-side calculation needed!
	 */
	units?: FREDUnits;
	/**
	 * Frequency aggregation - downsample data to lower frequency
	 * e.g., Convert daily to monthly
	 */
	frequency?: FREDFrequency;
	/** How to aggregate when changing frequency */
	aggregationMethod?: 'avg' | 'sum' | 'eop';
	/**
	 * Real-time period for historical data versions
	 * Useful for backtesting with "as known at the time" data
	 */
	realtime?: {
		start?: string;
		end?: string;
	};
	/** Vintage dates for specific historical snapshots */
	vintageDates?: string[];
}

/**
 * FRED Units transformations - server-side calculations!
 */
export type FREDUnits =
	| 'lin' // Levels (no transformation)
	| 'chg' // Change
	| 'ch1' // Change from Year Ago
	| 'pch' // Percent Change
	| 'pc1' // Percent Change from Year Ago (YoY!) ⭐
	| 'pca' // Compounded Annual Rate of Change
	| 'cch' // Continuously Compounded Rate of Change
	| 'cca' // Continuously Compounded Annual Rate of Change
	| 'log'; // Natural Log

/**
 * FRED Frequency values for aggregation
 */
export type FREDFrequency =
	| 'd' // Daily
	| 'w' // Weekly (Friday)
	| 'bw' // Biweekly (Wednesday)
	| 'm' // Monthly
	| 'q' // Quarterly
	| 'sa' // Semiannual
	| 'a' // Annual
	| 'wef' // Weekly, Ending Friday
	| 'weth' // Weekly, Ending Thursday
	| 'wew' // Weekly, Ending Wednesday
	| 'wetu' // Weekly, Ending Tuesday
	| 'wem' // Weekly, Ending Monday
	| 'wesu' // Weekly, Ending Sunday
	| 'wesa' // Weekly, Ending Saturday
	| 'bwew' // Biweekly, Ending Wednesday
	| 'bwem'; // Biweekly, Ending Monday
