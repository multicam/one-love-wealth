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
export class ProxyHandler {
  constructor(
    private name: string,
    private baseUrl?: string
  ) {}

  /**
   * Make a fetch request with consistent error handling and logging.
   */
  async fetch<T = unknown>(config: ProxyRequestConfig): Promise<ProxyResult<T>> {
    const { url, method = 'GET', headers, body } = config;

    try {
      console.log(`[${this.name}] ${method} ${this.maskSensitiveParams(url)}`);

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        console.error(`[${this.name}] HTTP ${response.status}: ${text}`);
        return {
          ok: false,
          status: response.status,
          error: `${this.name} API error: ${response.statusText}`,
          details: text,
        };
      }

      const data = (await response.json()) as T;
      return { ok: true, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${this.name}] Error:`, message);

      // Handle common error patterns
      if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
        return { ok: false, status: 503, error: `${this.name} API is unreachable` };
      }
      if (message.includes('429') || message.includes('rate limit') || message.includes('Rate limit')) {
        return { ok: false, status: 429, error: `${this.name} rate limit exceeded` };
      }

      return { ok: false, status: 500, error: `Failed to fetch from ${this.name}: ${message}` };
    }
  }

  /**
   * Build a URL with query parameters.
   * Null/undefined values are filtered out.
   */
  buildUrl(
    path: string,
    params: Record<string, string | number | boolean | undefined | null>
  ): string {
    const url = this.baseUrl ? new URL(path, this.baseUrl) : new URL(path);

    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  /**
   * Log a success message with data point count.
   */
  logSuccess(count: number | string): void {
    console.log(`[${this.name}] Successfully fetched ${count} data points`);
  }

  /**
   * Mask sensitive parameters in URL for logging (e.g., API keys).
   */
  private maskSensitiveParams(url: string): string {
    return url
      .replace(/api_key=[^&]+/gi, 'api_key=***')
      .replace(/apikey=[^&]+/gi, 'apikey=***')
      .replace(/registrationkey=[^&]+/gi, 'registrationkey=***');
  }
}
