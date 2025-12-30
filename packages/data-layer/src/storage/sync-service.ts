/**
 * Sync service for bidirectional synchronization between client and server storage
 *
 * Handles:
 * - Pull from server to client (download updates)
 * - Push from client to server (upload updates)
 * - Bidirectional sync with conflict resolution
 * - Force refresh of specific series
 */

import type { CacheAdapter } from '../cache/adapter';
import type { StorageAdapter } from './storage-adapter';
import type { DataSeries } from '../types/series';
import type { BaseProvider } from '../providers/base-provider';

export interface SyncOptions {
  /** Sync direction */
  direction?: 'pull' | 'push' | 'bidirectional';
  /** How to resolve conflicts */
  conflictResolution?: 'server-wins' | 'client-wins' | 'newest-wins';
  /** Only sync specific sources */
  sources?: string[];
  /** Sync only series updated after this timestamp */
  since?: number;
}

export interface SyncResult {
  /** Number of series pulled from server */
  pulled: number;
  /** Number of series pushed to server */
  pushed: number;
  /** Number of conflicts resolved */
  conflicts: number;
  /** Errors encountered */
  errors: string[];
  /** Duration in milliseconds */
  duration: number;
}

export interface RefreshOptions {
  /** Series IDs to refresh */
  seriesIds: string[];
  /** Providers to use for refresh */
  providers?: Map<string, BaseProvider>;
  /** Force refresh even if cached */
  forceRefresh?: boolean;
}

export interface RefreshResult {
  /** Number of series successfully refreshed */
  refreshed: number;
  /** Series IDs that failed to refresh */
  failed: string[];
  /** Errors by series ID */
  errors: Record<string, string>;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * Sync service for managing data synchronization
 */
export class SyncService {
  constructor(
    private client: CacheAdapter, // IndexedDB or other client storage
    private server: StorageAdapter // SQLite or other server storage
  ) {}

