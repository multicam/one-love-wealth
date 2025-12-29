import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('OECD', 'https://sdmx.oecd.org');

interface OECDResponse {
	data?: {
		dataSets?: unknown[];
	};
	[key: string]: unknown;
}

export const GET: RequestHandler = async ({ url }) => {
	const dataset = url.searchParams.get('dataset');
	const indicator = url.searchParams.get('indicator');
	const location = url.searchParams.get('location');
	const frequency = url.searchParams.get('frequency');
	const startTime = url.searchParams.get('start');
	const endTime = url.searchParams.get('end');

	if (!dataset || !indicator || !location) {
		return error(400, 'dataset, indicator, and location parameters are required');
	}

	// Build SDMX filter
	let filter = `${location}.${indicator}`;
	if (frequency) {
		filter += `.${frequency}`;
	}

	// Build API path based on dataset
	let apiPath: string;
	if (dataset === 'QNA') {
		apiPath = `/public/rest/data/OECD.SDD.NAD,DSD_NAMAIN10@DF_QNA,1.0/${filter}/all`;
	} else {
		apiPath = `/public/rest/data/${dataset}/${filter}/all`;
	}

	const result = await handler.fetch<OECDResponse>({
		url: handler.buildUrl(apiPath, {
			format: 'jsondata',
			detail: 'dataonly',
			startPeriod: startTime,
			endPeriod: endTime
		}),
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Mozilla/5.0'
		}
	});

	if (!result.ok) {
		if (result.status === 404) {
			return error(404, `Data not found for ${dataset}/${indicator}/${location}. Check dataset, indicator, and location codes.`);
		}
		if (result.status === 400) {
			return error(400, 'Invalid OECD API request. Check parameter format.');
		}
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!data || !data.data || !data.data.dataSets || data.data.dataSets.length === 0) {
		return error(404, `No data available for ${dataset}/${indicator}/${location}`);
	}

	return json(data.data);
};
