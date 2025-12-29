/**
 * Proxy-based adapter (routes through /api/proxy/*)
 */
export class ProxyRequestAdapter {
    proxyBase;
    constructor(proxyBase) {
        this.proxyBase = proxyBase;
    }
    buildRequest(config) {
        const params = new URLSearchParams(config.params);
        const url = `${this.proxyBase}/${config.provider}?${params}`;
        return new Request(url, { method: config.method || 'GET' });
    }
}
/**
 * Direct API adapter with configurable base URLs and headers
 */
export class DirectRequestAdapter {
    baseUrls;
    headers;
    constructor(baseUrls, headers = {}) {
        this.baseUrls = baseUrls;
        this.headers = headers;
    }
    buildRequest(config) {
        const base = this.baseUrls[config.provider];
        if (!base)
            throw new Error(`Unknown provider: ${config.provider}`);
        const params = new URLSearchParams(config.params);
        const url = `${base}${config.endpoint}?${params}`;
        return new Request(url, {
            method: config.method || 'GET',
            headers: this.headers,
        });
    }
}
