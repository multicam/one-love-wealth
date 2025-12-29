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
 * Direct API adapter with configurable base URLs and headers
 */
export class DirectRequestAdapter implements RequestAdapter {
  constructor(
    private baseUrls: Record<string, string>,
    private headers: Record<string, string> = {}
  ) {}

  buildRequest(config: RequestConfig): Request {
    const base = this.baseUrls[config.provider];
    if (!base) throw new Error(`Unknown provider: ${config.provider}`);

    const params = new URLSearchParams(config.params);
    const url = `${base}${config.endpoint}?${params}`;
    return new Request(url, {
      method: config.method || 'GET',
      headers: this.headers,
    });
  }
}
