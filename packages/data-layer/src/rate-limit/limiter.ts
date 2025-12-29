import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * Rate limiter with sliding window and 429 handling
 */
export class RateLimiter {
  private requestTimes: number[] = [];
  private limitedUntil: number = 0;

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  /**
   * Acquire permission to make a request.
   * Waits if at capacity, throws if rate limited by server.
   */
  async acquire(): Promise<void> {
    const now = Date.now();

    // Check if rate limited from 429 response
    if (now < this.limitedUntil) {
      const waitMs = this.limitedUntil - now;
      throw new DataLayerError(
        `Rate limited for ${waitMs}ms`,
        ErrorCode.RATE_LIMITED,
        'RateLimiter'
      );
    }

    // Clean old requests outside window
    this.requestTimes = this.requestTimes.filter((t) => now - t < this.windowMs);

    // Check if at limit - wait for oldest request to expire
    if (this.requestTimes.length >= this.maxRequests) {
      const oldestRequest = this.requestTimes[0]!;
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
  markLimited(retryAfterMs: number): void {
    this.limitedUntil = Date.now() + retryAfterMs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
