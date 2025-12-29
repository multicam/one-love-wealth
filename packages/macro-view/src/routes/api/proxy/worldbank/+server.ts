import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * World Bank Open Data API proxy endpoint
 * No authentication required - fully open API
 * Base URL: https://api.worldbank.org/v2/
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const indicator = url.searchParams.get('indicator');
	const country = url.searchParams.get('country') || 'USA';
	const date = url.searchParams.get('date');
	const mrv = url.searchParams.get('mrv');

	// Validate required parameters
	if (!indicator) {
		return error(400, 'indicator parameter is required');
	}

	try {
		// Build World Bank API URL
		const apiUrl = new URL(
			`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}`
		);

		// Add query parameters
		apiUrl.searchParams.set('format', 'json');
		apiUrl.searchParams.set('per_page', '100'); // Fetch up to 100 data points

		if (date) {
			apiUrl.searchParams.set('date', date);
		}

		if (mrv) {
			apiUrl.searchParams.set('mrv', mrv);
		}

		console.log(
			`[WorldBank] Fetching ${indicator} for ${country}${date ? ` (${date})` : ''}${mrv ? ` (mrv=${mrv})` : ''}`
		);

		// Fetch from World Bank API
		const response = await fetch(apiUrl.toString());

		if (!response.ok) {
			console.error(`[WorldBank] HTTP ${response.status}: ${response.statusText}`);
			return error(response.status, `World Bank API error: ${response.statusText}`);
		}

		const data = await response.json();

		// World Bank returns [pagination, data] array
		// Check if we got valid data
		if (!Array.isArray(data) || data.length < 2) {
			console.error('[WorldBank] Invalid response format');
			return error(500, 'Invalid World Bank API response format');
		}

		const dataPoints = data[1];
		if (!Array.isArray(dataPoints)) {
			console.error('[WorldBank] Data array missing');
			return error(500, 'Invalid World Bank data format');
		}

		console.log(`[WorldBank] Successfully fetched ${dataPoints.length} data points`);

		return json(data);
	} catch (err: any) {
		console.error('[WorldBank] Error fetching data:', err.message);

		if (err.message?.includes('fetch failed') || err.message?.includes('ENOTFOUND')) {
			return error(503, 'World Bank API is unreachable');
		}

		return error(500, `Failed to fetch World Bank data: ${err.message}`);
	}
};
