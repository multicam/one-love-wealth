/**
 * External Symbol Search
 * Integrates with Yahoo Finance and CoinGecko symbol search APIs
 */

import type { ExternalSymbolResult } from './types.js';

/**
 * Search Yahoo Finance for symbols
 * Uses the Yahoo Finance search/lookup endpoint
 *
 * @param query - Search query
 * @returns Array of matching symbols from Yahoo Finance
 *
 * @example
 * await searchYahooFinance('tesla') // Returns TSLA and related symbols
 */
export async function searchYahooFinance(query: string): Promise<ExternalSymbolResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  try {
    // Yahoo Finance search endpoint
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      query
    )}&quotesCount=15&newsCount=0&enableFuzzyQuery=false`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Yahoo Finance search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.quotes || !Array.isArray(data.quotes)) {
      return [];
    }

    // Transform Yahoo response to our format
    return data.quotes
      .filter((q: any) => q.symbol && q.quoteType) // Ensure we have required fields
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        type: mapYahooQuoteType(q.quoteType),
        exchange: q.exchange,
        source: 'yahoo' as const,
      }));
  } catch (error) {
    console.error('Yahoo Finance search error:', error);
    return [];
  }
}

/**
 * Search CoinGecko for cryptocurrency symbols
 * Uses the CoinGecko search endpoint
 *
 * @param query - Search query
 * @returns Array of matching crypto symbols from CoinGecko
 *
 * @example
 * await searchCoinGecko('bitcoin') // Returns BTC and Bitcoin-related coins
 */
export async function searchCoinGecko(query: string): Promise<ExternalSymbolResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // CoinGecko search endpoint (no API key required for search)
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`CoinGecko search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.coins || !Array.isArray(data.coins)) {
      return [];
    }

    // Transform CoinGecko response to our format
    // Take top 10 results
    return data.coins.slice(0, 10).map((c: any) => ({
      symbol: c.symbol ? c.symbol.toUpperCase() : c.id.toUpperCase(),
      name: c.name,
      type: 'crypto',
      exchange: undefined,
      source: 'coingecko' as const,
    }));
  } catch (error) {
    console.error('CoinGecko search error:', error);
    return [];
  }
}

/**
 * Map Yahoo Finance quote types to our simplified types
 */
function mapYahooQuoteType(quoteType: string): string {
  const type = quoteType.toLowerCase();

  switch (type) {
    case 'equity':
      return 'stock';
    case 'etf':
      return 'etf';
    case 'index':
      return 'index';
    case 'cryptocurrency':
      return 'crypto';
    case 'currency':
      return 'forex';
    case 'mutualfund':
      return 'etf'; // Treat mutual funds as ETFs for simplicity
    default:
      return 'stock'; // Default to stock
  }
}
