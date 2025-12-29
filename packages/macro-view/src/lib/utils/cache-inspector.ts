import { db } from '../db';
import type { EconomicSeries } from '../db';

/**
 * Cache inspector utility for debugging and monitoring
 */

export interface CacheEntry {
  id: string;
  source: string;
  lastUpdated: number;
  age: number;
  dataPoints: number;
  sizeKB: number;
}

/**
 * Get all cached series with metadata
 *
 * @returns Array of cache entries
 */
export async function getAllCachedSeries(): Promise<CacheEntry[]> {
  try {
    const allSeries = await db.series.toArray();

    return allSeries.map((series: EconomicSeries) => ({
      id: series.id,
      source: series.source,
      lastUpdated: series.lastUpdated,
      age: Date.now() - series.lastUpdated,
      dataPoints: series.data.length,
      sizeKB: estimateSizeKB(series)
    }));
  } catch (error) {
    console.error('Error reading cache:', error);
    return [];
  }
}

/**
 * Get cache statistics
 *
 * @returns Cache stats object
 */
export async function getCacheStats() {
  const entries = await getAllCachedSeries();

  return {
    totalEntries: entries.length,
    totalDataPoints: entries.reduce((sum, e) => sum + e.dataPoints, 0),
    totalSizeKB: entries.reduce((sum, e) => sum + e.sizeKB, 0),
    oldestEntry: entries.length > 0
      ? Math.max(...entries.map(e => e.age))
      : 0,
    bySource: entries.reduce((acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Clear cache for specific series
 *
 * @param seriesId - Series ID to clear
 */
export async function clearCacheSeries(seriesId: string): Promise<void> {
  try {
    await db.series.delete(seriesId);
  } catch (error) {
    console.error(`Error clearing cache for ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    await db.series.clear();
  } catch (error) {
    console.error('Error clearing all cache:', error);
    throw error;
  }
}

/**
 * Clear cache entries older than specified age
 *
 * @param maxAgeMs - Maximum age in milliseconds
 * @returns Number of entries cleared
 */
export async function clearOldCache(maxAgeMs: number): Promise<number> {
  try {
    const allSeries = await db.series.toArray();
    const now = Date.now();
    let cleared = 0;

    for (const series of allSeries) {
      if (now - series.lastUpdated > maxAgeMs) {
        await db.series.delete(series.id);
        cleared++;
      }
    }

    return cleared;
  } catch (error) {
    console.error('Error clearing old cache:', error);
    return 0;
  }
}

/**
 * Estimate size of cached series in KB
 *
 * @param series - Economic series
 * @returns Estimated size in KB
 */
function estimateSizeKB(series: EconomicSeries): number {
  // Rough estimate: JSON.stringify size / 1024
  try {
    const json = JSON.stringify(series);
    return Math.round(json.length / 1024 * 10) / 10; // Round to 1 decimal
  } catch {
    return 0;
  }
}

/**
 * Format age in human-readable format
 *
 * @param ageMs - Age in milliseconds
 * @returns Human-readable string
 */
export function formatAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
