/**
 * Abstract base builder with common configuration methods.
 * Provides cache(), mockMode(), and errorRecovery() methods
 * that are shared across all provider builders.
 */
export class BaseBuilder {
    config = {};
    /**
     * Configure caching behavior
     */
    cache(cache) {
        this.config.cache = cache;
        return this;
    }
    /**
     * Enable mock mode for development/testing
     */
    mockMode(enabled = true) {
        this.config.mockMode = enabled;
        return this;
    }
    /**
     * Configure error recovery behavior
     */
    errorRecovery(config) {
        this.config.errorRecovery = config;
        return this;
    }
}
