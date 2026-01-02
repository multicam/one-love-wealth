/**
 * API Proxy
 * Forwards requests to external data providers (Yahoo Finance, CoinGecko, FRED)
 * to avoid CORS issues in browser
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Allowed data providers
 * Only these providers can be accessed through the proxy
 */
const ALLOWED_PROVIDERS = ['yahoo', 'coingecko', 'fred'];

/**
 * GET handler - forwards request to external provider
 */
export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const { provider } = params;
	const targetUrl = url.searchParams.get('url');

	// Validate inputs
	if (!targetUrl) {
		throw error(400, 'Missing url parameter');
	}

	if (!ALLOWED_PROVIDERS.includes(provider)) {
		throw error(403, `Provider '${provider}' not allowed`);
	}

	// Validate URL format
	try {
		new URL(targetUrl);
	} catch {
		throw error(400, 'Invalid URL format');
	}

	// Fetch from provider
	try {
		const response = await fetch(targetUrl, {
			headers: {
				'User-Agent': 'one-love-wealth/backtesting-ui',
			},
		});

		if (!response.ok) {
			throw error(response.status, `Provider returned ${response.status}`);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Proxy error:', err);
		throw error(502, 'Failed to fetch from provider');
	}
};
