import type { DataSeries } from '../types/series';
/**
 * Cache adapter interface - implement for different storage backends
 */
export interface CacheAdapter {
    /** Get a non-expired entry */
    get(key: string): Promise<DataSeries | null>;
    /** Get an entry even if expired (for fallback scenarios) */
    getStale(key: string): Promise<DataSeries | null>;
    /** Set an entry with optional TTL in milliseconds */
    set(key: string, series: DataSeries, ttl?: number): Promise<void>;
    /** Delete an entry */
    delete(key: string): Promise<void>;
    /** Clear all entries */
    clear(): Promise<void>;
    /** Check if a non-expired entry exists */
    has(key: string): Promise<boolean>;
}
/**
 * Cache configuration
 */
export interface CacheConfig {
    /** TTL in milliseconds */
    ttl?: number;
    /** Frequency hint for automatic TTL calculation */
    frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    /** Force refresh, bypassing cache */
    forceRefresh?: boolean;
}
/**
 * Convert frequency hint to TTL milliseconds
 */
export declare function frequencyToTTL(frequency: CacheConfig['frequency']): number;
//# sourceMappingURL=adapter.d.ts.map