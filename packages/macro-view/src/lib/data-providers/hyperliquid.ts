import { DataProvider } from './base';
import type { HyperliquidDataSourceConfig } from '../types/providers/hyperliquid';
import type { DataPoint } from '../db';

/**
 * Hyperliquid DEX API provider
 * Provides crypto perpetual futures data
 * No API key required for market data
 */
export class HyperliquidProvider extends DataProvider<HyperliquidDataSourceConfig> {
	readonly name = 'Hyperliquid';
	readonly cachePrefix = 'HYPERLIQUID';
	protected defaultTTL = 5 * 60 * 1000; // 5 minutes for crypto data

	/**
	 * Build proxy URL for Hyperliquid request
	 * Note: Hyperliquid uses POST requests, but we pass params as query string
	 * and the proxy route will convert them to POST body
	 */
	protected buildUrl(config: HyperliquidDataSourceConfig): string {
		const params = new URLSearchParams();
		params.set('coin', config.coin);
		params.set('dataType', config.dataType);

		if (config.dataType === 'candles' && config.interval) {
			params.set('interval', config.interval);
		}

		if (config.dateRange?.startTime) {
			params.set('startTime', config.dateRange.startTime.toString());
		}

		if (config.dateRange?.endTime) {
			params.set('endTime', config.dateRange.endTime.toString());
		}

		return `/api/proxy/hyperliquid?${params.toString()}`;
	}

	/**
	 * Transform Hyperliquid response to DataPoint array
	 * Different response formats for different data types
	 */
	protected transformResponse(json: any, config: HyperliquidDataSourceConfig): DataPoint[] {
		// Candles data: array of candle objects
		if (config.dataType === 'candles') {
			if (!Array.isArray(json)) {
				throw new Error('Invalid Hyperliquid candles response format');
			}

			return json
				.map((candle: any) => ({
					date: new Date(candle.t).toISOString().split('T')[0],
					value: parseFloat(candle.c) // Close price
				}))
				.filter((dp: DataPoint) => !isNaN(dp.value));
		}

		// Funding history: array of funding rate objects
		if (config.dataType === 'fundingHistory') {
			if (!Array.isArray(json)) {
				throw new Error('Invalid Hyperliquid funding history response format');
			}

			return json
				.map((item: any) => ({
					date: new Date(item.time).toISOString().split('T')[0],
					value: parseFloat(item.fundingRate) * 100 // Convert to percentage
				}))
				.filter((dp: DataPoint) => !isNaN(dp.value));
		}

		// Open interest: single value response
		if (config.dataType === 'openInterest') {
			if (typeof json.openInterest === 'undefined') {
				throw new Error('Invalid Hyperliquid open interest response format');
			}

			return [
				{
					date: new Date().toISOString().split('T')[0],
					value: parseFloat(json.openInterest)
				}
			];
		}

		return [];
	}

	/**
	 * Generate mock data for Hyperliquid series
	 * Creates realistic crypto perpetuals data with high volatility
	 */
	protected generateMockData(config: HyperliquidDataSourceConfig): DataPoint[] {
		const mockData: DataPoint[] = [];
		const endDate = new Date();
		const startDate = new Date();

		// Different date ranges for different data types
		if (config.dataType === 'candles') {
			// 1 year of daily candles
			startDate.setFullYear(startDate.getFullYear() - 1);
		} else {
			// 30 days for funding/open interest
			startDate.setDate(startDate.getDate() - 30);
		}

		// Different base values and volatility for different data types
		let baseValue = 1;
		let volatility = 0.03; // 3% daily volatility

		// Candles - price data
		if (config.dataType === 'candles') {
			// Different prices for different coins
			if (config.coin === 'BTC') {
				baseValue = 45000; // $45,000
				volatility = 0.03;
			} else if (config.coin === 'ETH') {
				baseValue = 2500; // $2,500
				volatility = 0.04;
			} else if (config.coin === 'SOL') {
				baseValue = 100; // $100
				volatility = 0.05;
			} else {
				baseValue = 1; // Other coins
				volatility = 0.06;
			}
		}

		// Funding history - percentage values
		else if (config.dataType === 'fundingHistory') {
			baseValue = 0.01; // 0.01% (1 basis point)
			volatility = 2; // High relative volatility for funding rates
		}

		// Open interest - contract volume
		else if (config.dataType === 'openInterest') {
			baseValue = 1000000; // 1 million contracts
			volatility = 0.1;
		}

		// Generate data points
		let currentValue = baseValue;
		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			// Random walk with high volatility
			const randomChange = (Math.random() - 0.5) * 2 * volatility;
			currentValue = currentValue * (1 + randomChange);

			// Ensure reasonable bounds
			if (config.dataType === 'fundingHistory') {
				// Funding rates between -0.1% and +0.1%
				currentValue = Math.max(-0.1, Math.min(0.1, currentValue));
			} else {
				// Non-negative for prices and open interest
				currentValue = Math.max(baseValue * 0.5, currentValue);
			}

			// Format date
			const date = currentDate.toISOString().split('T')[0];

			mockData.push({
				date,
				value: Math.round(currentValue * 100) / 100
			});

			// Advance by 1 day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return mockData;
	}
}

/**
 * Singleton instance
 */
export const hyperliquidProvider = new HyperliquidProvider();
