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
 * Direct API adapter with configurable base URLs and headers
 */
export declare class DirectRequestAdapter implements RequestAdapter {
    private baseUrls;
    private headers;
    constructor(baseUrls: Record<string, string>, headers?: Record<string, string>);
    buildRequest(config: RequestConfig): Request;
}
//# sourceMappingURL=request.d.ts.map