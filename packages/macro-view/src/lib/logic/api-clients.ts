import { db, type EconomicSeries, type DataPoint } from '../db';

const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export class FREDClient {
	async fetchSeries(seriesId: string): Promise<EconomicSeries> {
		const cached = await db.getSeries(`FRED:${seriesId}`);
		if (cached && Date.now() - cached.lastUpdated < STALE_TIME) {
			return cached;
		}

		// Use local proxy to avoid CORS and hide API key
		const url = `/api/proxy/fred?series_id=${seriesId}`;
		
		try {
			const response = await fetch(url);
			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(`FRED Error: ${err.error || response.statusText}`);
			}

			const json = await response.json();
			
			if (!json.observations) {
				throw new Error('Invalid FRED response format');
			}

			const data: DataPoint[] = json.observations.map((obs: any) => ({
				date: obs.date,
				value: parseFloat(obs.value)
			})).filter((dp: any) => !isNaN(dp.value));

			const series: EconomicSeries = {
				id: `FRED:${seriesId}`,
				source: 'FRED',
				lastUpdated: Date.now(),
				data,
				meta: { seriesId }
			};

			await db.saveSeries(series);
			return series;
		} catch (e) {
			console.warn('FRED API failed, using mock data:', e);
			return this.getMockSeries(seriesId);
		}
	}

	async searchSeries(query: string): Promise<any[]> {
		const url = `/api/proxy/fred/search?text=${encodeURIComponent(query)}`;
		
		try {
			const response = await fetch(url);
			if (!response.ok) {
				const err = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(`FRED Search Error: ${err.error || response.statusText}`);
			}

			const json = await response.json();
			return json.seriess || [];
		} catch (e) {
			console.warn('FRED Search failed:', e);
			return [];
		}
	}

	private getMockSeries(seriesId: string): EconomicSeries {
		const data: DataPoint[] = [];
		const now = new Date();
		let value = 100; // Default baseline

		// Set baseline and trend based on series
		if (seriesId === 'IPMAN') value = 100; // Industrial Production (ISM proxy)
		else if (seriesId === 'GFDEGDQ188S') value = 120; // Debt to GDP %
		else if (seriesId === 'A091RC1Q027SBEA') value = 500; // Interest Payments (B)
		else if (seriesId === 'PPIACO') value = 250; // PPI All Commodities (Gold proxy)
		else if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') value = 4.0; // Rates
		else if (seriesId === 'ethereum') value = 3000; // ETH Price
		else if (seriesId === 'NFCI') value = -0.5; // Financial Conditions
		else if (seriesId === 'WPU10') value = 120; // Industrial Metals
		else if (seriesId === 'CIVPART') value = 62; // Labor Force
		else if (seriesId === 'SP500' || seriesId === 'NASDAQ100') value = 4000; // Equities
		else if (seriesId === 'GDPC1') value = 20000; // Real GDP
		else if (seriesId === 'DTWEXBGS') value = 100; // DXY
		else if (seriesId === 'SPDYNCBRTINUSA') value = 11; // Birth Rate
		else if (seriesId === 'OPHNFB') value = 110; // Productivity
		else value = 20000; // M2 Baseline / Default
		
		for (let i = 60; i >= 0; i--) { // 5 years monthly
			const d = new Date(now);
			d.setMonth(d.getMonth() - i);
			
			if (seriesId === 'IPMAN') {
				value = 100 + 5 * Math.sin((i * Math.PI) / 24); // Industrial Production cycles
			} else if (seriesId === 'GFDEGDQ188S' || seriesId === 'TOTDTEUSQ163N') {
				value = value * 1.002;
			} else if (seriesId === 'A091RC1Q027SBEA') {
				value = value * 1.01; 
			} else if (seriesId === 'PPIACO' || seriesId === 'ethereum' || seriesId === 'bitcoin') {
				value = value * (1 + (Math.random() - 0.4) * 0.08);
			} else if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') {
				value = 4.0 + 1.5 * Math.sin((i * Math.PI) / 36);
			} else if (seriesId === 'NFCI') {
				value = -0.5 + Math.random() * 0.5;
			} else if (seriesId === 'SP500' || seriesId === 'NASDAQ100') {
				value = value * (1 + (Math.random() - 0.35) * 0.05); // Upward with vol
			} else {
				// Default slight upward trend
				value = value * 1.001; 
			}

			data.push({
				date: d.toISOString().split('T')[0],
				value
			});
		}

		return {
			id: `FRED:${seriesId}`,
			source: 'FRED',
			lastUpdated: Date.now(),
			data,
			meta: { seriesId, isMock: true }
		};
	}
}

