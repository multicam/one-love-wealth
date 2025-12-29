import { json, error } from '@sveltejs/kit';
import YahooFinance from 'yahoo-finance2';
import type { RequestHandler } from './$types';

// Instantiate yahoo-finance2 (required in v2+)
const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance proxy endpoint
 * Uses yahoo-finance2 library server-side to avoid CORS issues
 * No API key required
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const symbol = url.searchParams.get('symbol');
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');
	const interval = url.searchParams.get('interval') || '1d';
	const includeAdjustedClose = url.searchParams.get('includeAdjustedClose') !== 'false';

	// Validate required parameters
	if (!symbol) {
		return error(400, 'symbol parameter is required');
	}

	// Validate interval
	const validIntervals = ['1d', '1wk', '1mo'];
	if (!validIntervals.includes(interval)) {
		return error(400, `Invalid interval. Must be one of: ${validIntervals.join(', ')}`);
	}

	try {
		console.log(`[Yahoo] Fetching ${symbol} from ${start || 'default'} to ${end || 'now'}`);

		// Fetch historical data using yahoo-finance2
		const data: any[] = await yahooFinance.historical(symbol, {
			period1: start || '2020-01-01',
			period2: end || new Date().toISOString().split('T')[0],
			interval: interval as '1d' | '1wk' | '1mo'
		});

		// Log success
		console.log(`[Yahoo] Successfully fetched ${data.length} data points for ${symbol}`);

		return json(data);
	} catch (err: any) {
		console.error('[Yahoo] Error fetching data:', err.message);

		// Handle specific yahoo-finance2 errors
		if (err.message?.includes('Not Found') || err.message?.includes('404')) {
			return error(404, `Symbol not found: ${symbol}`);
		}

		if (err.message?.includes('Rate limit') || err.message?.includes('429')) {
			return error(429, 'Yahoo Finance rate limit exceeded. Please try again later.');
		}

		return error(500, `Failed to fetch Yahoo Finance data: ${err.message}`);
	}
};
