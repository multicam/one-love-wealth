import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';
/**
 * LocalStorage cache adapter - suitable for browser environments with small data
 * Note: localStorage has a ~5MB limit per origin
 */
export declare class LocalStorageAdapter implements CacheAdapter {
    private prefix;
    constructor(prefix?: string);
    private getKey;
    private getEntry;
    get(key: string): Promise<DataSeries | null>;
    getStale(key: string): Promise<DataSeries | null>;
    set(key: string, series: DataSeries, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
}
//# sourceMappingURL=localstorage-adapter.d.ts.map