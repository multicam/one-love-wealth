/**
 * Configuration for building an API request
 */
export interface RequestConfig {
  provider: string;
  endpoint: string;
  params: Record<string, string>;
  method?: 'GET' | 'POST';
  body?: unknown;
}

/**
 * Adapter for building requests (supports proxy or direct APIs)
 */
export interface RequestAdapter {
  buildRequest(config: RequestConfig): Request | Promise<Request>;
}

/**
 * Proxy-based adapter (routes through /api/proxy/*)
 */
export class ProxyRequestAdapter implements RequestAdapter {
  constructor(private proxyBase: string) {}

  buildRequest(config: RequestConfig): Request {
    const params = new URLSearchParams(config.params);
    const url = `${this.proxyBase}/${config.provider}?${params}`;
    return new Request(url, { method: config.method || 'GET' });
  }
}

/**
 * API provider configuration for direct requests
 */
export interface ProviderApiConfig {
  baseUrl: string;
  authType?: 'query' | 'header' | 'none';
  authParam?: string;  // Query param name or header name for API key
  apiKey?: string;
  headers?: Record<string, string>;
}

/**
 * Default API configurations for all supported providers
 * 
 * Note: Base URLs should NOT include trailing paths that providers add via `endpoint`.
 * Each provider's `buildRequestConfig` specifies the endpoint path.
 */
export const DEFAULT_PROVIDER_CONFIGS: Record<string, ProviderApiConfig> = {
  fred: {
    // FRED API: https://api.stlouisfed.org/fred/series/observations?series_id=X&api_key=Y&file_type=json
    baseUrl: 'https://api.stlouisfed.org/fred',
    authType: 'query',
    authParam: 'api_key',
    headers: { 'Accept': 'application/json' },
  },
  coingecko: {
    // CoinGecko API: https://api.coingecko.com/api/v3/coins/{coinId}/market_chart?vs_currency=usd&days=30
    baseUrl: 'https://api.coingecko.com/api/v3/coins',
    authType: 'none',
    headers: { 'Accept': 'application/json' },
  },
  yahoo: {
    // Yahoo Finance API: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=1y&interval=1d
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    authType: 'none',
    headers: { 'Accept': 'application/json' },
  },
  worldbank: {
    // World Bank API: https://api.worldbank.org/v2/country/{country}/indicator/{indicator}?format=json
    baseUrl: 'https://api.worldbank.org/v2',
    authType: 'none',
    headers: { 'Accept': 'application/json' },
  },
  bls: {
    // BLS API v2: POST https://api.bls.gov/publicAPI/v2/timeseries/data/ with JSON body
    baseUrl: 'https://api.bls.gov/publicAPI/v2',
    authType: 'query',
    authParam: 'registrationkey',
    headers: { 'Content-Type': 'application/json' },
  },
  treasury: {
    // Treasury Fiscal Data API: https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/...
    baseUrl: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service',
    authType: 'none',
    headers: { 'Accept': 'application/json' },
  },
  hyperliquid: {
    // Hyperliquid API: POST https://api.hyperliquid.xyz/info with JSON body
    baseUrl: 'https://api.hyperliquid.xyz',
    authType: 'none',
    headers: { 'Content-Type': 'application/json' },
  },
  alphavantage: {
    // Alpha Vantage API: https://www.alphavantage.co/query?function=X&symbol=Y&apikey=Z
    baseUrl: 'https://www.alphavantage.co',
    authType: 'query',
    authParam: 'apikey',
    headers: { 'Accept': 'application/json' },
  },
  quandl: {
    // Quandl/Nasdaq API: https://data.nasdaq.com/api/v3/datasets/{database}/{dataset}.json
    // Note: Quandl uses Cloudflare protection that may block server-side requests
    baseUrl: 'https://data.nasdaq.com/api/v3',
    authType: 'query',
    authParam: 'api_key',
    headers: { 'Accept': 'application/json' },
  },
  imf: {
    // IMF DataMapper API: https://www.imf.org/external/datamapper/api/v1/...
    // Note: IMF may block server-side requests
    baseUrl: 'https://www.imf.org/external/datamapper/api/v1',
    authType: 'none',
    headers: { 'Accept': 'application/json' },
  },
  oecd: {
    // OECD SDMX API: https://sdmx.oecd.org/public/rest/data/{dataset}/...
    // Note: Complex SDMX path structure may not work with simple adapter
    baseUrl: 'https://sdmx.oecd.org/public/rest/data',
    authType: 'none',
    headers: { 'Accept': 'application/vnd.sdmx.data+json;version=1.0' },
  },
};

