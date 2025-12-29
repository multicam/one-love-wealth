import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Base interface for all builder configs
 */
export interface BaseBuilderConfig {
    cache?: CacheConfig;
    mockMode?: boolean;
    errorRecovery?: ErrorRecoveryConfig;
}
/**
 * Abstract base builder with common configuration methods.
 * Provides cache(), mockMode(), and errorRecovery() methods
 * that are shared across all provider builders.
 */
export declare abstract class BaseBuilder<TConfig extends BaseBuilderConfig> {
    protected config: Partial<TConfig>;
    /**
     * Configure caching behavior
     */
    cache(cache: CacheConfig): this;
    /**
     * Enable mock mode for development/testing
     */
    mockMode(enabled?: boolean): this;
    /**
     * Configure error recovery behavior
     */
    errorRecovery(config: ErrorRecoveryConfig): this;
    /**
     * Build the final configuration object
     */
    abstract build(): TConfig;
}
//# sourceMappingURL=base-builder.d.ts.map