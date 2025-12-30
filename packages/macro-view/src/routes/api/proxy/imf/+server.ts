import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('IMF', 'https://www.imf.org');

interface IMFResponse {
	values?: Record<string, Record<string, Record<string, number>>>;
	api?: { version: string };
	[key: string]: unknown;
}

/**
 * IMF DataMapper API proxy
 * 
 * API Documentation: https://www.imf.org/external/datamapper/api/help
 * 
 * Common indicators:
 * - NGDP_RPCH: Real GDP growth (annual percent change)
 * - PCPIPCH: Inflation rate (consumer prices, annual percent change)
 * - LUR: Unemployment rate
 * - BCA_NGDPD: Current account balance (% of GDP)
 * - GGXWDG_NGDP: General government gross debt (% of GDP)
 * 
 * Country codes: USA, CHN, DEU, JPN, GBR, FRA, etc.
 */
export const GET: RequestHandler = async ({ url }) => {
	const indicator = url.searchParams.get('indicator');
	const country = url.searchParams.get('country');
	const periods = url.searchParams.get('periods');

	if (!indicator) {
		return error(400, 'indicator parameter is required (e.g., NGDP_RPCH for Real GDP growth)');
	}

	// Build URL path: /api/v1/{indicator}/{country}
	// Country is optional - if not provided, returns all countries
	let apiPath = `/external/datamapper/api/v1/${indicator}`;
	if (country) {
		apiPath += `/${country}`;
	}

	// Build query params
	const queryParams: Record<string, string | null> = {};
	if (periods) {
		queryParams.periods = periods;
	}

	const result = await handler.fetch<IMFResponse>({
		url: handler.buildUrl(apiPath, queryParams),
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Mozilla/5.0'
		}
	});

	if (!result.ok) {
		if (result.status === 404) {
			return error(404, `Indicator not found: ${indicator}. Check https://www.imf.org/external/datamapper/api/v1/indicators for available indicators.`);
		}
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!data || !data.values) {
		return error(404, `No data available for ${indicator}${country ? '/' + country : ''}`);
	}

	return json(data);
};
