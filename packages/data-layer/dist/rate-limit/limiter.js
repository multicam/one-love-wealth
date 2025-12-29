import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Rate limiter with sliding window and 429 handling
 */
export class RateLimiter {
    maxRequests;
    windowMs;
    requestTimes = [];
    limitedUntil = 0;
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    /**
     * Acquire permission to make a request.
     * Waits if at capacity, throws if rate limited by server.
     */
    async acquire() {
        const now = Date.now();
        // Check if rate limited from 429 response
        if (now < this.limitedUntil) {
            const waitMs = this.limitedUntil - now;
            throw new DataLayerError(`Rate limited for ${waitMs}ms`, ErrorCode.RATE_LIMITED, 'RateLimiter');
        }
        // Clean old requests outside window
        this.requestTimes = this.requestTimes.filter((t) => now - t < this.windowMs);
        // Check if at limit - wait for oldest request to expire
        if (this.requestTimes.length >= this.maxRequests) {
            const oldestRequest = this.requestTimes[0];
            const waitMs = this.windowMs - (now - oldestRequest);
            await this.sleep(waitMs);
            // Clean again after waiting
            this.requestTimes = this.requestTimes.filter((t) => Date.now() - t < this.windowMs);
        }
        this.requestTimes.push(Date.now());
    }
    /**
     * Mark the limiter as rate limited (called when receiving 429)
     */
    markLimited(retryAfterMs) {
        this.limitedUntil = Date.now() + retryAfterMs;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
