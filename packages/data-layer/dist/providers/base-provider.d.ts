import type { CacheAdapter, CacheConfig } from '../cache/adapter';
import { type CacheKeyComponents } from '../cache/key-builder';
import type { DataPoint } from '../types/data-point';
import type { FetchResult } from '../types/series';
import type { RequestAdapter, RequestConfig } from '../types/request';
import { type ErrorRecoveryConfig } from '../types/errors';
import { RateLimiter } from '../rate-limit/limiter';
export interface ProviderConfig {
    cache?: CacheConfig;
    errorRecovery?: ErrorRecoveryConfig;
    mockMode?: boolean;
}
/**
 * Abstract base provider with caching, rate limiting, error recovery, and mock fallback
 */
export declare abstract class BaseProvider<TConfig extends ProviderConfig = ProviderConfig> {
    protected cacheAdapter: CacheAdapter;
    protected requestAdapter: RequestAdapter;
    abstract readonly name: string;
    abstract readonly cachePrefix: string;
    protected defaultTTL: number;
    private _rateLimiter?;
    constructor(cacheAdapter: CacheAdapter, requestAdapter: RequestAdapter);
    /**
     * Lazy-initialize rate limiter (avoids accessing abstract property in constructor)
     */
    protected get rateLimiter(): RateLimiter;
    /**
     * Build request config for this provider
     */
    protected abstract buildRequestConfig(config: TConfig): RequestConfig;
    /**
     * Transform API response to DataPoint array
     */
    protected abstract transformResponse(json: unknown, config: TConfig): DataPoint[];
    /**
     * Generate mock data for development/fallback
     */
    protected abstract generateMockData(config: TConfig): DataPoint[];
    /**
     * Build cache key components from config
     */
    protected abstract getCacheKeyComponents(config: TConfig): CacheKeyComponents;
    /**
     * Get effective TTL considering config override
     */
    protected getEffectiveTTL(config: TConfig): number;
    /**
     * Get effective error recovery config
     */
    protected getErrorRecovery(config: TConfig): Required<ErrorRecoveryConfig>;
    /**
     * Main fetch method with caching, rate limiting, and error recovery
     */
    fetch(config: TConfig): Promise<FetchResult>;
}
//# sourceMappingURL=base-provider.d.ts.map