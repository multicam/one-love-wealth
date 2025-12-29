/**
 * Components for building a deterministic cache key
 */
export interface CacheKeyComponents {
    provider: string;
    endpoint?: string;
    params: Record<string, string | number | boolean>;
}
/**
 * Build a deterministic cache key with sorted params
 */
export declare function buildCacheKey(components: CacheKeyComponents): string;
//# sourceMappingURL=key-builder.d.ts.map