import { frequencyToTTL } from '../cache/adapter';
import { buildCacheKey } from '../cache/key-builder';
import { DataLayerError, ErrorCode, DEFAULT_ERROR_RECOVERY, } from '../types/errors';
import { RateLimiter } from '../rate-limit/limiter';
import { DEFAULT_RATE_LIMITS } from '../rate-limit/defaults';
/**
 * Abstract base provider with caching, rate limiting, error recovery, and mock fallback
 */
export class BaseProvider {
    cacheAdapter;
    requestAdapter;
    defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
    _rateLimiter;
    constructor(cacheAdapter, requestAdapter) {
        this.cacheAdapter = cacheAdapter;
        this.requestAdapter = requestAdapter;
    }
    /**
     * Lazy-initialize rate limiter (avoids accessing abstract property in constructor)
     */
    get rateLimiter() {
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
     * Get effective TTL considering config override
     */
    getEffectiveTTL(config) {
        if (config.cache?.ttl)
            return config.cache.ttl;
        if (config.cache?.frequency)
            return frequencyToTTL(config.cache.frequency);
        return this.defaultTTL;
    }
    /**
     * Get effective error recovery config
     */
    getErrorRecovery(config) {
        return { ...DEFAULT_ERROR_RECOVERY, ...config.errorRecovery };
    }
    /**
     * Main fetch method with caching, rate limiting, and error recovery
     */
    async fetch(config) {
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
        let lastError;
        for (let attempt = 0; attempt <= recovery.retryCount; attempt++) {
            try {
                // Rate limiting
                await this.rateLimiter.acquire();
                // Build and execute request
                const requestConfig = this.buildRequestConfig(config);
                const request = await this.requestAdapter.buildRequest(requestConfig);
                // Timeout handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), recovery.timeoutMs);
                const response = await fetch(request, { signal: controller.signal });
                clearTimeout(timeoutId);
                // Handle rate limit response
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10) * 1000;
                    this.rateLimiter.markLimited(retryAfter);
                    throw new DataLayerError('Rate limited', ErrorCode.RATE_LIMITED, this.name);
                }
                if (!response.ok) {
                    let errorMessage = response.statusText;
                    try {
                        const errorBody = await response.json();
                        errorMessage = errorBody.error || errorBody.message || response.statusText;
                    }
                    catch {
                        // If JSON parsing fails, try to get text
                        try {
                            const text = await response.text();
                            if (text && text.length < 200) {
                                errorMessage = text;
                            }
                        }
                        catch {
                            // Use statusText as fallback
                        }
                    }
                    throw new DataLayerError(`${this.name} API Error: ${errorMessage}`, response.status === 404
                        ? ErrorCode.NOT_FOUND
                        : ErrorCode.NETWORK_ERROR, this.name);
                }
                const json = await response.json();
                const data = this.transformResponse(json, config);
                const series = {
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
            }
            catch (error) {
                lastError =
                    error instanceof Error ? error : new Error(String(error));
                // Retry delay (except on last attempt)
                if (attempt < recovery.retryCount) {
                    await new Promise((resolve) => setTimeout(resolve, recovery.retryDelayMs));
                }
            }
        }
        // All retries failed - apply recovery strategy
        console.warn(`${this.name} API failed after ${recovery.retryCount + 1} attempts:`, lastError);
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
            const series = {
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
