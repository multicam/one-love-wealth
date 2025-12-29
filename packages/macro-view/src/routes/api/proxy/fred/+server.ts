import { FRED_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('FRED', 'https://api.stlouisfed.org');

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
		return error(400, 'Missing series_id parameter');
	}

	if (!FRED_API_KEY) {
		return error(500, 'Server misconfiguration: No FRED API Key');
	}

	// Build params object from URL
	const params: Record<string, string | null> = {
		api_key: FRED_API_KEY,
		file_type: 'json'
	};

	for (const param of FRED_PARAMS) {
		params[param] = url.searchParams.get(param);
	}

	const result = await handler.fetch({
		url: handler.buildUrl('/fred/series/observations', params)
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	return json(result.data);
};
