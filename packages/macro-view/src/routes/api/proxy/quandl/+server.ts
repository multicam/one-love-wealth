import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Quandl (Nasdaq Data Link) proxy endpoint
 * Server-side proxy to hide API key and avoid CORS
 * Free tier: 50 calls/day (anonymous), 500 calls/day (with API key)
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const database = url.searchParams.get('database');
	const dataset = url.searchParams.get('dataset');
	const columnIndex = url.searchParams.get('column_index');
	const startDate = url.searchParams.get('start_date');
	const endDate = url.searchParams.get('end_date');
	const collapse = url.searchParams.get('collapse');
	const transform = url.searchParams.get('transform');
	const rows = url.searchParams.get('rows');

	// Validate required parameters
	if (!database || !dataset) {
		return error(400, 'database and dataset parameters are required');
	}

	// Get API key from environment (optional for free tier)
	const apiKey = process.env.QUANDL_API_KEY;

	try {
		console.log(`[Quandl] Fetching ${database}/${dataset}`);

		// Build API request URL
		const baseUrl = `https://data.nasdaq.com/api/v3/datasets/${database}/${dataset}.json`;
		const params = new URLSearchParams();

		if (apiKey) {
			params.set('api_key', apiKey);
		}

		if (columnIndex) {
			params.set('column_index', columnIndex);
		}

		if (startDate) {
			params.set('start_date', startDate);
		}

		if (endDate) {
			params.set('end_date', endDate);
		}

		if (collapse) {
			params.set('collapse', collapse);
		}

		if (transform) {
			params.set('transform', transform);
		}

		if (rows) {
			params.set('rows', rows);
		}

		const apiUrl = `${baseUrl}?${params.toString()}`;

		// Fetch data from API
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				return error(404, `Dataset not found: ${database}/${dataset}`);
			}

			if (response.status === 429) {
				return error(429, 'Quandl rate limit exceeded');
			}

			throw new Error(`API returned ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Check for API errors
		if (data.quandl_error) {
			return error(400, data.quandl_error.message || 'Quandl API error');
		}

		console.log(`[Quandl] Successfully fetched ${database}/${dataset}`);

		return json(data);
	} catch (err: any) {
		console.error('[Quandl] Error fetching data:', err.message);

		if (err.message?.includes('429') || err.message?.includes('Rate limit')) {
			return error(429, 'Quandl rate limit exceeded. Try with API key for higher limits.');
		}

		return error(500, `Failed to fetch Quandl data: ${err.message}`);
	}
};
