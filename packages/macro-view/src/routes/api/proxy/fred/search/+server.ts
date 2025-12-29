import { FRED_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('FRED Search', 'https://api.stlouisfed.org');

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('text');

	if (!query) {
		return error(400, 'Missing text parameter');
	}

	if (!FRED_API_KEY) {
		return error(500, 'Server misconfiguration: No FRED API Key');
	}

	const result = await handler.fetch({
		url: handler.buildUrl('/fred/series/search', {
			search_text: query,
			api_key: FRED_API_KEY,
			file_type: 'json'
		})
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	return json(result.data);
};
