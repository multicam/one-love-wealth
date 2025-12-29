/**
 * In-memory cache adapter - suitable for short-lived processes or testing
 */
export class MemoryAdapter {
    cache = new Map();
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            // Don't delete - keep for getStale()
            return null;
        }
        return entry.series;
    }
    async getStale(key) {
        const entry = this.cache.get(key);
        return entry?.series ?? null;
    }
    async set(key, series, ttl) {
        this.cache.set(key, {
            series,
            expiresAt: ttl ? Date.now() + ttl : undefined,
        });
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
    }
    async has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt && Date.now() > entry.expiresAt)
            return false;
        return true;
    }
}
