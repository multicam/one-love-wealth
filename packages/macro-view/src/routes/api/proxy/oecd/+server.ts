import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('OECD', 'https://sdmx.oecd.org');

interface OECDResponse {
	data?: {
		dataSets?: unknown[];
		structure?: unknown;
	};
	[key: string]: unknown;
}

/**
 * OECD SDMX API proxy
 * 
 * New API structure (2024+):
 * - CLI (Composite Leading Indicators): OECD.SDD.STES,DSD_STES@DF_CLI
 * - KEI (Key Economic Indicators): OECD.SDD.STES,DSD_KEI@DF_KEI
 * - QNA (Quarterly National Accounts): OECD.SDD.NAD,DSD_NAMAIN10@DF_QNA
 * 
 * Filter format for CLI: REF_AREA.FREQ.INDICATOR.MEASURE.ADJUSTMENT.UNIT_MEASURE.TRANSFORMATION.DECIMALS.TIME_FORMAT
 * Example: USA.........  (9 dots for 9 dimensions, empty = all)
 */
export const GET: RequestHandler = async ({ url }) => {
	const dataset = url.searchParams.get('dataset');
	const indicator = url.searchParams.get('indicator');
	const location = url.searchParams.get('location');
	const frequency = url.searchParams.get('frequency') || 'M';
	const startTime = url.searchParams.get('start');
	const endTime = url.searchParams.get('end');

	if (!dataset || !location) {
		return error(400, 'dataset and location parameters are required');
	}

	// Build API path based on dataset type
	let apiPath: string;
	
	if (dataset === 'MEI_CLI' || dataset === 'CLI') {
		// Composite Leading Indicators - new SDMX structure
		// Format: REF_AREA.FREQ.INDICATOR.MEASURE.ADJUSTMENT.UNIT_MEASURE.TRANSFORMATION.DECIMALS.TIME_FORMAT
		// Use wildcards (.) for dimensions we don't need to filter
		const filter = `${location}.${frequency}.......`;
		apiPath = `/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI/${filter}`;
	} else if (dataset === 'KEI') {
		// Key Economic Indicators
		const filter = `${location}.${frequency}.......`;
		apiPath = `/public/rest/data/OECD.SDD.STES,DSD_KEI@DF_KEI/${filter}`;
	} else if (dataset === 'QNA') {
		// Quarterly National Accounts
		const filter = `${location}.${frequency}.${indicator || ''}....`;
		apiPath = `/public/rest/data/OECD.SDD.NAD,DSD_NAMAIN10@DF_QNA/${filter}`;
	} else {
		// Fallback to generic format
		const filter = `${location}.${frequency}.${indicator || ''}`;
		apiPath = `/public/rest/data/${dataset}/${filter}`;
	}

	const result = await handler.fetch<OECDResponse>({
		url: handler.buildUrl(apiPath, {
			format: 'jsondata',
			detail: 'full',
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
			return error(404, `Data not found for ${dataset}/${location}. The OECD API structure may have changed.`);
		}
		if (result.status === 400) {
			return error(400, 'Invalid OECD API request. Check parameter format.');
		}
		return error(result.status, result.error);
	}

	const data = result.data;

	if (!data || !data.data || !data.data.dataSets || data.data.dataSets.length === 0) {
		return error(404, `No data available for ${dataset}/${location}`);
	}

	return json(data.data);
};
