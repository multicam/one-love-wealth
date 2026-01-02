/**
 * Curated Symbol Registry
 * Provides instant search over a curated list of popular symbols
 */

import type { SymbolInfo } from './types.js';
import symbolsData from './symbols.json';

/**
 * Curated symbol list (loaded from JSON)
 */
export const CURATED_SYMBOLS: SymbolInfo[] = symbolsData as SymbolInfo[];

/**
 * Search curated symbols by query string
 * Searches both symbol codes and names
 * Results are sorted by relevance (exact match > popularity > alphabetical)
 *
 * @param query - Search query (case-insensitive)
 * @param limit - Maximum results to return (default: 20)
 * @returns Array of matching symbols, sorted by relevance
 *
 * @example
 * searchCuratedSymbols('AAPL') // Returns Apple first
 * searchCuratedSymbols('apple') // Also returns Apple
 * searchCuratedSymbols('S&P') // Returns S&P 500 indices
 */
export function searchCuratedSymbols(query: string, limit = 20): SymbolInfo[] {
  if (!query || query.length === 0) {
    return [];
  }

  const q = query.toLowerCase().trim();

  // Filter matching symbols
  const matches = CURATED_SYMBOLS.filter((s) => {
    const symbolMatch = s.symbol.toLowerCase().includes(q);
    const nameMatch = s.name.toLowerCase().includes(q);
    return symbolMatch || nameMatch;
  });

  // Sort by relevance
  const sorted = matches.sort((a, b) => {
    const aSymbolLower = a.symbol.toLowerCase();
    const bSymbolLower = b.symbol.toLowerCase();

    // Exact symbol match comes first
    if (aSymbolLower === q) return -1;
    if (bSymbolLower === q) return 1;

    // Symbol starts with query
    if (aSymbolLower.startsWith(q) && !bSymbolLower.startsWith(q)) return -1;
    if (bSymbolLower.startsWith(q) && !aSymbolLower.startsWith(q)) return 1;

    // Popularity (higher is better)
    const popDiff = (b.popularity || 0) - (a.popularity || 0);
    if (popDiff !== 0) return popDiff;

    // Alphabetical by symbol
    return aSymbolLower.localeCompare(bSymbolLower);
  });

  return sorted.slice(0, limit);
}

/**
 * Get symbol metadata by exact symbol code
 *
 * @param symbol - Symbol code (case-insensitive)
 * @returns Symbol metadata or null if not found
 *
 * @example
 * getSymbolInfo('AAPL') // Returns Apple metadata
 * getSymbolInfo('aapl') // Also returns Apple (case-insensitive)
 */
export function getSymbolInfo(symbol: string): SymbolInfo | null {
  const symbolUpper = symbol.toUpperCase();
  return CURATED_SYMBOLS.find((s) => s.symbol.toUpperCase() === symbolUpper) || null;
}

/**
 * Get all symbols of a specific type
 *
 * @param type - Symbol type to filter by
 * @returns Array of symbols matching the type
 *
 * @example
 * getSymbolsByType('etf') // Returns all ETFs
 * getSymbolsByType('crypto') // Returns all crypto symbols
 */
export function getSymbolsByType(type: SymbolInfo['type']): SymbolInfo[] {
  return CURATED_SYMBOLS.filter((s) => s.type === type);
}

/**
 * Get all available symbol types
 *
 * @returns Array of unique symbol types
 */
export function getAvailableTypes(): SymbolInfo['type'][] {
  const types = new Set(CURATED_SYMBOLS.map((s) => s.type));
  return Array.from(types);
}

/**
 * Get symbols by provider
 *
 * @param provider - Provider to filter by
 * @returns Array of symbols for that provider
 */
export function getSymbolsByProvider(provider: SymbolInfo['provider']): SymbolInfo[] {
  return CURATED_SYMBOLS.filter((s) => s.provider === provider);
}

/**
 * Get top N most popular symbols
 *
 * @param limit - Number of symbols to return (default: 10)
 * @param type - Optional type filter
 * @returns Array of most popular symbols
 *
 * @example
 * getPopularSymbols(10) // Top 10 across all types
 * getPopularSymbols(5, 'stock') // Top 5 stocks
 */
export function getPopularSymbols(limit = 10, type?: SymbolInfo['type']): SymbolInfo[] {
  let symbols = type ? getSymbolsByType(type) : CURATED_SYMBOLS;

  return symbols
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
}
