import { test, expect, describe } from 'bun:test';
import { RateLimiter } from './limiter';
import { ErrorCode } from '../types/errors';

describe('RateLimiter', () => {
  test('allows requests within limit', async () => {
    const limiter = new RateLimiter(3, 1000);

    // Should allow 3 requests
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
  });

  test('throws when marked as rate limited', async () => {
    const limiter = new RateLimiter(10, 1000);
    limiter.markLimited(5000);

    try {
      await limiter.acquire();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect((error as Error).message).toContain('Rate limited');
      expect((error as { code: string }).code).toBe(ErrorCode.RATE_LIMITED);
    }
  });

  test('cleans up old requests outside window', async () => {
    const limiter = new RateLimiter(2, 100);

    // Make 2 requests
    await limiter.acquire();
    await limiter.acquire();

    // Wait for window to pass
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should allow more requests now
    await limiter.acquire();
    await limiter.acquire();
  });
});
