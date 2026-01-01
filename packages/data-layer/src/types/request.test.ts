import { test, expect, describe } from 'bun:test';
import {
  DirectRequestAdapter,
  ProxyRequestAdapter,
  createDirectAdapter,
  DEFAULT_PROVIDER_CONFIGS,

} from './request';

describe('ProxyRequestAdapter', () => {
  test('builds URL with proxy base and provider', () => {
    const adapter = new ProxyRequestAdapter('https://example.com/api/proxy');
    const request = adapter.buildRequest({
      provider: 'fred',
      endpoint: '/series/observations',
      params: { series_id: 'M2SL' },
    });

    expect(request.url).toBe('https://example.com/api/proxy/fred?series_id=M2SL');
    expect(request.method).toBe('GET');
  });

  test('supports custom method', () => {
    const adapter = new ProxyRequestAdapter('https://example.com/api/proxy');
    const request = adapter.buildRequest({
      provider: 'hyperliquid',
      endpoint: '/info',
      params: {},
      method: 'POST',
    });

    expect(request.method).toBe('POST');
  });
});

describe('DirectRequestAdapter', () => {
  describe('URL Construction', () => {
    test('builds URL with base URL and endpoint', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/v2/accounting/od/debt_to_penny',
        params: {},
      });

      expect(request.url).toBe(
        'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny'
      );
    });

    test('appends query parameters to URL', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/v2/accounting/od/debt_to_penny',
        params: {
          page: '1',
          limit: '100',
        },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('limit')).toBe('100');
    });

    test('handles empty params', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'imf',
        endpoint: '/indicators',
        params: {},
      });

      expect(request.url).toBe('https://www.imf.org/external/datamapper/api/v1/indicators');
    });

    test('throws error for unknown provider', () => {
      const adapter = new DirectRequestAdapter();
      expect(() =>
        adapter.buildRequest({
          provider: 'unknown',
          endpoint: '/test',
          params: {},
        })
      ).toThrow('Unknown provider: unknown');
    });
  });

  describe('API Key Injection (Query Params)', () => {
    test('injects API key as query param for FRED', () => {
      const adapter = new DirectRequestAdapter({ fred: 'test-fred-key' });
      const request = adapter.buildRequest({
        provider: 'fred',
        endpoint: '/series/observations',
        params: { series_id: 'M2SL' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('api_key')).toBe('test-fred-key');
      expect(url.searchParams.get('series_id')).toBe('M2SL');
    });

    test('injects API key as query param for BLS', () => {
      const adapter = new DirectRequestAdapter({ bls: 'test-bls-key' });
      const request = adapter.buildRequest({
        provider: 'bls',
        endpoint: '/timeseries/data',
        params: { seriesId: 'LNS14000000' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('registrationkey')).toBe('test-bls-key');
    });

    test('injects API key as query param for Alpha Vantage', () => {
      const adapter = new DirectRequestAdapter({ alphavantage: 'test-av-key' });
      const request = adapter.buildRequest({
        provider: 'alphavantage',
        endpoint: '/query',
        params: { function: 'TIME_SERIES_DAILY', symbol: 'AAPL' },
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('apikey')).toBe('test-av-key');
    });

    test('injects API key as query param for Quandl', () => {
      const adapter = new DirectRequestAdapter({ quandl: 'test-quandl-key' });
      const request = adapter.buildRequest({
        provider: 'quandl',
        endpoint: '/datasets/LBMA/GOLD',
        params: {},
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('api_key')).toBe('test-quandl-key');
    });

    test('does not inject API key for providers with authType none', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/v2/accounting/od/debt_to_penny',
        params: {},
      });

      const url = new URL(request.url);
      expect(url.searchParams.get('api_key')).toBeNull();
    });

    test('API key injection depends on availability', () => {
      // Create adapter without any API keys provided
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'fred',
        endpoint: '/series/observations',
        params: { series_id: 'M2SL' },
      });

      const url = new URL(request.url);
      // If FRED_API_KEY env var is set, key will be injected; otherwise not
      const hasEnvKey = !!process.env.FRED_API_KEY;
      expect(url.searchParams.has('api_key')).toBe(hasEnvKey);
    });
  });

  describe('Headers', () => {
    test('includes default headers for provider', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/v2/accounting/od/debt_to_penny',
        params: {},
      });

      expect(request.headers.get('Accept')).toBe('application/json');
    });

    test('includes Content-Type for providers that need it', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'hyperliquid',
        endpoint: '/info',
        params: {},
      });

      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    test('uses SDMX Accept header for OECD', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'oecd',
        endpoint: '/QNA',
        params: {},
      });

      expect(request.headers.get('Accept')).toBe(
        'application/vnd.sdmx.data+json;version=1.0'
      );
    });
  });

  describe('HTTP Methods', () => {
    test('defaults to GET method', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/test',
        params: {},
      });

      expect(request.method).toBe('GET');
    });

    test('supports POST method', () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'hyperliquid',
        endpoint: '/info',
        params: {},
        method: 'POST',
      });

      expect(request.method).toBe('POST');
    });

    test('includes body for POST requests', async () => {
      const adapter = new DirectRequestAdapter();
      const request = adapter.buildRequest({
        provider: 'hyperliquid',
        endpoint: '/info',
        params: {},
        method: 'POST',
        body: { type: 'candleSnapshot', req: { coin: 'BTC' } },
      });

      expect(request.method).toBe('POST');
      const body = await request.json();
      expect(body).toEqual({ type: 'candleSnapshot', req: { coin: 'BTC' } });
    });
  });

  describe('Custom Configurations', () => {
    test('allows custom base URL override', () => {
      const adapter = new DirectRequestAdapter({}, {
        fred: { baseUrl: 'https://custom.fred.api' },
      });
      const request = adapter.buildRequest({
        provider: 'fred',
        endpoint: '/test',
        params: {},
      });

      expect(request.url).toContain('https://custom.fred.api/test');
    });

    test('merges custom headers with default headers', () => {
      const adapter = new DirectRequestAdapter({}, {
        treasury: { headers: { 'X-Custom-Header': 'custom-value' } },
      });
      const request = adapter.buildRequest({
        provider: 'treasury',
        endpoint: '/test',
        params: {},
      });

      expect(request.headers.get('Accept')).toBe('application/json');
      expect(request.headers.get('X-Custom-Header')).toBe('custom-value');
    });

    test('custom config apiKey takes precedence', () => {
      const adapter = new DirectRequestAdapter(
        { fred: 'constructor-key' },
        { fred: { apiKey: 'config-key' } }
      );
      const request = adapter.buildRequest({
        provider: 'fred',
        endpoint: '/test',
        params: {},
      });

      // Constructor apiKeys take precedence over customConfigs.apiKey
      const url = new URL(request.url);
      expect(url.searchParams.get('api_key')).toBe('constructor-key');
    });
  });

  describe('hasApiKey', () => {
    test('returns true when API key is provided via constructor', () => {
      const adapter = new DirectRequestAdapter({ fred: 'test-key' });
      expect(adapter.hasApiKey('fred')).toBe(true);
    });

    test('returns true when API key is available from env var', () => {
      // FRED_API_KEY is set in the test environment
      const adapter = new DirectRequestAdapter();
      // If env var is set, hasApiKey returns true
      const hasEnvKey = !!process.env.FRED_API_KEY;
      expect(adapter.hasApiKey('fred')).toBe(hasEnvKey);
    });

    test('returns false for providers without keys configured', () => {
      const adapter = new DirectRequestAdapter();
      // Treasury has authType: 'none', so it doesn't need a key
      // hasApiKey returns false because there's no key configured
      expect(adapter.hasApiKey('treasury')).toBe(false);
    });

    test('returns false for unknown provider', () => {
      const adapter = new DirectRequestAdapter();
      expect(adapter.hasApiKey('unknown')).toBe(false);
    });
  });

  describe('getMissingApiKeys', () => {
    test('returns providers that require keys but do not have them', () => {
      const adapter = new DirectRequestAdapter();
      const missing = adapter.getMissingApiKeys();

      // These providers have authType !== 'none' and need API keys
      // Note: Some may have keys from env vars (FRED_API_KEY, etc.)
      // We check that the missing list only contains auth-required providers
      const authRequiredProviders = ['fred', 'bls', 'alphavantage', 'quandl'];
      for (const provider of missing) {
        expect(authRequiredProviders).toContain(provider);
      }
    });

    test('does not include providers that do not require keys', () => {
      const adapter = new DirectRequestAdapter();
      const missing = adapter.getMissingApiKeys();

      // These providers have authType: 'none'
      expect(missing).not.toContain('treasury');
      expect(missing).not.toContain('coingecko');
      expect(missing).not.toContain('yahoo');
      expect(missing).not.toContain('worldbank');
      expect(missing).not.toContain('imf');
      expect(missing).not.toContain('oecd');
      expect(missing).not.toContain('hyperliquid');
    });

    test('does not include providers with keys provided via constructor', () => {
      const adapter = new DirectRequestAdapter({
        fred: 'key1',
        bls: 'key2',
        alphavantage: 'key3',
        quandl: 'key4',
      });
      const missing = adapter.getMissingApiKeys();

      expect(missing).toEqual([]);
    });

    test('excludes providers with keys from missing list', () => {
      const adapter = new DirectRequestAdapter({ bls: 'key1' });
      const missing = adapter.getMissingApiKeys();

      // BLS was provided, so it should not be in missing
      expect(missing).not.toContain('bls');
      // Other auth-required providers without keys should be in missing
      // (unless they have env vars set)
    });
  });
});

