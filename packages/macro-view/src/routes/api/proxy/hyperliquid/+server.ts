import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { HyperliquidDataType } from '$lib/types/providers/hyperliquid';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('Hyperliquid');
const API_URL = 'https://api.hyperliquid.xyz/info';

interface MetaAndAssetCtxsResponse extends Array<unknown> {
	0?: { universe?: Array<{ name: string }> };
	1?: Array<{ openInterest?: string }>;
}

export const GET: RequestHandler = async ({ url }) => {
	const coin = url.searchParams.get('coin');
	const dataType = url.searchParams.get('dataType') as HyperliquidDataType | null;
	const interval = url.searchParams.get('interval') || '1d';
	const startTime = url.searchParams.get('startTime');
	const endTime = url.searchParams.get('endTime');

	if (!coin) {
		return error(400, 'coin parameter is required');
	}

	if (!dataType) {
		return error(400, 'dataType parameter is required');
	}

	const validDataTypes: HyperliquidDataType[] = ['candles', 'fundingHistory', 'openInterest'];
	if (!validDataTypes.includes(dataType)) {
		return error(400, `Invalid dataType. Must be one of: ${validDataTypes.join(', ')}`);
	}

	let requestBody: Record<string, unknown>;

	if (dataType === 'candles') {
		requestBody = {
			type: 'candleSnapshot',
			req: {
				coin,
				interval,
				startTime: startTime ? parseInt(startTime) : Date.now() - 365 * 24 * 60 * 60 * 1000,
				endTime: endTime ? parseInt(endTime) : Date.now()
			}
		};
	} else if (dataType === 'fundingHistory') {
		requestBody = {
			type: 'fundingHistory',
			coin,
			startTime: startTime ? parseInt(startTime) : Date.now() - 30 * 24 * 60 * 60 * 1000,
			...(endTime && { endTime: parseInt(endTime) })
		};
	} else {
		// openInterest - needs metaAndAssetCtxs
		requestBody = { type: 'metaAndAssetCtxs' };
	}

	const result = await handler.fetch<unknown>({
		url: API_URL,
		method: 'POST',
		body: requestBody
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	let data = result.data;

	// Special handling for open interest
	if (dataType === 'openInterest') {
		const response = data as MetaAndAssetCtxsResponse;
		if (!Array.isArray(response) || response.length < 2) {
			return error(500, 'Invalid Hyperliquid API response format');
		}

		const meta = response[0]?.universe || [];
		const contexts = response[1] || [];

		const coinIndex = meta.findIndex((m) => m.name === coin);

		if (coinIndex >= 0 && contexts[coinIndex]) {
			data = { openInterest: contexts[coinIndex].openInterest || '0' };
		} else {
			data = { openInterest: '0' };
		}
	}

	const dataPoints = Array.isArray(data) ? data.length : 1;
	handler.logSuccess(dataPoints);

	return json(data);
};
