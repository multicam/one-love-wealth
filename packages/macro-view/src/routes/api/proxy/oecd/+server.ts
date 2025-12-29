import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * OECD (Organisation for Economic Co-operation and Development) proxy endpoint
 * Server-side proxy to avoid CORS
 * No API key required - fully open API
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const dataset = url.searchParams.get('dataset');
	const indicator = url.searchParams.get('indicator');
	const location = url.searchParams.get('location');
	const frequency = url.searchParams.get('frequency');
	const startTime = url.searchParams.get('start');
	const endTime = url.searchParams.get('end');

	// Validate required parameters
	if (!dataset || !indicator || !location) {
		return error(400, 'dataset, indicator, and location parameters are required');
	}

	try {
		console.log(`[OECD] Fetching ${dataset}/${indicator} for ${location}`);

		// Build API request URL (OECD SDMX-JSON API)
		// Format: /SDMX-JSON/data/{dataset}/{filter}/all
		const baseUrl = 'https://sdmx.oecd.org/public/rest/data';

		// Build SDMX filter: LOCATION+INDICATOR.MEASURE.FREQUENCY
		// Simplified: just location and indicator
		let filter = `${location}.${indicator}`;

		if (frequency) {
			filter += `.${frequency}`;
		}

		let apiUrl = `${baseUrl}/OECD.SDD.NAD,DSD_NAMAIN10@DF_QNA,1.0/${filter}/all`;

		// For other datasets, use simpler format
		if (dataset !== 'QNA') {
			apiUrl = `${baseUrl}/${dataset}/${filter}/all`;
		}

		// Add time parameters as query strings
		const params = new URLSearchParams();
		params.set('format', 'jsondata'); // Request JSON format
		params.set('detail', 'dataonly'); // Only data, not metadata

		if (startTime) {
			params.set('startPeriod', startTime);
		}

		if (endTime) {
			params.set('endPeriod', endTime);
		}

		apiUrl += `?${params.toString()}`;

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
					`Data not found for ${dataset}/${indicator}/${location}. Check dataset, indicator, and location codes.`
				);
			}

			if (response.status === 400) {
				return error(400, 'Invalid OECD API request. Check parameter format.');
			}

			throw new Error(`API returned ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// OECD may return empty dataSets for invalid combinations
		if (!data || !data.data || !data.data.dataSets || data.data.dataSets.length === 0) {
			return error(404, `No data available for ${dataset}/${indicator}/${location}`);
		}

		console.log(`[OECD] Successfully fetched data for ${location}/${indicator}`);

		// Return the data portion (SDMX-JSON structure is complex)
		return json(data.data);
	} catch (err: any) {
		console.error('[OECD] Error fetching data:', err.message);

		if (err.message?.includes('404') || err.message?.includes('Not Found')) {
			return error(404, 'OECD data not found. Check dataset, indicator, and location codes.');
		}

		if (err.message?.includes('400') || err.message?.includes('Bad Request')) {
			return error(400, 'Invalid OECD API request format.');
		}

		return error(500, `Failed to fetch OECD data: ${err.message}`);
	}
};
