/**
 * Symbol Search Module
 * Unified interface for searching symbols across curated registry and external APIs
 */

export * from './types.js';
export * from './registry.js';
export * from './external-search.js';

import type { SymbolInfo, SymbolSearchOptions, SymbolType } from './types.js';
import { searchCuratedSymbols } from './registry.js';
import { searchYahooFinance, searchCoinGecko } from './external-search.js';

/**
 * Unified symbol search (Hybrid: Curated + External)
 *
 * Search strategy:
 * 1. Always search curated list first (instant results)
 * 2. If includeExternal=true and query length >= 2, also search external APIs in parallel
 * 3. Merge results, deduplicate, and sort by relevance
 *
 * @param query - Search query (case-insensitive)
 * @param options - Search options
 * @returns Promise resolving to array of matching symbols
 *
 * @example
 * // Fast: curated only
 * await searchSymbols('AAPL', { includeExternal: false })
 *
 * // Comprehensive: curated + external
 * await searchSymbols('tesla', { includeExternal: true, providers: ['yahoo'] })
 *
 * // Multi-provider search
 * await searchSymbols('bitcoin', { providers: ['yahoo', 'coingecko'] })
 */
export async function searchSymbols(
  query: string,
  options: SymbolSearchOptions = {}
): Promise<SymbolInfo[]> {
  const { includeExternal = true, providers = ['yahoo'], limit = 20 } = options;

  // Always search curated list first (instant)
  const curatedResults = searchCuratedSymbols(query, limit);

  // If query is too short or external disabled, return curated only
  if (!includeExternal || query.length < 2) {
    return curatedResults;
  }

  // Search external APIs in parallel
  const externalPromises: Promise<Array<{ symbol: string; name: string; type: string; source: string }>>[] = [];

  if (providers.includes('yahoo')) {
    externalPromises.push(
      searchYahooFinance(query).catch((err) => {
        console.warn('Yahoo Finance search failed:', err);
        return [];
      })
    );
  }

  if (providers.includes('coingecko')) {
    externalPromises.push(
      searchCoinGecko(query).catch((err) => {
        console.warn('CoinGecko search failed:', err);
        return [];
      })
    );
  }

  // Wait for all external searches to complete
  const externalResultArrays = await Promise.all(externalPromises);
  const externalResults = externalResultArrays.flat();

  // Deduplicate: filter out external results that are already in curated
  const curatedSymbols = new Set(curatedResults.map((s) => s.symbol.toUpperCase()));
  const uniqueExternal = externalResults.filter(
    (s) => !curatedSymbols.has(s.symbol.toUpperCase())
  );

  // Convert external results to SymbolInfo format
  const externalConverted: SymbolInfo[] = uniqueExternal.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    type: s.type as SymbolType,
    provider: s.source === 'coingecko' ? 'coingecko' : 'yahoo',
    popularity: 0, // External results get lower priority than curated
  }));

  // Merge: curated first (higher quality/relevance), then external
  const merged = [...curatedResults, ...externalConverted];

  // Limit total results
  return merged.slice(0, limit);
}

/**
 * Quick symbol validation
 * Checks if a symbol exists in curated list or can be found via external search
 *
 * @param symbol - Symbol to validate
 * @returns Promise resolving to true if symbol exists
 *
 * @example
 * await validateSymbol('AAPL') // true
 * await validateSymbol('INVALID') // false
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  const results = await searchSymbols(symbol, {
    includeExternal: true,
    limit: 1,
  });

  // Exact match (case-insensitive)
  return results.some((r) => r.symbol.toUpperCase() === symbol.toUpperCase());
}
