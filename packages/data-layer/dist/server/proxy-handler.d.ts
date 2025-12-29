/**
 * Proxy handler utility for server-side API proxying.
 * Provides consistent error handling, logging, and URL building.
 */
export interface ProxyRequestConfig {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: unknown;
}
export interface ProxySuccess<T> {
    ok: true;
    data: T;
}
export interface ProxyError {
    ok: false;
    status: number;
    error: string;
    details?: string;
}
export type ProxyResult<T> = ProxySuccess<T> | ProxyError;
/**
 * ProxyHandler provides utilities for server-side API proxying.
 * Handles common concerns like logging, error handling, and URL construction.
 */
export declare class ProxyHandler {
    private name;
    private baseUrl?;
    constructor(name: string, baseUrl?: string | undefined);
    /**
     * Make a fetch request with consistent error handling and logging.
     */
    fetch<T = unknown>(config: ProxyRequestConfig): Promise<ProxyResult<T>>;
    /**
     * Build a URL with query parameters.
     * Null/undefined values are filtered out.
     */
    buildUrl(path: string, params: Record<string, string | number | boolean | undefined | null>): string;
    /**
     * Log a success message with data point count.
     */
    logSuccess(count: number | string): void;
    /**
     * Mask sensitive parameters in URL for logging (e.g., API keys).
     */
    private maskSensitiveParams;
}
//# sourceMappingURL=proxy-handler.d.ts.map