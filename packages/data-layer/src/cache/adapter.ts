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
export function frequencyToTTL(frequency: CacheConfig['frequency']): number {
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
