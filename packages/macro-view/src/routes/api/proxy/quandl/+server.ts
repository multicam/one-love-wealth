import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import { QUANDL_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('Quandl', 'https://data.nasdaq.com');

interface QuandlResponse {
	quandl_error?: { message?: string };
	[key: string]: unknown;
}

export const GET: RequestHandler = async ({ url }) => {
	const database = url.searchParams.get('database');
	const dataset = url.searchParams.get('dataset');
	const columnIndex = url.searchParams.get('column_index');
	const startDate = url.searchParams.get('start_date');
	const endDate = url.searchParams.get('end_date');
	const collapse = url.searchParams.get('collapse');
	const transform = url.searchParams.get('transform');
	const rows = url.searchParams.get('rows');

	if (!database || !dataset) {
		return error(400, 'database and dataset parameters are required');
	}

	const result = await handler.fetch<QuandlResponse>({
		url: handler.buildUrl(`/api/v3/datasets/${database}/${dataset}.json`, {
			api_key: QUANDL_API_KEY,
			column_index: columnIndex,
			start_date: startDate,
			end_date: endDate,
			collapse,
			transform,
			rows
		})
	});

	if (!result.ok) {
		if (result.status === 404) {
			return error(404, `Dataset not found: ${database}/${dataset}`);
		}
		return error(result.status, result.error);
	}

	const data = result.data;

	if (data.quandl_error) {
		return error(400, data.quandl_error.message || 'Quandl API error');
	}

	return json(data);
};
