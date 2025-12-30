/**
 * SQLite storage adapter using Bun's native sqlite
 *
 * Server-side persistent storage with:
 * - Full SQL querying capabilities
 * - Efficient indexing
 * - ACID transactions
 * - Batch operations
 */

import { Database } from 'bun:sqlite';
import type { DataSeries } from '../types/series';
import type { StorageAdapter, ListOptions, StorageStats } from './storage-adapter';

interface StoredEntry {
  id: string;
  source: string;
  last_updated: number;
  data: string; // JSON
  meta: string | null; // JSON
  expires_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * SQLite storage adapter for server-side persistence
 */
export class SQLiteAdapter implements StorageAdapter {
  private db: Database;

  constructor(dbPath: string = 'data-cache.sqlite') {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  /**
   * Initialize database schema
   */
  private initSchema(): void {
    // Create series table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS series (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        data TEXT NOT NULL,
        meta TEXT,
        expires_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch() * 1000),
        updated_at INTEGER DEFAULT (unixepoch() * 1000)
      )
    `);

    // Create indices for efficient queries
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_series_source
      ON series(source)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_series_last_updated
      ON series(last_updated)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_series_updated_at
      ON series(updated_at)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_series_expires_at
      ON series(expires_at)
    `);
  }

  /**
   * Get a non-expired entry
   */
  async get(key: string): Promise<DataSeries | null> {
    const row = this.db
      .query<StoredEntry, [string]>('SELECT * FROM series WHERE id = ?')
      .get(key);

    if (!row) return null;

    // Check expiration
    if (row.expires_at && Date.now() > row.expires_at) {
      return null;
    }

    return this.rowToSeries(row);
  }

  /**
   * Get an entry even if expired (for fallback scenarios)
   */
  async getStale(key: string): Promise<DataSeries | null> {
    const row = this.db
      .query<StoredEntry, [string]>('SELECT * FROM series WHERE id = ?')
      .get(key);

    if (!row) return null;

    return this.rowToSeries(row);
  }

  /**
   * Set an entry with optional TTL
   */
  async set(key: string, series: DataSeries, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl : null;

    this.db.run(
      `
      INSERT OR REPLACE INTO series (id, source, last_updated, data, meta, expires_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        key,
        series.source,
        series.lastUpdated,
        JSON.stringify(series.data),
        series.meta ? JSON.stringify(series.meta) : null,
        expiresAt,
        Date.now(),
      ]
    );
  }

  /**
   * Delete an entry
   */
  async delete(key: string): Promise<void> {
    this.db.run('DELETE FROM series WHERE id = ?', [key]);
  }

  /**
   * Clear all entries
   */
  async clear(): Promise<void> {
    this.db.run('DELETE FROM series');
  }

  /**
   * Check if a non-expired entry exists
   */
  async has(key: string): Promise<boolean> {
    const row = this.db
      .query<{ count: number }, [string, number]>(
        'SELECT COUNT(*) as count FROM series WHERE id = ? AND (expires_at IS NULL OR expires_at > ?)'
      )
      .get(key, Date.now());

    return row ? row.count > 0 : false;
  }

  /**
   * List all series with optional filtering
   */
  async list(options: ListOptions = {}): Promise<DataSeries[]> {
    const {
      source,
      limit,
      offset = 0,
      sortBy = 'lastUpdated',
      sortDir = 'desc',
    } = options;

    let sql = 'SELECT * FROM series WHERE 1=1';
    const params: any[] = [];

    // Filter by source
    if (source) {
      sql += ' AND source = ?';
      params.push(source);
    }

    // Sort
    const sortColumn =
      sortBy === 'lastUpdated'
        ? 'last_updated'
        : sortBy === 'createdAt'
          ? 'created_at'
          : 'id';
    sql += ` ORDER BY ${sortColumn} ${sortDir.toUpperCase()}`;

    // Limit and offset
    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const rows = this.db.query<StoredEntry, any[]>(sql).all(...params);

    return rows.map((row) => this.rowToSeries(row));
  }

  /**
   * Get series updated since a timestamp
   */
  async listUpdatedSince(timestamp: number): Promise<DataSeries[]> {
    const rows = this.db
      .query<StoredEntry, [number]>(
        'SELECT * FROM series WHERE updated_at > ? ORDER BY updated_at DESC'
      )
      .all(timestamp);

    return rows.map((row) => this.rowToSeries(row));
  }

  /**
   * Get outdated series IDs based on max age
   */
  async getOutdated(maxAge: number): Promise<string[]> {
    const cutoff = Date.now() - maxAge;
    const rows = this.db
      .query<{ id: string }, [number]>(
        'SELECT id FROM series WHERE last_updated < ?'
      )
      .all(cutoff);

    return rows.map((r) => r.id);
  }

  /**
   * Get all series IDs
   */
  async getAllKeys(): Promise<string[]> {
    const rows = this.db
      .query<{ id: string }, []>('SELECT id FROM series')
      .all();

    return rows.map((r) => r.id);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    // Total series count
    const totalRow = this.db
      .query<{ count: number }, []>('SELECT COUNT(*) as count FROM series')
      .get();
    const totalSeries = totalRow?.count ?? 0;

    // Total data points (approximate by counting array length)
    let totalDataPoints = 0;
    const dataRows = this.db
      .query<{ data: string }, []>('SELECT data FROM series')
      .all();
    for (const row of dataRows) {
      try {
        const parsed = JSON.parse(row.data);
        if (Array.isArray(parsed)) {
          totalDataPoints += parsed.length;
        }
      } catch {
        // Skip invalid JSON
      }
    }

    // By source
    const sourceRows = this.db
      .query<{ source: string; count: number }, []>(
        'SELECT source, COUNT(*) as count FROM series GROUP BY source'
      )
      .all();
    const bySource: Record<string, number> = {};
    for (const row of sourceRows) {
      bySource[row.source] = row.count;
    }

    // Oldest and newest entries
    const oldestRow = this.db
      .query<{ last_updated: number }, []>(
        'SELECT MIN(last_updated) as last_updated FROM series'
      )
      .get();
    const newestRow = this.db
      .query<{ last_updated: number }, []>(
        'SELECT MAX(last_updated) as last_updated FROM series'
      )
      .get();

    return {
      totalSeries,
      totalDataPoints,
      bySource,
      oldestEntry: oldestRow?.last_updated,
      newestEntry: newestRow?.last_updated,
    };
  }

  /**
   * Batch set operation
   */
  async setMany(
    entries: Array<{ key: string; series: DataSeries; ttl?: number }>
  ): Promise<void> {
    // Use transaction for batch insert
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO series (id, source, last_updated, data, meta, expires_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((entries) => {
      for (const { key, series, ttl } of entries) {
        const expiresAt = ttl ? Date.now() + ttl : null;
        insert.run(
          key,
          series.source,
          series.lastUpdated,
          JSON.stringify(series.data),
          series.meta ? JSON.stringify(series.meta) : null,
          expiresAt,
          Date.now()
        );
      }
    });

    transaction(entries);
  }

  /**
   * Batch delete operation
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const placeholders = keys.map(() => '?').join(',');
    this.db.run(`DELETE FROM series WHERE id IN (${placeholders})`, keys);
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<number> {
    const result = this.db.run(
      'DELETE FROM series WHERE expires_at IS NOT NULL AND expires_at < ?',
      [Date.now()]
    );
    return result.changes;
  }

  /**
   * Vacuum database (reclaim space after deletes)
   */
  vacuum(): void {
    this.db.run('VACUUM');
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Convert database row to DataSeries
   */
  private rowToSeries(row: StoredEntry): DataSeries {
    return {
      id: row.id,
      source: row.source,
      lastUpdated: row.last_updated,
      data: JSON.parse(row.data),
      meta: row.meta ? JSON.parse(row.meta) : undefined,
    };
  }
}
