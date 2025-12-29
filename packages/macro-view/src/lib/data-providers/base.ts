import { db, type EconomicSeries, type DataPoint } from '../db';
import type { DataSourceConfig, CacheStrategy } from '../types/data-provider';

/**
 * Standard result from all data providers
 */
export interface FetchResult {
	series: EconomicSeries;
	fromCache: boolean;
	fetchDuration?: number;
}

/**
 * Abstract base class for all data providers
 * Handles caching, error handling, and mock fallback
 */
export abstract class DataProvider<TConfig extends DataSourceConfig = DataSourceConfig> {
	/** Provider name for logging */
	abstract readonly name: string;

	/** Cache key prefix */
	abstract readonly cachePrefix: string;

	/** Default cache TTL in milliseconds */
	protected defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours

	/**
	 * Build the API URL for this request
	 */
	protected abstract buildUrl(config: TConfig): string;

	/**
	 * Transform API response to DataPoint array
	 */
	protected abstract transformResponse(json: any, config: TConfig): DataPoint[];

	/**
	 * Generate mock data for development/fallback
	 */
	protected abstract generateMockData(config: TConfig): DataPoint[];

	/**
	 * Build cache key from config
	 */
	protected buildCacheKey(config: TConfig): string {
		return `${this.cachePrefix}:${config.id}`;
	}

	/**
	 * Get effective TTL considering config override
	 */
	protected getEffectiveTTL(config: TConfig): number {
		if (config.cache?.ttl) return config.cache.ttl;
		if (config.cache?.frequency) {
			return this.frequencyToTTL(config.cache.frequency);
		}
		return this.defaultTTL;
	}

	/**
	 * Convert frequency hint to TTL
	 */
	private frequencyToTTL(frequency: CacheStrategy['frequency']): number {
		const HOUR = 60 * 60 * 1000;
		const DAY = 24 * HOUR;

		switch (frequency) {
			case 'realtime':
				return 5 * 60 * 1000; // 5 minutes
			case 'daily':
				return DAY;
			case 'weekly':
				return 7 * DAY;
			case 'monthly':
				return 30 * DAY;
			case 'quarterly':
				return 90 * DAY;
			case 'annual':
				return 365 * DAY;
			default:
				return DAY;
		}
	}

	/**
	 * Main fetch method with caching and error handling
	 */
	async fetch(config: TConfig): Promise<FetchResult> {
		const cacheKey = this.buildCacheKey(config);
		const ttl = this.getEffectiveTTL(config);
		const startTime = performance.now();

		// Check cache (unless force refresh)
		if (!config.cache?.forceRefresh) {
			const cached = await db.getSeries(cacheKey);
			if (cached && Date.now() - cached.lastUpdated < ttl) {
				return {
					series: cached,
					fromCache: true
				};
			}
		}

		// Fetch fresh data
		try {
			const url = this.buildUrl(config);
			const response = await fetch(url);

			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				throw new Error(`${this.name} API Error: ${errorBody.error || response.statusText}`);
			}

			const json = await response.json();
			const data = this.transformResponse(json, config);

			const series: EconomicSeries = {
				id: cacheKey,
				source: this.cachePrefix as any,
				lastUpdated: Date.now(),
				data,
				meta: { ...config, fetchedAt: new Date().toISOString() }
			};

			await db.saveSeries(series);

			return {
				series,
				fromCache: false,
				fetchDuration: performance.now() - startTime
			};
		} catch (error) {
			console.warn(`${this.name} API failed, using mock data:`, error);

			const mockData = this.generateMockData(config);
			const series: EconomicSeries = {
				id: cacheKey,
				source: this.cachePrefix as any,
				lastUpdated: Date.now(),
				data: mockData,
				meta: { ...config, isMock: true }
			};

			return {
				series,
				fromCache: false,
				fetchDuration: performance.now() - startTime
			};
		}
	}
}
