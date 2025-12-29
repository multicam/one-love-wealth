import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';
/**
 * IndexedDB cache adapter - suitable for browser environments with large data
 * Supports much larger storage than localStorage (typically 50MB+)
 */
export declare class IndexedDBAdapter implements CacheAdapter {
    private dbName;
    private dbPromise;
    constructor(dbName?: string);
    private getDB;
    private getEntry;
    get(key: string): Promise<DataSeries | null>;
    getStale(key: string): Promise<DataSeries | null>;
    set(key: string, series: DataSeries, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    /**
     * Close the database connection (useful for cleanup)
     */
    close(): Promise<void>;
}
//# sourceMappingURL=indexeddb-adapter.d.ts.map