import { json, error } from '@sveltejs/kit';
import { BLS_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

/**
 * Bureau of Labor Statistics (BLS) API proxy endpoint
 * BLS uses POST requests (not GET)
 * Optional API key increases rate limits from 25 to 500 queries/day
 * Register for free key at: https://data.bls.gov/registrationEngine/
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters from query string
	const seriesId = url.searchParams.get('seriesId');
	const startYear = url.searchParams.get('startYear');
	const endYear = url.searchParams.get('endYear');
	const calculations = url.searchParams.get('calculations') === 'true';
	const annualaverage = url.searchParams.get('annualaverage') === 'true';

	// Validate required parameters
	if (!seriesId) {
		return error(400, 'seriesId parameter is required');
	}

	if (!startYear || !endYear) {
		return error(400, 'startYear and endYear parameters are required');
	}

	try {
		// Determine which API version to use based on API key availability
		const hasApiKey = BLS_API_KEY && BLS_API_KEY.length > 0;
		const apiUrl = hasApiKey
			? 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
			: 'https://api.bls.gov/publicAPI/v1/timeseries/data/';

		// Build POST request body
		const requestBody: any = {
			seriesid: [seriesId],
			startyear: startYear,
			endyear: endYear
		};

		// Add v2-only features if we have an API key
		if (hasApiKey) {
			requestBody.registrationkey = BLS_API_KEY;
			if (calculations) requestBody.calculations = true;
			if (annualaverage) requestBody.annualaverage = true;
		}

		console.log(
			`[BLS] Fetching ${seriesId} (${startYear}-${endYear})${hasApiKey ? ' [v2 with API key]' : ' [v1 no key]'}`
		);

		// Make POST request to BLS API
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			console.error(`[BLS] HTTP ${response.status}: ${response.statusText}`);
			return error(response.status, `BLS API error: ${response.statusText}`);
		}

		const data = await response.json();

		// Check BLS-specific status
		if (data.status !== 'REQUEST_SUCCEEDED') {
			const messages = data.message?.join(', ') || 'Unknown error';
			console.error(`[BLS] Request failed: ${messages}`);
			return error(500, `BLS API error: ${messages}`);
		}

		const dataPoints = data.Results?.series?.[0]?.data?.length || 0;
		console.log(`[BLS] Successfully fetched ${dataPoints} data points`);

		return json(data);
	} catch (err: any) {
		console.error('[BLS] Error fetching data:', err.message);

		if (err.message?.includes('fetch failed') || err.message?.includes('ENOTFOUND')) {
			return error(503, 'BLS API is unreachable');
		}

		if (err.message?.includes('429') || err.message?.includes('rate limit')) {
			return error(
				429,
				'BLS rate limit exceeded. Consider registering for a free API key at https://data.bls.gov/registrationEngine/'
			);
		}

		return error(500, `Failed to fetch BLS data: ${err.message}`);
	}
};