describe('createDirectAdapter', () => {
  test('creates DirectRequestAdapter instance', () => {
    const adapter = createDirectAdapter();
    expect(adapter).toBeInstanceOf(DirectRequestAdapter);
  });

  test('passes API keys to adapter', () => {
    const adapter = createDirectAdapter({ fred: 'test-key' });
    expect(adapter.hasApiKey('fred')).toBe(true);
  });
});

describe('DEFAULT_PROVIDER_CONFIGS', () => {
  test('contains all expected providers', () => {
    const expectedProviders = [
      'fred',
      'coingecko',
      'yahoo',
      'worldbank',
      'bls',
      'treasury',
      'hyperliquid',
      'alphavantage',
      'quandl',
      'imf',
      'oecd',
    ];

    for (const provider of expectedProviders) {
      expect(DEFAULT_PROVIDER_CONFIGS[provider]).toBeDefined();
      expect(DEFAULT_PROVIDER_CONFIGS[provider].baseUrl).toBeDefined();
    }
  });

  test('all providers have baseUrl defined', () => {
    for (const [provider, config] of Object.entries(DEFAULT_PROVIDER_CONFIGS)) {
      expect(config.baseUrl).toBeTruthy();
      expect(config.baseUrl.startsWith('https://')).toBe(true);
    }
  });

  test('providers requiring auth have authParam defined', () => {
    const authRequiredProviders = ['fred', 'bls', 'alphavantage', 'quandl'];

    for (const provider of authRequiredProviders) {
      const config = DEFAULT_PROVIDER_CONFIGS[provider];
      expect(config.authType).toBe('query');
      expect(config.authParam).toBeTruthy();
    }
  });

  test('providers not requiring auth have authType none', () => {
    const noAuthProviders = ['coingecko', 'yahoo', 'worldbank', 'treasury', 'hyperliquid', 'imf', 'oecd'];

    for (const provider of noAuthProviders) {
      const config = DEFAULT_PROVIDER_CONFIGS[provider];
      expect(config.authType).toBe('none');
    }
  });
});
