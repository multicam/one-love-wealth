import type { BaseDataSourceConfig } from '../data-provider';

/**
 * {{DISPLAY_NAME}} API configuration
 * [Add description of what this provider offers]
 */
export interface {{NAME_PASCAL}}DataSourceConfig extends BaseDataSourceConfig {
	type: '{{NAME}}';

	// TODO: Add provider-specific configuration fields
	symbol: string; // Example: series ID, ticker, indicator code, etc.

	// Optional parameters (customize based on API)
	dateRange?: {
		start?: string;
		end?: string;
	};

	// Additional API-specific options
	// interval?: string;
	// country?: string;
	// dataType?: string;
}

/**
 * Common {{DISPLAY_NAME}} series/symbols for reference
 * TODO: Add commonly used identifiers for this provider
 */
export const {{NAME_UPPER}}_SERIES = {
	EXAMPLE: '{{EXAMPLE_SYMBOL}}',
	// Add more common series here
} as const;
