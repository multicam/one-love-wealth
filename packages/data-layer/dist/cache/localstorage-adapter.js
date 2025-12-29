/**
 * LocalStorage cache adapter - suitable for browser environments with small data
 * Note: localStorage has a ~5MB limit per origin
 */
export class LocalStorageAdapter {
    prefix;
    constructor(prefix = 'data-layer:') {
        this.prefix = prefix;
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    getEntry(key) {
        try {
            const raw = localStorage.getItem(this.getKey(key));
            if (!raw)
                return null;
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async get(key) {
        const entry = this.getEntry(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            // Don't delete - keep for getStale()
            return null;
        }
        return entry.series;
    }
    async getStale(key) {
        const entry = this.getEntry(key);
        return entry?.series ?? null;
    }
    async set(key, series, ttl) {
        const entry = {
            series,
            expiresAt: ttl ? Date.now() + ttl : undefined,
        };
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(entry));
        }
        catch (e) {
            // localStorage might be full or disabled
            console.warn('LocalStorageAdapter: Failed to write cache entry', e);
        }
    }
    async delete(key) {
        localStorage.removeItem(this.getKey(key));
    }
    async clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
    async has(key) {
        const entry = this.getEntry(key);
        if (!entry)
            return false;
        if (entry.expiresAt && Date.now() > entry.expiresAt)
            return false;
        return true;
    }
}