/**
 * Direct API adapter for server-side requests without proxy
 * 
 * Supports:
 * - Configurable base URLs per provider
 * - API key injection (query param or header)
 * - Custom headers per provider
 * - Environment variable fallback for API keys
 */
export class DirectRequestAdapter implements RequestAdapter {
  private configs: Record<string, ProviderApiConfig>;

  constructor(
    apiKeys: Record<string, string> = {},
    customConfigs: Record<string, Partial<ProviderApiConfig>> = {}
  ) {
    // Merge default configs with custom overrides and API keys
    this.configs = {};
    
    for (const [provider, defaultConfig] of Object.entries(DEFAULT_PROVIDER_CONFIGS)) {
      const customConfig = customConfigs[provider] || {};
      const envKey = this.getEnvApiKey(provider);
      
      this.configs[provider] = {
        ...defaultConfig,
        ...customConfig,
        apiKey: apiKeys[provider] || customConfig.apiKey || envKey || defaultConfig.apiKey,
        headers: { ...defaultConfig.headers, ...customConfig.headers },
      };
    }
  }

  /**
   * Get API key from environment variables
   */
  private getEnvApiKey(provider: string): string | undefined {
    const envVarNames: Record<string, string> = {
      fred: 'FRED_API_KEY',
      bls: 'BLS_API_KEY',
      alphavantage: 'ALPHAVANTAGE_API_KEY',
      quandl: 'QUANDL_API_KEY',
      coingecko: 'COINGECKO_API_KEY',
    };
    
    const envVar = envVarNames[provider];
    if (envVar && typeof process !== 'undefined' && process.env) {
      return process.env[envVar];
    }
    return undefined;
  }

  /**
   * Build a request for the given provider
   */
  buildRequest(config: RequestConfig): Request {
    const providerConfig = this.configs[config.provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${config.provider}. Available: ${Object.keys(this.configs).join(', ')}`);
    }

    const method = config.method || 'GET';
    const isPost = method === 'POST';

    // Build URL - for POST requests, don't include params in URL if we have a body
    let url = `${providerConfig.baseUrl}${config.endpoint}`;
    
    if (!isPost || !config.body) {
      // For GET requests or POST without body, add params to URL
      const params = new URLSearchParams(config.params);
      
      // Add API key to query params if configured
      if (providerConfig.authType === 'query' && providerConfig.authParam && providerConfig.apiKey) {
        params.set(providerConfig.authParam, providerConfig.apiKey);
      }

      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    } else if (providerConfig.authType === 'query' && providerConfig.authParam && providerConfig.apiKey) {
      // For POST with body, still need to add API key to URL if required
      url = `${url}?${providerConfig.authParam}=${encodeURIComponent(providerConfig.apiKey)}`;
    }

    // Build headers
    const headers: Record<string, string> = { ...providerConfig.headers };
    
    // Add API key to headers if configured
    if (providerConfig.authType === 'header' && providerConfig.authParam && providerConfig.apiKey) {
      headers[providerConfig.authParam] = providerConfig.apiKey;
    }

    // Build request init
    const requestInit: RequestInit = {
      method,
      headers,
    };

    // Add body for POST requests
    if (isPost && config.body) {
      requestInit.body = JSON.stringify(config.body);
    }

    return new Request(url, requestInit);
  }

  /**
   * Check if a provider has an API key configured
   */
  hasApiKey(provider: string): boolean {
    const config = this.configs[provider];
    return config ? !!config.apiKey : false;
  }

  /**
   * Get list of providers that require API keys but don't have them
   */
  getMissingApiKeys(): string[] {
    const missing: string[] = [];
    for (const [provider, config] of Object.entries(this.configs)) {
      if (config.authType !== 'none' && !config.apiKey) {
        missing.push(provider);
      }
    }
    return missing;
  }
}

/**
 * Create a DirectRequestAdapter with API keys from environment variables
 */
export function createDirectAdapter(apiKeys: Record<string, string> = {}): DirectRequestAdapter {
  return new DirectRequestAdapter(apiKeys);
}
