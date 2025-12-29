import { json, error } from '@sveltejs/kit';
import { TREASURY_ENDPOINTS, TREASURY_DATE_FIELDS } from '$lib/types/providers/treasury';
import type { TreasuryDataset } from '$lib/types/providers/treasury';
import type { RequestHandler } from './$types';

/**
 * US Treasury Fiscal Data API proxy endpoint
 * No authentication required - fully open API
 * Base URL: https://api.fiscaldata.treasury.gov/services/api/fiscal_service/
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const dataset = url.searchParams.get('dataset') as TreasuryDataset | null;
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');
	const fields = url.searchParams.get('fields');

	// Validate required parameters
	if (!dataset) {
		return error(400, 'dataset parameter is required');
	}

	// Validate dataset
	if (!TREASURY_ENDPOINTS[dataset]) {
		return error(400, `Invalid dataset. Must be one of: ${Object.keys(TREASURY_ENDPOINTS).join(', ')}`);
	}

	try {
		// Get the endpoint path for this dataset
		const endpoint = TREASURY_ENDPOINTS[dataset];
		const dateField = TREASURY_DATE_FIELDS[dataset];

		// Build Treasury API URL
		const apiUrl = new URL(
			`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/${endpoint}`
		);

		// Add query parameters
		apiUrl.searchParams.set('format', 'json');
		apiUrl.searchParams.set('page[size]', '1000'); // Fetch up to 1000 records
		apiUrl.searchParams.set('sort', dateField); // Sort by date ascending

		// Add date range filters if specified
		if (start || end) {
			const filters: string[] = [];

			if (start) {
				filters.push(`${dateField}:gte:${start}`);
			}

			if (end) {
				filters.push(`${dateField}:lte:${end}`);
			}

			if (filters.length > 0) {
				apiUrl.searchParams.set('filter', filters.join(','));
			}
		}

		// Add specific fields if requested
		if (fields) {
			// Always include the date field
			apiUrl.searchParams.set('fields', `${dateField},${fields}`);
		}

		console.log(
			`[Treasury] Fetching ${dataset}${start || end ? ` (${start || 'earliest'} to ${end || 'latest'})` : ''}`
		);

		// Fetch from Treasury API
		const response = await fetch(apiUrl.toString());

		if (!response.ok) {
			console.error(`[Treasury] HTTP ${response.status}: ${response.statusText}`);
			return error(response.status, `Treasury API error: ${response.statusText}`);
		}

		const data = await response.json();

		// Validate response structure
		if (!data.data || !Array.isArray(data.data)) {
			console.error('[Treasury] Invalid response format');
			return error(500, 'Invalid Treasury API response format');
		}

		console.log(`[Treasury] Successfully fetched ${data.data.length} data points`);

		// Check if we need pagination (more than 1000 records)
		if (data.meta && data.meta['total-count'] > 1000) {
			console.warn(
				`[Treasury] Dataset has ${data.meta['total-count']} records, but only returning first 1000. Consider narrowing date range.`
			);
		}

		return json(data);
	} catch (err: any) {
		console.error('[Treasury] Error fetching data:', err.message);

		if (err.message?.includes('fetch failed') || err.message?.includes('ENOTFOUND')) {
			return error(503, 'Treasury API is unreachable');
		}

		return error(500, `Failed to fetch Treasury data: ${err.message}`);
	}
};
