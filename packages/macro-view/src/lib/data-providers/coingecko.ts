import { DataProvider } from './base';
import type { CoinGeckoDataSourceConfig } from '../types/providers/coingecko';
import type { DataPoint } from '../db';

export class CoinGeckoProvider extends DataProvider<CoinGeckoDataSourceConfig> {
	readonly name = 'CoinGecko';
	readonly cachePrefix = 'COINGECKO';

	protected buildUrl(config: CoinGeckoDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('coin_id', config.coinId);
		params.set('vs_currency', config.vsCurrency || 'usd');
		params.set('days', (config.days || 'max').toString());

		if (config.interval) {
			params.set('interval', config.interval);
		}
		if (config.precision !== undefined) {
			params.set('precision', config.precision.toString());
		}

		return `/api/proxy/coingecko?${params.toString()}`;
	}

	protected transformResponse(json: any, config: CoinGeckoDataSourceConfig): DataPoint[] {
		if (!json.prices) {
			throw new Error('Invalid CoinGecko response format');
		}

		return json.prices.map((p: [number, number]) => ({
			date: new Date(p[0]).toISOString().split('T')[0],
			value: p[1]
		}));
	}

	protected generateMockData(config: CoinGeckoDataSourceConfig): DataPoint[] {
		const data: DataPoint[] = [];
		const now = new Date();
		let price = config.coinId === 'bitcoin' ? 50000 : 3000;

		for (let i = 365; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			price = price * (1 + (Math.random() - 0.45) * 0.05); // Random walk
			data.push({
				date: d.toISOString().split('T')[0],
				value: price
			});
		}

		return data;
	}
}

// Singleton export
export const coinGeckoProvider = new CoinGeckoProvider();
