import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('CoinGecko', 'https://api.coingecko.com');

export const GET: RequestHandler = async ({ url }) => {
	const coinId = url.searchParams.get('coin_id');
	const vsCurrency = url.searchParams.get('vs_currency') || 'usd';
	const requestedDays = url.searchParams.get('days') || '365';
	const days = requestedDays === 'max' ? '365' : requestedDays;

	if (!coinId) {
		return error(400, 'Missing coin_id parameter');
	}

	const result = await handler.fetch({
		url: handler.buildUrl(`/api/v3/coins/${coinId}/market_chart`, {
			vs_currency: vsCurrency,
			days
		}),
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'MacroView-App/1.0'
		}
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	return json(result.data);
};
