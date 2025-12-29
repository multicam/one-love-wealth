/**
 * Default rate limits per provider (can be overridden)
 */
export const DEFAULT_RATE_LIMITS: Record<
  string,
  { maxRequests: number; windowMs: number }
> = {
  coingecko: { maxRequests: 10, windowMs: 60000 }, // 10/min (free tier)
  fred: { maxRequests: 120, windowMs: 60000 }, // 120/min
  yahoo: { maxRequests: 100, windowMs: 60000 }, // ~100/min
  binance: { maxRequests: 1200, windowMs: 60000 }, // 1200/min
  alphavantage: { maxRequests: 5, windowMs: 60000 }, // 5/min (free tier)
  worldbank: { maxRequests: 60, windowMs: 60000 }, // 60/min
  bls: { maxRequests: 50, windowMs: 60000 }, // 50/min
  treasury: { maxRequests: 60, windowMs: 60000 }, // 60/min
  imf: { maxRequests: 30, windowMs: 60000 }, // 30/min
  oecd: { maxRequests: 30, windowMs: 60000 }, // 30/min
  quandl: { maxRequests: 50, windowMs: 60000 }, // 50/min
  hyperliquid: { maxRequests: 100, windowMs: 60000 }, // 100/min
};
