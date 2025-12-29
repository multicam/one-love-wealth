import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('WorldBank');

export const GET: RequestHandler = async ({ url }) => {
	const indicator = url.searchParams.get('indicator');
	const country = url.searchParams.get('country') || 'USA';
	const date = url.searchParams.get('date');
	const mrv = url.searchParams.get('mrv');

	if (!indicator) {
		return error(400, 'indicator parameter is required');
	}

	const result = await handler.fetch<unknown[]>({
		url: handler.buildUrl(
			`https://api.worldbank.org/v2/country/${country}/indicator/${indicator}`,
			{
				format: 'json',
				per_page: '100',
				date,
				mrv
			}
		)
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!Array.isArray(data) || data.length < 2) {
		return error(500, 'Invalid World Bank API response format');
	}

	const dataPoints = data[1];
	if (!Array.isArray(dataPoints)) {
		return error(500, 'Invalid World Bank data format');
	}

	handler.logSuccess(dataPoints.length);
	return json(data);
};
