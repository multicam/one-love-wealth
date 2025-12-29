/**
 * Rate limiter with sliding window and 429 handling
 */
export declare class RateLimiter {
    private maxRequests;
    private windowMs;
    private requestTimes;
    private limitedUntil;
    constructor(maxRequests: number, windowMs: number);
    /**
     * Acquire permission to make a request.
     * Waits if at capacity, throws if rate limited by server.
     */
    acquire(): Promise<void>;
    /**
     * Mark the limiter as rate limited (called when receiving 429)
     */
    markLimited(retryAfterMs: number): void;
    private sleep;
}
//# sourceMappingURL=limiter.d.ts.map