export class CoinGeckoClient {
	async fetchMarketChart(coinId: string, vsCurrency: string = 'usd', days: string = '365'): Promise<EconomicSeries> {
		const id = `COINGECKO:${coinId}:${vsCurrency}`;
		const cached = await db.getSeries(id);
		
		if (cached && Date.now() - cached.lastUpdated < STALE_TIME) {
			return cached;
		}

		// Use local proxy
		const url = `/api/proxy/coingecko?coin_id=${coinId}&vs_currency=${vsCurrency}&days=${days}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`CoinGecko Error: ${response.statusText}`);
			}

			const json = await response.json();
			
			if (!json.prices) {
				throw new Error('Invalid CoinGecko response format');
			}

			const data: DataPoint[] = json.prices.map((p: [number, number]) => ({
				time: p[0],
				value: p[1]
			}));

			const series: EconomicSeries = {
				id,
				source: 'COINGECKO',
				lastUpdated: Date.now(),
				data,
				meta: { coinId, vsCurrency }
			};

			await db.saveSeries(series);
			return series;
		} catch (e) {
			console.warn('CoinGecko API failed, using mock data:', e);
			// Fallback mock data
			return this.getMockSeries(id, coinId);
		}
	}

	private getMockSeries(id: string, coinId: string): EconomicSeries {
		const data: DataPoint[] = [];
		const now = new Date();
		let price = 50000;
		for (let i = 365; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			price = price * (1 + (Math.random() - 0.45) * 0.05); // Random walk
			data.push({
				date: d.toISOString().split('T')[0],
				value: price
			});
		}
		return {
			id,
			source: 'COINGECKO',
			lastUpdated: Date.now(),
			data,
			meta: { coinId, isMock: true }
		};
	}
}
export class YahooClient {
	async fetchHistorical(symbol: string): Promise<EconomicSeries> {
		const id = `YAHOO:${symbol}`;
		const cached = await db.getSeries(id);
		
		if (cached && Date.now() - cached.lastUpdated < STALE_TIME) {
			return cached;
		}

		const url = `/api/proxy/yahoo?symbol=${encodeURIComponent(symbol)}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Yahoo Error: ${response.statusText}`);
			}

			const json = await response.json();
			
			if (!Array.isArray(json)) {
				throw new Error('Invalid Yahoo response format');
			}

			const data: DataPoint[] = json.map((item: any) => ({
				date: new Date(item.date).toISOString().split('T')[0],
				value: item.adjClose || item.close
			})).filter((dp: DataPoint) => !isNaN(dp.value));

			const series: EconomicSeries = {
				id,
				source: 'YAHOO',
				lastUpdated: Date.now(),
				data,
				meta: { symbol }
			};

			await db.saveSeries(series);
			return series;
		} catch (e) {
			console.warn('Yahoo API failed, using mock data:', e);
			return this.getMockSeries(id, symbol);
		}
	}

	private getMockSeries(id: string, symbol: string): EconomicSeries {
		const data: DataPoint[] = [];
		const now = new Date();
		let price = symbol.includes('GLD') ? 180 : 15000; // Gold ETF vs NASDAQ
		for (let i = 365; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			price = price * (1 + (Math.random() - 0.45) * 0.03);
			data.push({
				date: d.toISOString().split('T')[0],
				value: price
			});
		}
		return {
			id,
			source: 'YAHOO',
			lastUpdated: Date.now(),
			data,
			meta: { symbol, isMock: true }
		};
	}
}

export const fredClient = new FREDClient();
export const coinGeckoClient = new CoinGeckoClient();
export const yahooClient = new YahooClient();
