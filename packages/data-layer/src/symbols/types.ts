/**
 * Symbol Registry Types
 * Defines interfaces for symbol metadata and search results
 */

export type SymbolType = 'stock' | 'etf' | 'index' | 'crypto' | 'forex';

export type SymbolProvider = 'yahoo' | 'coingecko';

/**
 * Symbol metadata for curated registry
 */
export interface SymbolInfo {
  /** Trading symbol (e.g., 'AAPL', 'BTC-USD', '^GSPC') */
  symbol: string;
  /** Full name of the instrument */
  name: string;
  /** Instrument type */
  type: SymbolType;
  /** Preferred data provider */
  provider: SymbolProvider;
  /** Exchange code (optional) */
  exchange?: string;
  /** Popularity ranking 1-10 for sorting (10 = most popular) */
  popularity?: number;
}

/**
 * External API search result (before conversion to SymbolInfo)
 */
export interface ExternalSymbolResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
  source: 'yahoo' | 'coingecko';
}

/**
 * Symbol search options
 */
export interface SymbolSearchOptions {
  /** Include external API searches (default: true) */
  includeExternal?: boolean;
  /** Providers to search (default: ['yahoo']) */
  providers?: SymbolProvider[];
  /** Maximum results to return (default: 20) */
  limit?: number;
}
