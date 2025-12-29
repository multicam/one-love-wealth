/**
 * Components for building a deterministic cache key
 */
export interface CacheKeyComponents {
  provider: string;
  endpoint?: string;
  params: Record<string, string | number | boolean>;
}

/**
 * Build a deterministic cache key with sorted params
 */
export function buildCacheKey(components: CacheKeyComponents): string {
  const { provider, endpoint, params } = components;

  // Sort params for deterministic keys
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const parts = [provider];
  if (endpoint) parts.push(endpoint);
  if (sortedParams) parts.push(sortedParams);

  return parts.join(':');
}
