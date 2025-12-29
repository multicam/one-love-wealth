import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('IMF', 'https://www.imf.org');

interface IMFResponse {
	values?: unknown;
	[key: string]: unknown;
}

export const GET: RequestHandler = async ({ url }) => {
	const database = url.searchParams.get('database');
	const indicator = url.searchParams.get('indicator');
	const frequency = url.searchParams.get('frequency');
	const country = url.searchParams.get('country');
	const startPeriod = url.searchParams.get('start');
	const endPeriod = url.searchParams.get('end');

	if (!database || !indicator || !frequency || !country) {
		return error(400, 'database, indicator, frequency, and country parameters are required');
	}

	// Build URL path based on database type
	let apiPath: string;
	if (database === 'IFS') {
		apiPath = `/external/datamapper/api/v1/${database}/${frequency}.${indicator}/${country}`;
	} else {
		apiPath = `/external/datamapper/api/v1/${database}/${indicator}/${country}`;
	}

	const result = await handler.fetch<IMFResponse>({
		url: handler.buildUrl(apiPath, {
			startPeriod,
			endPeriod
		}),
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Mozilla/5.0'
		}
	});

	if (!result.ok) {
		if (result.status === 404) {
			return error(404, `Data not found for ${database}/${indicator}/${country}. Check indicator code and country code.`);
		}
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!data || !data.values) {
		return error(404, `No data available for ${database}/${indicator}/${country}`);
	}

	return json(data);
};