  /**
   * Synchronize data between client and server
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = performance.now();
    const {
      direction = 'bidirectional',
      conflictResolution = 'newest-wins',
      sources,
      since,
    } = options;

    const result: SyncResult = {
      pulled: 0,
      pushed: 0,
      conflicts: 0,
      errors: [],
      duration: 0,
    };

    try {
      // Pull from server to client
      if (direction === 'pull' || direction === 'bidirectional') {
        const pullResult = await this.pullFromServer({
          conflictResolution,
          sources,
          since,
        });
        result.pulled = pullResult.pulled;
        result.conflicts += pullResult.conflicts;
        result.errors.push(...pullResult.errors);
      }

      // Push from client to server
      if (direction === 'push' || direction === 'bidirectional') {
        const pushResult = await this.pushToServer({
          conflictResolution,
          sources,
          since,
        });
        result.pushed = pushResult.pushed;
        result.conflicts += pushResult.conflicts;
        result.errors.push(...pushResult.errors);
      }
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error)
      );
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Pull data from server to client
   */
  private async pullFromServer(
    options: Omit<SyncOptions, 'direction'>
  ): Promise<Omit<SyncResult, 'duration'>> {
    const result = {
      pulled: 0,
      pushed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      // Get server series
      let serverSeries: DataSeries[];
      if (options.since) {
        serverSeries = await this.server.listUpdatedSince(options.since);
      } else {
        serverSeries = await this.server.list({
          source: options.sources ? options.sources[0] : undefined,
        });
      }

      // Filter by sources if specified
      const filteredSeries = options.sources
        ? serverSeries.filter((s) => options.sources!.includes(s.source))
        : serverSeries;

      // Sync each series
      for (const series of filteredSeries) {
        try {
          const clientSeries = await this.client.get(series.id);

          if (!clientSeries) {
            // No client version, just copy
            await this.client.set(series.id, series);
            result.pulled++;
          } else if (
            this.shouldOverwrite(
              clientSeries,
              series,
              options.conflictResolution!
            )
          ) {
            // Conflict: resolve and overwrite
            await this.client.set(series.id, series);
            result.pulled++;
            result.conflicts++;
          }
        } catch (error) {
          result.errors.push(
            `Failed to pull ${series.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      result.errors.push(
        `Pull failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return result;
  }

  /**
   * Push data from client to server
   */
  private async pushToServer(
    options: Omit<SyncOptions, 'direction'>
  ): Promise<Omit<SyncResult, 'duration'>> {
    const result = {
      pulled: 0,
      pushed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      // Get all keys from server to know what to check on client
      // Note: This requires iterating client storage, which IndexedDB doesn't expose easily
      // For now, we'll rely on the server having the authoritative list

      const serverKeys = await this.server.getAllKeys();

      // Check each key on client
      for (const key of serverKeys) {
        try {
          const clientSeries = await this.client.get(key);
          if (!clientSeries) continue;

          // Filter by sources if specified
          if (options.sources && !options.sources.includes(clientSeries.source)) {
            continue;
          }

          // Filter by since if specified
          if (options.since && clientSeries.lastUpdated <= options.since) {
            continue;
          }

          const serverSeries = await this.server.get(key);

          if (!serverSeries) {
            // No server version, just copy
            await this.server.set(key, clientSeries);
            result.pushed++;
          } else if (
            this.shouldOverwrite(
              serverSeries,
              clientSeries,
              options.conflictResolution!
            )
          ) {
            // Conflict: resolve and overwrite
            await this.server.set(key, clientSeries);
            result.pushed++;
            result.conflicts++;
          }
        } catch (error) {
          result.errors.push(
            `Failed to push ${key}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      result.errors.push(
        `Push failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return result;
  }

  /**
   * Determine if incoming series should overwrite existing
   */
  private shouldOverwrite(
    existing: DataSeries,
    incoming: DataSeries,
    strategy: string
  ): boolean {
    switch (strategy) {
      case 'newest-wins':
        return incoming.lastUpdated > existing.lastUpdated;
      case 'server-wins':
        // Always overwrite with incoming (server data in pull scenarios)
        return true;
      case 'client-wins':
        return false; // Never overwrite
      default:
        return incoming.lastUpdated > existing.lastUpdated;
    }
  }

  /**
   * Force refresh specific series from their providers
   *
   * Note: This requires access to providers, which is typically handled
   * at the application layer. This method provides the interface.
   */
  async refreshSeries(
    options: RefreshOptions,
    fetchCallback: (seriesId: string) => Promise<DataSeries>
  ): Promise<RefreshResult> {
    const startTime = performance.now();
    const result: RefreshResult = {
      refreshed: 0,
      failed: [],
      errors: {},
      duration: 0,
    };

    for (const seriesId of options.seriesIds) {
      try {
        // Fetch fresh data using callback
        const freshSeries = await fetchCallback(seriesId);

        // Update both client and server
        await Promise.all([
          this.client.set(seriesId, freshSeries),
          this.server.set(seriesId, freshSeries),
        ]);

        result.refreshed++;
      } catch (error) {
        result.failed.push(seriesId);
        result.errors[seriesId] =
          error instanceof Error ? error.message : String(error);
      }
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Get sync status (what needs syncing)
   */
  async getSyncStatus(): Promise<{
    clientOnly: string[];
    serverOnly: string[];
    conflicts: Array<{ id: string; clientUpdated: number; serverUpdated: number }>;
  }> {
    const serverKeys = await this.server.getAllKeys();
    const clientOnlyKeys: string[] = [];
    const serverOnlyKeys = new Set(serverKeys);
    const conflicts: Array<{
      id: string;
      clientUpdated: number;
      serverUpdated: number;
    }> = [];

    // Check each server key against client
    for (const key of serverKeys) {
      const clientSeries = await this.client.get(key);
      if (!clientSeries) {
        // Server has it, client doesn't
        continue; // It's in serverOnlyKeys already
      }

      // Both have it - check for conflicts
      serverOnlyKeys.delete(key);
      const serverSeries = await this.server.get(key);
      if (serverSeries && clientSeries.lastUpdated !== serverSeries.lastUpdated) {
        conflicts.push({
          id: key,
          clientUpdated: clientSeries.lastUpdated,
          serverUpdated: serverSeries.lastUpdated,
        });
      }
    }

    // Note: Can't easily enumerate client-only keys without full scan
    // This would require IndexedDB to expose key enumeration

    return {
      clientOnly: clientOnlyKeys,
      serverOnly: Array.from(serverOnlyKeys),
      conflicts,
    };
  }
}
