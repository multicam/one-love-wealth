import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const coinId = url.searchParams.get('coin_id');
	const vsCurrency = url.searchParams.get('vs_currency') || 'usd';
	// Free tier limited to 365 days max
	const requestedDays = url.searchParams.get('days') || '365';
	const days = requestedDays === 'max' ? '365' : requestedDays;

	if (!coinId) {
		return json({ error: 'Missing coin_id parameter' }, { status: 400 });
	}

	try {
		const cgUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
		console.log(`[Proxy] Fetching CoinGecko: ${cgUrl}`);
		
		const response = await fetch(cgUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'MacroView-App/1.0'
            }
        });

		if (!response.ok) {
            const text = await response.text();
            console.error(`[Proxy] CoinGecko Error (${response.status}): ${text}`);
			return json({ error: `CoinGecko API Error: ${response.statusText}`, details: text }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (err: any) {
        console.error(`[Proxy] Failed to fetch from CoinGecko: ${err.message}`);
		return json({ error: 'Failed to fetch from CoinGecko', details: err.message }, { status: 500 });
	}
};
