import { json, error } from '@sveltejs/kit';
import { ProxyHandler } from '@one-love-wealth/data-layer';
import { ALPHAVANTAGE_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const handler = new ProxyHandler('Alpha Vantage', 'https://www.alphavantage.co');

interface AVResponse {
	'Error Message'?: string;
	Note?: string;
	[key: string]: unknown;
}

export const GET: RequestHandler = async ({ url }) => {
	const func = url.searchParams.get('function');
	const symbol = url.searchParams.get('symbol');
	const interval = url.searchParams.get('interval');
	const outputsize = url.searchParams.get('outputsize') || 'compact';
	const datatype = url.searchParams.get('datatype') || 'json';
	const fromCurrency = url.searchParams.get('from_currency');
	const toCurrency = url.searchParams.get('to_currency');

	if (!func) {
		return error(400, 'function parameter is required');
	}

	if (!symbol) {
		return error(400, 'symbol parameter is required');
	}

	if (!ALPHAVANTAGE_API_KEY) {
		console.warn('[Alpha Vantage] API key not configured');
		return json({ Note: 'API key not configured. Configure ALPHAVANTAGE_API_KEY in .env' });
	}

	const params: Record<string, string | null> = {
		function: func,
		symbol,
		apikey: ALPHAVANTAGE_API_KEY,
		interval,
		outputsize,
		datatype,
		from_currency: fromCurrency,
		to_currency: toCurrency
	};

	// Handle forex functions
	if (func.startsWith('FX_') && symbol.includes('/')) {
		const [from, to] = symbol.split('/');
		params.from_symbol = from;
		params.to_symbol = to;
		params.symbol = null;
	}

	// Handle crypto functions
	if (func.startsWith('DIGITAL_CURRENCY')) {
		params.market = 'USD';
	}

	// Handle economic indicators
	if (['TREASURY_YIELD', 'FEDERAL_FUNDS_RATE', 'CPI', 'INFLATION', 'REAL_GDP', 'UNEMPLOYMENT'].includes(func)) {
		if (func === 'TREASURY_YIELD') {
			params.maturity = symbol;
		}
	}

	const result = await handler.fetch<AVResponse>({
		url: handler.buildUrl('/query', params)
	});

	if (!result.ok) {
		return error(result.status, result.error);
	}

	const data = result.data;

	if (data['Error Message']) {
		return error(400, data['Error Message']);
	}

	if (data['Note']) {
		return error(429, 'Alpha Vantage rate limit exceeded (25 req/day on free tier)');
	}

	return json(data);
};
