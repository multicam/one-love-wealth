import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * IMF (International Monetary Fund) proxy endpoint
 * Server-side proxy to avoid CORS
 * No API key required - fully open API
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const database = url.searchParams.get('database');
	const indicator = url.searchParams.get('indicator');
	const frequency = url.searchParams.get('frequency');
	const country = url.searchParams.get('country');
	const startPeriod = url.searchParams.get('start');
	const endPeriod = url.searchParams.get('end');

	// Validate required parameters
	if (!database || !indicator || !frequency || !country) {
		return error(400, 'database, indicator, frequency, and country parameters are required');
	}

	try {
		console.log(`[IMF] Fetching ${database}/${indicator} for ${country} (${frequency})`);

		// Build API request URL (IMF JSON-stat API)
		// Format: /databases/{database}/dimensions/{dimension1}/...
		const baseUrl = 'https://www.imf.org/external/datamapper/api/v1';

		// IMF uses a complex dimension-based URL structure
		// For IFS database: /IFS/{frequency}/{indicator}/{country}
		let apiUrl: string;

		if (database === 'IFS') {
			apiUrl = `${baseUrl}/${database}/${frequency}.${indicator}/${country}`;
		} else {
			// Other databases may have different URL patterns
			apiUrl = `${baseUrl}/${database}/${indicator}/${country}`;
		}

		// Add period parameters as query strings
		const params = new URLSearchParams();

		if (startPeriod) {
			params.set('startPeriod', startPeriod);
		}

		if (endPeriod) {
			params.set('endPeriod', endPeriod);
		}

		if (params.toString()) {
			apiUrl += `?${params.toString()}`;
		}

		// Fetch data from API
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'Mozilla/5.0'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				return error(
					404,
					`Data not found for ${database}/${indicator}/${country}. Check indicator code and country code.`
				);
			}

			throw new Error(`API returned ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// IMF may return empty data for invalid combinations
		if (!data || !data.values) {
			return error(
				404,
				`No data available for ${database}/${indicator}/${country}`
			);
		}

		console.log(`[IMF] Successfully fetched data for ${country}/${indicator}`);

		return json(data);
	} catch (err: any) {
		console.error('[IMF] Error fetching data:', err.message);

		if (err.message?.includes('404') || err.message?.includes('Not Found')) {
			return error(404, 'IMF data not found. Check database, indicator, and country codes.');
		}

		return error(500, `Failed to fetch IMF data: ${err.message}`);
	}
};
