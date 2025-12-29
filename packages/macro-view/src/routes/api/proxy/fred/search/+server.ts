import { FRED_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('text');

	if (!query) {
		return json({ error: 'Missing text parameter' }, { status: 400 });
	}

	if (!FRED_API_KEY) {
		return json({ error: 'Server misconfiguration: No FRED API Key' }, { status: 500 });
	}

	try {
		const fredUrl = `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(query)}&api_key=${FRED_API_KEY}&file_type=json`;
		const response = await fetch(fredUrl);

		if (!response.ok) {
			const text = await response.text();
			return json({ error: `FRED API Error: ${response.statusText}`, details: text }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (err: any) {
		return json({ error: 'Failed to search FRED', details: err.message }, { status: 500 });
	}
};
