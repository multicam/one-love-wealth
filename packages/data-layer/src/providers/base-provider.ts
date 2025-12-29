import type { CacheAdapter, CacheConfig } from '../cache/adapter';
import { frequencyToTTL } from '../cache/adapter';
import { buildCacheKey, type CacheKeyComponents } from '../cache/key-builder';
import type { DataPoint } from '../types/data-point';
import type { DataSeries, FetchResult } from '../types/series';
import type { RequestAdapter, RequestConfig } from '../types/request';
import {
  DataLayerError,
  ErrorCode,
  DEFAULT_ERROR_RECOVERY,
  type ErrorRecoveryConfig,
} from '../types/errors';
import { RateLimiter } from '../rate-limit/limiter';
import { DEFAULT_RATE_LIMITS } from '../rate-limit/defaults';

export interface ProviderConfig {
  cache?: CacheConfig;
  errorRecovery?: ErrorRecoveryConfig;
  mockMode?: boolean;
}

/**
 * Abstract base provider with caching, rate limiting, error recovery, and mock fallback
 */
export abstract class BaseProvider<
  TConfig extends ProviderConfig = ProviderConfig,
> {
  abstract readonly name: string;
  abstract readonly cachePrefix: string;

  protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private _rateLimiter?: RateLimiter;

  constructor(
    protected cacheAdapter: CacheAdapter,
    protected requestAdapter: RequestAdapter
  ) {}

  /**
   * Lazy-initialize rate limiter (avoids accessing abstract property in constructor)
   */
  protected get rateLimiter(): RateLimiter {
    if (!this._rateLimiter) {
      const key = this.cachePrefix.toLowerCase();
      const limits = DEFAULT_RATE_LIMITS[key] || {
        maxRequests: 60,
        windowMs: 60000,
      };
      this._rateLimiter = new RateLimiter(limits.maxRequests, limits.windowMs);
    }
    return this._rateLimiter;
  }

  /**
   * Build request config for this provider
   */
  protected abstract buildRequestConfig(config: TConfig): RequestConfig;

  /**
   * Transform API response to DataPoint array
   */
  protected abstract transformResponse(
    json: unknown,
    config: TConfig
  ): DataPoint[];

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
  protected getEffectiveTTL(config: TConfig): number {
    if (config.cache?.ttl) return config.cache.ttl;
    if (config.cache?.frequency) return frequencyToTTL(config.cache.frequency);
    return this.defaultTTL;
  }

  /**
   * Get effective error recovery config
   */
  protected getErrorRecovery(config: TConfig): Required<ErrorRecoveryConfig> {
    return { ...DEFAULT_ERROR_RECOVERY, ...config.errorRecovery };
  }

  /**
   * Main fetch method with caching, rate limiting, and error recovery
   */
  async fetch(config: TConfig): Promise<FetchResult> {
    const cacheKey = buildCacheKey(this.getCacheKeyComponents(config));
    const ttl = this.getEffectiveTTL(config);
    const recovery = this.getErrorRecovery(config);
    const startTime = performance.now();

    // Mock mode
    if (config.mockMode) {
      return {
        series: {
          id: cacheKey,
          source: this.cachePrefix,
          lastUpdated: Date.now(),
          data: this.generateMockData(config),
          meta: { isMock: true },
        },
        fromCache: false,
        isMock: true,
        fetchDuration: performance.now() - startTime,
      };
    }

    // Check cache (unless force refresh)
    if (!config.cache?.forceRefresh) {
      const cached = await this.cacheAdapter.get(cacheKey);
      if (cached) {
        return {
          series: cached,
          fromCache: true,
        };
      }
    }

    // Fetch fresh data with retries
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= recovery.retryCount; attempt++) {
      try {
        // Rate limiting
        await this.rateLimiter.acquire();

        // Build and execute request
        const requestConfig = this.buildRequestConfig(config);
        const request = await this.requestAdapter.buildRequest(requestConfig);

        // Timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          recovery.timeoutMs
        );

        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);

        // Handle rate limit response
        if (response.status === 429) {
          const retryAfter =
            parseInt(response.headers.get('Retry-After') || '60', 10) * 1000;
          this.rateLimiter.markLimited(retryAfter);
          throw new DataLayerError(
            'Rate limited',
            ErrorCode.RATE_LIMITED,
            this.name
          );
        }

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new DataLayerError(
            `${this.name} API Error: ${errorBody.error || response.statusText}`,
            response.status === 404
              ? ErrorCode.NOT_FOUND
              : ErrorCode.NETWORK_ERROR,
            this.name
          );
        }

        const json = await response.json();
        const data = this.transformResponse(json, config);

        const series: DataSeries = {
          id: cacheKey,
          source: this.cachePrefix,
          lastUpdated: Date.now(),
          data,
          meta: { fetchedAt: new Date().toISOString() },
        };

        await this.cacheAdapter.set(cacheKey, series, ttl);

        return {
          series,
          fromCache: false,
          fetchDuration: performance.now() - startTime,
        };
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        // Retry delay (except on last attempt)
        if (attempt < recovery.retryCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, recovery.retryDelayMs)
          );
        }
      }
    }

    // All retries failed - apply recovery strategy
    console.warn(
      `${this.name} API failed after ${recovery.retryCount + 1} attempts:`,
      lastError
    );

    // Try stale cache first
    if (recovery.fallbackToStaleCache) {
      const stale = await this.cacheAdapter.getStale(cacheKey);
      if (stale) {
        return {
          series: stale,
          fromCache: true,
          fromStaleCache: true,
          fetchDuration: performance.now() - startTime,
        };
      }
    }

    // Throw if configured
    if (recovery.throwOnError) {
      throw lastError;
    }

    // Fall back to mock data
    if (recovery.fallbackToMock) {
      const mockData = this.generateMockData(config);
      const series: DataSeries = {
        id: cacheKey,
        source: this.cachePrefix,
        lastUpdated: Date.now(),
        data: mockData,
        meta: { isMock: true, error: String(lastError) },
      };

      return {
        series,
        fromCache: false,
        isMock: true,
        fetchDuration: performance.now() - startTime,
      };
    }

    // Last resort - throw
    throw lastError;
  }
}
