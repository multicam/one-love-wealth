import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';
/**
 * In-memory cache adapter - suitable for short-lived processes or testing
 */
export declare class MemoryAdapter implements CacheAdapter {
    private cache;
    get(key: string): Promise<DataSeries | null>;
    getStale(key: string): Promise<DataSeries | null>;
    set(key: string, series: DataSeries, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
}
//# sourceMappingURL=memory-adapter.d.ts.map