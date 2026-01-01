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
export declare class ProxyRequestAdapter implements RequestAdapter {
    private proxyBase;
    constructor(proxyBase: string);
    buildRequest(config: RequestConfig): Request;
}
/**
 * API provider configuration for direct requests
 */
export interface ProviderApiConfig {
    baseUrl: string;
    authType?: 'query' | 'header' | 'none';
    authParam?: string;
    apiKey?: string;
    headers?: Record<string, string>;
}
/**
 * Default API configurations for all supported providers
 *
 * Note: Base URLs should NOT include trailing paths that providers add via `endpoint`.
 * Each provider's `buildRequestConfig` specifies the endpoint path.
 */
export declare const DEFAULT_PROVIDER_CONFIGS: Record<string, ProviderApiConfig>;
/**
 * Direct API adapter for server-side requests without proxy
 *
 * Supports:
 * - Configurable base URLs per provider
 * - API key injection (query param or header)
 * - Custom headers per provider
 * - Environment variable fallback for API keys
 */
export declare class DirectRequestAdapter implements RequestAdapter {
    private configs;
    constructor(apiKeys?: Record<string, string>, customConfigs?: Record<string, Partial<ProviderApiConfig>>);
    /**
     * Get API key from environment variables
     */
    private getEnvApiKey;
    /**
     * Build a request for the given provider
     */
    buildRequest(config: RequestConfig): Request;
    /**
     * Check if a provider has an API key configured
     */
    hasApiKey(provider: string): boolean;
    /**
     * Get list of providers that require API keys but don't have them
     */
    getMissingApiKeys(): string[];
}
/**
 * Create a DirectRequestAdapter with API keys from environment variables
 */
export declare function createDirectAdapter(apiKeys?: Record<string, string>): DirectRequestAdapter;
//# sourceMappingURL=request.d.ts.map