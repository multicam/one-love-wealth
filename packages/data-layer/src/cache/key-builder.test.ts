import { test, expect, describe } from 'bun:test';
import { buildCacheKey } from './key-builder';

describe('buildCacheKey', () => {
  test('builds key with provider only', () => {
    const key = buildCacheKey({ provider: 'COINGECKO', params: {} });
    expect(key).toBe('COINGECKO');
  });

  test('builds key with provider and endpoint', () => {
    const key = buildCacheKey({
      provider: 'COINGECKO',
      endpoint: 'market_chart',
      params: {},
    });
    expect(key).toBe('COINGECKO:market_chart');
  });

  test('builds key with sorted params', () => {
    const key = buildCacheKey({
      provider: 'COINGECKO',
      params: { days: 30, coinId: 'bitcoin', vsCurrency: 'usd' },
    });
    expect(key).toBe('COINGECKO:coinId=bitcoin&days=30&vsCurrency=usd');
  });

  test('builds full key with provider, endpoint, and params', () => {
    const key = buildCacheKey({
      provider: 'YAHOO',
      endpoint: 'chart',
      params: { symbol: 'SPY', period: '1y' },
    });
    expect(key).toBe('YAHOO:chart:period=1y&symbol=SPY');
  });

  test('produces same key regardless of param order', () => {
    const key1 = buildCacheKey({
      provider: 'TEST',
      params: { a: 1, b: 2, c: 3 },
    });
    const key2 = buildCacheKey({
      provider: 'TEST',
      params: { c: 3, a: 1, b: 2 },
    });
    expect(key1).toBe(key2);
  });

  test('handles boolean params', () => {
    const key = buildCacheKey({
      provider: 'TEST',
      params: { includeMarketCap: true, include24hrVol: false },
    });
    expect(key).toBe('TEST:include24hrVol=false&includeMarketCap=true');
  });
});
