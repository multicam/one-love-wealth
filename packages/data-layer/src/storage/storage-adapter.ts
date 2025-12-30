/**
 * Extended storage interface beyond basic caching
 *
 * StorageAdapter extends CacheAdapter with additional capabilities:
 * - List/query operations
 * - Metadata queries
 * - Batch operations
 * - Age-based queries
 */

import type { CacheAdapter } from '../cache/adapter';
import type { DataSeries } from '../types/series';

export interface StorageAdapter extends CacheAdapter {
  /**
   * List all series with optional filtering
   */
  list(options?: ListOptions): Promise<DataSeries[]>;

  /**
   * Get series updated since a timestamp
   */
  listUpdatedSince(timestamp: number): Promise<DataSeries[]>;

  /**
   * Get outdated series IDs based on max age
   */
  getOutdated(maxAge: number): Promise<string[]>;

  /**
   * Get all series IDs
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<StorageStats>;

  /**
   * Batch set operation
   */
  setMany(entries: Array<{ key: string; series: DataSeries; ttl?: number }>): Promise<void>;

  /**
   * Batch delete operation
   */
  deleteMany(keys: string[]): Promise<void>;
}

export interface ListOptions {
  /** Filter by source provider */
  source?: string;
  /** Maximum number of results */
  limit?: number;
  /** Skip first N results */
  offset?: number;
  /** Sort by field */
  sortBy?: 'lastUpdated' | 'createdAt' | 'id';
  /** Sort direction */
  sortDir?: 'asc' | 'desc';
}

export interface StorageStats {
  /** Total number of series */
  totalSeries: number;
  /** Total data points across all series */
  totalDataPoints: number;
  /** Series by source provider */
  bySource: Record<string, number>;
  /** Oldest entry timestamp */
  oldestEntry?: number;
  /** Newest entry timestamp */
  newestEntry?: number;
  /** Approximate storage size in bytes */
  sizeBytes?: number;
}
