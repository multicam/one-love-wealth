import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * {{DISPLAY_NAME}} proxy endpoint
 * Server-side proxy to avoid CORS and hide API keys
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const symbol = url.searchParams.get('symbol');
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');

	// TODO: Add additional parameters as needed

	// Validate required parameters
	if (!symbol) {
		return error(400, 'symbol parameter is required');
	}

	// Get API key from environment (if needed)
	const apiKey = process.env.{{NAME_UPPER}}_API_KEY;

	// TODO: Uncomment if API key is required
	// if (!apiKey) {
	// 	return error(500, '{{DISPLAY_NAME}} API key not configured');
	// }

	try {
		console.log(`[{{DISPLAY_NAME}}] Fetching ${symbol}`);

		// Build API request URL
		const baseUrl = '{{BASE_URL}}';
		const params = new URLSearchParams();

		params.set('symbol', symbol); // TODO: Adjust parameter name based on API

		if (start) {
			params.set('start', start); // TODO: Adjust based on API date format
		}

		if (end) {
			params.set('end', end); // TODO: Adjust based on API date format
		}

		// Add API key if required
		// TODO: Uncomment and adjust based on auth method
		// if (apiKey) {
		// 	params.set('apikey', apiKey); // or use Authorization header
		// }

		const apiUrl = `${baseUrl}?${params.toString()}`;

		// Fetch data from API
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				// TODO: Add auth header if using bearer token
				// 'Authorization': `Bearer ${apiKey}`,
			}
		});

		if (!response.ok) {
			throw new Error(`API returned ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// TODO: Transform/validate response if needed
		// const transformedData = transformApiResponse(data);

		console.log(`[{{DISPLAY_NAME}}] Successfully fetched data for ${symbol}`);

		return json(data);
	} catch (err: any) {
		console.error('[{{DISPLAY_NAME}}] Error fetching data:', err.message);

		// Handle specific API errors
		if (err.message?.includes('404') || err.message?.includes('Not Found')) {
			return error(404, `Symbol not found: ${symbol}`);
		}

		if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
			return error(401, '{{DISPLAY_NAME}} API key is invalid or expired');
		}

		if (err.message?.includes('429') || err.message?.includes('Rate limit')) {
			return error(429, '{{DISPLAY_NAME}} rate limit exceeded. Please try again later.');
		}

		return error(500, `Failed to fetch {{DISPLAY_NAME}} data: ${err.message}`);
	}
};
