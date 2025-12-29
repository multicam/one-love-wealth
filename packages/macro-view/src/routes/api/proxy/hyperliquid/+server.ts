import { json, error } from '@sveltejs/kit';
import type { HyperliquidDataType } from '$lib/types/providers/hyperliquid';
import type { RequestHandler } from './$types';

/**
 * Hyperliquid DEX API proxy endpoint
 * Uses POST requests with type-based routing
 * No authentication required for market data
 * Base URL: https://api.hyperliquid.xyz/info
 */
export const GET: RequestHandler = async ({ url }) => {
	// Extract parameters
	const coin = url.searchParams.get('coin');
	const dataType = url.searchParams.get('dataType') as HyperliquidDataType | null;
	const interval = url.searchParams.get('interval') || '1d';
	const startTime = url.searchParams.get('startTime');
	const endTime = url.searchParams.get('endTime');

	// Validate required parameters
	if (!coin) {
		return error(400, 'coin parameter is required');
	}

	if (!dataType) {
		return error(400, 'dataType parameter is required');
	}

	// Validate dataType
	const validDataTypes: HyperliquidDataType[] = ['candles', 'fundingHistory', 'openInterest'];
	if (!validDataTypes.includes(dataType)) {
		return error(400, `Invalid dataType. Must be one of: ${validDataTypes.join(', ')}`);
	}

	try {
		const apiUrl = 'https://api.hyperliquid.xyz/info';
		let requestBody: any;

		// Build request body based on data type
		if (dataType === 'candles') {
			// Validate interval for candles
			if (!interval) {
				return error(400, 'interval parameter is required for candles');
			}

			requestBody = {
				type: 'candleSnapshot',
				req: {
					coin,
					interval,
					startTime: startTime
						? parseInt(startTime)
						: Date.now() - 365 * 24 * 60 * 60 * 1000, // Default: 1 year ago
					endTime: endTime ? parseInt(endTime) : Date.now()
				}
			};
		} else if (dataType === 'fundingHistory') {
			requestBody = {
				type: 'fundingHistory',
				coin,
				startTime: startTime ? parseInt(startTime) : Date.now() - 30 * 24 * 60 * 60 * 1000 // Default: 30 days ago
			};

			if (endTime) {
				requestBody.endTime = parseInt(endTime);
			}
		} else if (dataType === 'openInterest') {
			// For open interest, we need to fetch metaAndAssetCtxs and extract the specific coin
			requestBody = {
				type: 'metaAndAssetCtxs'
			};
		}

		console.log(
			`[Hyperliquid] Fetching ${dataType} for ${coin}${dataType === 'candles' ? ` (${interval})` : ''}`
		);

		// Make POST request to Hyperliquid API
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			console.error(`[Hyperliquid] HTTP ${response.status}: ${response.statusText}`);
			return error(response.status, `Hyperliquid API error: ${response.statusText}`);
		}

		let data = await response.json();

		// Special handling for open interest - extract specific coin data
		if (dataType === 'openInterest') {
			if (!Array.isArray(data) || data.length < 2) {
				console.error('[Hyperliquid] Invalid metaAndAssetCtxs response format');
				return error(500, 'Invalid Hyperliquid API response format');
			}

			const meta = data[0]?.universe || [];
			const contexts = data[1] || [];

			// Find the coin index
			const coinIndex = meta.findIndex((m: any) => m.name === coin);

			if (coinIndex >= 0 && contexts[coinIndex]) {
				data = {
					openInterest: contexts[coinIndex].openInterest || '0'
				};
			} else {
				data = { openInterest: '0' };
			}
		}

		const dataPoints = Array.isArray(data) ? data.length : 1;
		console.log(`[Hyperliquid] Successfully fetched ${dataPoints} data points`);

		return json(data);
	} catch (err: any) {
		console.error('[Hyperliquid] Error fetching data:', err.message);

		if (err.message?.includes('fetch failed') || err.message?.includes('ENOTFOUND')) {
			return error(503, 'Hyperliquid API is unreachable');
		}

		if (err.message?.includes('429') || err.message?.includes('rate limit')) {
			return error(429, 'Hyperliquid rate limit exceeded. Please try again later.');
		}

		return error(500, `Failed to fetch Hyperliquid data: ${err.message}`);
	}
};
