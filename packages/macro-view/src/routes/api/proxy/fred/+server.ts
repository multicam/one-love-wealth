import { FRED_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Parameters to pass through to FRED API
const FRED_PARAMS = [
	'series_id',
	'observation_start',
	'observation_end',
	'units',
	'frequency',
	'aggregation_method',
	'limit',
	'offset',
	'sort_order',
	'realtime_start',
	'realtime_end',
	'vintage_dates',
	'output_type'
];

export const GET: RequestHandler = async ({ url }) => {
	const seriesId = url.searchParams.get('series_id');

	if (!seriesId) {
		return json({ error: 'Missing series_id parameter' }, { status: 400 });
	}

	if (!FRED_API_KEY) {
		console.error('[Proxy] Server misconfiguration: No FRED API Key');
		return json({ error: 'Server misconfiguration: No FRED API Key' }, { status: 500 });
	}

	try {
		// Build URL with all passed parameters
		const fredUrl = new URL('https://api.stlouisfed.org/fred/series/observations');
		fredUrl.searchParams.set('api_key', FRED_API_KEY);
		fredUrl.searchParams.set('file_type', 'json');

		// Pass through all supported parameters
		for (const param of FRED_PARAMS) {
			const value = url.searchParams.get(param);
			if (value) {
				fredUrl.searchParams.set(param, value);
			}
		}

		console.log(`[Proxy] FRED: ${fredUrl.toString().replace(FRED_API_KEY, '***')}`);

		const response = await fetch(fredUrl.toString());

		if (!response.ok) {
			const text = await response.text();
			console.error(`[Proxy] FRED API Error (${response.status}): ${text}`);
			return json(
				{ error: `FRED API Error: ${response.statusText}`, details: text },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json(data);
	} catch (err: any) {
		console.error(`[Proxy] Failed to fetch from FRED: ${err.message}`);
		return json({ error: 'Failed to fetch from FRED', details: err.message }, { status: 500 });
	}
};
