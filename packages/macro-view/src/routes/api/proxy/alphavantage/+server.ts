import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Alpha Vantage proxy endpoint
 * Server-side proxy to hide API key and avoid CORS
 * Free tier: 25 requests/day
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const func = url.searchParams.get('function');
	const symbol = url.searchParams.get('symbol');
	const interval = url.searchParams.get('interval');
	const outputsize = url.searchParams.get('outputsize') || 'compact';
	const datatype = url.searchParams.get('datatype') || 'json';
	const fromCurrency = url.searchParams.get('from_currency');
	const toCurrency = url.searchParams.get('to_currency');

	// Validate required parameters
	if (!func) {
		return error(400, 'function parameter is required');
	}

	if (!symbol) {
		return error(400, 'symbol parameter is required');
	}

	// Get API key from environment
	const apiKey = process.env.ALPHAVANTAGE_API_KEY;

	if (!apiKey) {
		console.warn('[Alpha Vantage] API key not configured - using mock data');
		return json({ Note: 'API key not configured. Configure ALPHAVANTAGE_API_KEY in .env' });
	}

	try {
		console.log(`[Alpha Vantage] Fetching ${func} for ${symbol}`);

		// Build API request URL
		const baseUrl = 'https://www.alphavantage.co/query';
		const params = new URLSearchParams();

		params.set('function', func);
		params.set('symbol', symbol);
		params.set('apikey', apiKey);

		if (interval) {
			params.set('interval', interval);
		}

		if (outputsize) {
			params.set('outputsize', outputsize);
		}

		if (datatype) {
			params.set('datatype', datatype);
		}

		if (fromCurrency) {
			params.set('from_currency', fromCurrency);
		}

		if (toCurrency) {
			params.set('to_currency', toCurrency);
		}

		// Special handling for forex functions
		if (func.startsWith('FX_') && symbol.includes('/')) {
			const [from, to] = symbol.split('/');
			params.set('from_symbol', from);
			params.set('to_symbol', to);
			params.delete('symbol');
		}

		// Special handling for crypto functions
		if (func.startsWith('DIGITAL_CURRENCY')) {
			params.set('market', 'USD');
		}

		// Special handling for economic indicators
		if (['TREASURY_YIELD', 'FEDERAL_FUNDS_RATE', 'CPI', 'INFLATION', 'REAL_GDP', 'UNEMPLOYMENT'].includes(func)) {
			if (func === 'TREASURY_YIELD') {
				// Use symbol as maturity (e.g., '10year', '2year')
				params.set('maturity', symbol);
			}
			// For economic indicators, interval param is used differently
			if (interval) {
				params.set('interval', interval);
			}
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
			throw new Error(`API returned ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Check for API error messages
		if (data['Error Message']) {
			return error(400, data['Error Message']);
		}

		if (data['Note']) {
			// Rate limit exceeded
			return error(429, 'Alpha Vantage rate limit exceeded (25 req/day on free tier)');
		}

		console.log(`[Alpha Vantage] Successfully fetched data for ${symbol}`);

		return json(data);
	} catch (err: any) {
		console.error('[Alpha Vantage] Error fetching data:', err.message);

		if (err.message?.includes('429') || err.message?.includes('Rate limit')) {
			return error(429, 'Alpha Vantage rate limit exceeded. Please try again tomorrow.');
		}

		return error(500, `Failed to fetch Alpha Vantage data: ${err.message}`);
	}
};
