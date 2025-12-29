import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import { TREASURY_ENDPOINTS, TREASURY_DATE_FIELDS } from '$lib/types/providers/treasury';
import type { TreasuryDataset } from '$lib/types/providers/treasury';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('Treasury', 'https://api.fiscaldata.treasury.gov');

interface TreasuryResponse {
	data?: Record<string, string | number>[];
	meta?: { 'total-count'?: number };
}

export const GET: RequestHandler = async ({ url }) => {
	const dataset = url.searchParams.get('dataset') as TreasuryDataset | null;
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');
	const fields = url.searchParams.get('fields');

	if (!dataset) {
		return error(400, 'dataset parameter is required');
	}

	const endpoint = TREASURY_ENDPOINTS[dataset];
	if (!endpoint) {
		return error(400, `Invalid dataset. Must be one of: ${Object.keys(TREASURY_ENDPOINTS).join(', ')}`);
	}

	const dateField = TREASURY_DATE_FIELDS[dataset];

	// Build filter string for date range
	const filters: string[] = [];
	if (start) filters.push(`${dateField}:gte:${start}`);
	if (end) filters.push(`${dateField}:lte:${end}`);

	const params: Record<string, string | null> = {
		format: 'json',
		'page[size]': '1000',
		sort: dateField,
		filter: filters.length > 0 ? filters.join(',') : null,
		fields: fields ? `${dateField},${fields}` : null
	};

	const result = await handler.fetch<TreasuryResponse>({
		url: handler.buildUrl(`/services/api/fiscal_service/${endpoint}`, params)
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!data.data || !Array.isArray(data.data)) {
		return error(500, 'Invalid Treasury API response format');
	}

	handler.logSuccess(data.data.length);

	if (data.meta && data.meta['total-count'] && data.meta['total-count'] > 1000) {
		console.warn(
			`[Treasury] Dataset has ${data.meta['total-count']} records, but only returning first 1000.`
		);
	}

	return json(data);
};
