// CoinGecko API - Using shared data-layer
// Rate limit: 10-50 calls/minute (depending on endpoint)
// Docs: https://docs.coingecko.com/reference/introduction

import {
	CoinGeckoProvider,
	type CoinGeckoConfig,
	MemoryAdapter,
	DirectRequestAdapter,
	type DataPoint,
} from '@one-love-wealth/data-layer';

const API_URL = 'https://api.coingecko.com/api/v3';

// Create shared provider instance for market_chart data
const sharedCache = new MemoryAdapter();
const sharedRequest = new DirectRequestAdapter({ coingecko: API_URL });
const sharedProvider = new CoinGeckoProvider(sharedCache, sharedRequest);

interface CoinPrice {
	current: number;
	change24h: number;
	changePercent24h: number;
	lastUpdate: Date;
}

interface HistoricalPrice {
	timestamp: Date;
	value: number;
}

/**
 * Convert shared DataPoint to HistoricalPrice
 */
function toHistoricalPrice(point: DataPoint): HistoricalPrice {
	return {
		timestamp: new Date(point.time),
		value: point.value ?? point.close ?? 0,
	};
}

/**
 * Get current BTC price in USD
 */
export async function getBTCPrice(): Promise<CoinPrice> {
	const response = await fetch(
		`${API_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`
	);
	const data = await response.json();

	return {
		current: data.bitcoin.usd,
		change24h: data.bitcoin.usd * (data.bitcoin.usd_24h_change / 100),
		changePercent24h: data.bitcoin.usd_24h_change,
		lastUpdate: new Date()
	};
}

/**
 * Get current Gold price in USD (per ounce)
 */
export async function getGoldPrice(): Promise<CoinPrice> {
	// CoinGecko has gold price as "pax-gold" (PAXG) which tracks physical gold
	const response = await fetch(
		`${API_URL}/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true`
	);
	const data = await response.json();

	return {
		current: data['pax-gold'].usd,
		change24h: data['pax-gold'].usd * (data['pax-gold'].usd_24h_change / 100),
		changePercent24h: data['pax-gold'].usd_24h_change,
		lastUpdate: new Date()
	};
}

/**
 * Get BTC/Gold ratio
 */
export async function getBTCGoldRatio(): Promise<CoinPrice> {
	const [btc, gold] = await Promise.all([getBTCPrice(), getGoldPrice()]);

	const ratio = btc.current / gold.current;
	const prevBtc = btc.current - btc.change24h;
	const prevGold = gold.current - gold.change24h;
	const prevRatio = prevBtc / prevGold;
	const change = ratio - prevRatio;

	return {
		current: ratio,
		change24h: change,
		changePercent24h: (change / prevRatio) * 100,
		lastUpdate: new Date()
	};
}

/**
 * Get historical prices for a coin (last N days)
 * Uses shared data-layer provider for transformation
 */
export async function getHistoricalPrices(
	coinId: string,
	days: number = 30
): Promise<HistoricalPrice[]> {
	try {
		const config: CoinGeckoConfig = {
			coinId,
			vsCurrency: 'usd',
			days,
			interval: 'daily',
			endpoint: 'market_chart',
		};

		const result = await sharedProvider.fetch(config);
		return result.series.data.map(toHistoricalPrice);
	} catch (error) {
		// Fallback to direct API call if shared provider fails
		console.warn('Shared provider failed, using direct API call:', error);
		const response = await fetch(
			`${API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
		);
		const data = await response.json();

		return data.prices.map(([timestamp, price]: [number, number]) => ({
			timestamp: new Date(timestamp),
			value: price
		}));
	}
}

/**
 * Get BTC historical prices
 */
export async function getBTCHistoricalPrices(days: number = 30): Promise<HistoricalPrice[]> {
	return getHistoricalPrices('bitcoin', days);
}

/**
 * Get Gold historical prices
 */
export async function getGoldHistoricalPrices(days: number = 30): Promise<HistoricalPrice[]> {
	return getHistoricalPrices('pax-gold', days);
}

/**
 * Get BTC/Gold ratio historical data
 */
export async function getBTCGoldRatioHistory(days: number = 30): Promise<HistoricalPrice[]> {
	const [btcHistory, goldHistory] = await Promise.all([
		getBTCHistoricalPrices(days),
		getGoldHistoricalPrices(days)
	]);

	// Match up timestamps and calculate ratio
	return btcHistory.map((btc, i) => ({
		timestamp: btc.timestamp,
		value: btc.value / goldHistory[i].value
	}));
}

export const coinGeckoAPI = {
	getBTCPrice,
	getGoldPrice,
	getBTCGoldRatio,
	getBTCHistoricalPrices,
	getGoldHistoricalPrices,
	getBTCGoldRatioHistory
};
