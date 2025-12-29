import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('BLS');

interface BLSResponse {
	status: string;
	message?: string[];
	Results?: {
		series?: Array<{
			seriesID: string;
			data?: unknown[];
		}>;
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const seriesId = url.searchParams.get('seriesId');
	const startYear = url.searchParams.get('startYear');
	const endYear = url.searchParams.get('endYear');
	const calculations = url.searchParams.get('calculations') === 'true';
	const annualaverage = url.searchParams.get('annualaverage') === 'true';

	if (!seriesId) {
		return error(400, 'seriesId parameter is required');
	}

	if (!startYear || !endYear) {
		return error(400, 'startYear and endYear parameters are required');
	}

	const BLS_API_KEY = env.BLS_API_KEY;
	const hasApiKey = BLS_API_KEY && BLS_API_KEY.length > 0;
	const apiUrl = hasApiKey
		? 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
		: 'https://api.bls.gov/publicAPI/v1/timeseries/data/';

	const requestBody: Record<string, unknown> = {
		seriesid: [seriesId],
		startyear: startYear,
		endyear: endYear
	};

	if (hasApiKey) {
		requestBody.registrationkey = BLS_API_KEY;
		if (calculations) requestBody.calculations = true;
		if (annualaverage) requestBody.annualaverage = true;
	}

	const result = await handler.fetch<BLSResponse>({
		url: apiUrl,
		method: 'POST',
		body: requestBody
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	const data = result.data;

	if (data.status !== 'REQUEST_SUCCEEDED') {
		const messages = data.message?.join(', ') || 'Unknown error';
		return error(500, `BLS API error: ${messages}`);
	}

	const dataPoints = data.Results?.series?.[0]?.data?.length || 0;
	handler.logSuccess(dataPoints);

	return json(data);
};
