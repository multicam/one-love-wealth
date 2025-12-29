const DB_NAME = 'data-layer-cache';
const STORE_NAME = 'cache';
const DB_VERSION = 1;
/**
 * IndexedDB cache adapter - suitable for browser environments with large data
 * Supports much larger storage than localStorage (typically 50MB+)
 */
export class IndexedDBAdapter {
    dbName;
    dbPromise = null;
    constructor(dbName = DB_NAME) {
        this.dbName = dbName;
    }
    async getDB() {
        if (this.dbPromise)
            return this.dbPromise;
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                }
            };
        });
        return this.dbPromise;
    }
    async getEntry(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result ?? null);
        });
    }
    async get(key) {
        const entry = await this.getEntry(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            // Don't delete - keep for getStale()
            return null;
        }
        return entry.series;
    }
    async getStale(key) {
        const entry = await this.getEntry(key);
        return entry?.series ?? null;
    }
    async set(key, series, ttl) {
        const db = await this.getDB();
        const entry = {
            key,
            series,
            expiresAt: ttl ? Date.now() + ttl : undefined,
        };
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(entry);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    async delete(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    async clear() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
    async has(key) {
        const entry = await this.getEntry(key);
        if (!entry)
            return false;
        if (entry.expiresAt && Date.now() > entry.expiresAt)
            return false;
        return true;
    }
    /**
     * Close the database connection (useful for cleanup)
     */
    async close() {
        if (this.dbPromise) {
            const db = await this.dbPromise;
            db.close();
            this.dbPromise = null;
        }
    }
}
