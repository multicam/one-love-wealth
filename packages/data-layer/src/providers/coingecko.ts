import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

export type CoinGeckoEndpoint = 'market_chart' | 'ohlc' | 'simple_price';

export interface CoinGeckoConfig extends ProviderConfig {
  coinId: string;
  vsCurrency?: string;
  endpoint?: CoinGeckoEndpoint;
  days?: number | 'max';
  interval?: 'daily' | 'hourly';
  precision?: number;
  includeMarketCap?: boolean;
  include24hrVol?: boolean;
  include24hrChange?: boolean;
}

// Response types for each endpoint
interface MarketChartResponse {
  prices?: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}

type OHLCResponse = [number, number, number, number, number][];

interface SimplePriceResponse {
  [coinId: string]: {
    [currency: string]: number;
    [key: `${string}_market_cap`]: number;
    [key: `${string}_24h_vol`]: number;
    [key: `${string}_24h_change`]: number;
  };
}

export class CoinGeckoProvider extends BaseProvider<CoinGeckoConfig> {
  readonly name = 'CoinGecko';
  readonly cachePrefix = 'COINGECKO';

  protected buildRequestConfig(config: CoinGeckoConfig): RequestConfig {
    const endpoint = config.endpoint || 'market_chart';
    const params: Record<string, string> = {
      coin_id: config.coinId,
      vs_currency: config.vsCurrency || 'usd',
      endpoint,
    };

    if (endpoint === 'market_chart') {
      params.days = String(config.days ?? 'max');
      if (config.interval) params.interval = config.interval;
      if (config.precision !== undefined) params.precision = String(config.precision);
    }

    if (endpoint === 'ohlc') {
      params.days = String(config.days ?? 7);
    }

    if (endpoint === 'simple_price') {
      if (config.includeMarketCap) params.include_market_cap = 'true';
      if (config.include24hrVol) params.include_24hr_vol = 'true';
      if (config.include24hrChange) params.include_24hr_change = 'true';
    }

    return {
      provider: 'coingecko',
      endpoint: `/${endpoint}`,
      params,
    };
  }

  protected getCacheKeyComponents(config: CoinGeckoConfig): CacheKeyComponents {
    const endpoint = config.endpoint || 'market_chart';
    const params: Record<string, string | number | boolean> = {
      coinId: config.coinId,
      vsCurrency: config.vsCurrency || 'usd',
    };

    if (endpoint === 'market_chart') {
      params.days = config.days ?? 'max';
      params.interval = config.interval || 'daily';
    } else if (endpoint === 'ohlc') {
      params.days = config.days ?? 7;
    }

    return {
      provider: this.cachePrefix,
      endpoint,
      params,
    };
  }

  protected transformResponse(json: unknown, config: CoinGeckoConfig): DataPoint[] {
    const endpoint = config.endpoint || 'market_chart';

    if (endpoint === 'market_chart') {
      return this.transformMarketChartResponse(json as MarketChartResponse);
    }

    if (endpoint === 'ohlc') {
      return this.transformOHLCResponse(json as OHLCResponse);
    }

    if (endpoint === 'simple_price') {
      return this.transformSimplePriceResponse(
        json as SimplePriceResponse,
        config
      );
    }

    throw new DataLayerError(
      `Unknown endpoint: ${endpoint}`,
      ErrorCode.INVALID_RESPONSE,
      this.name
    );
  }

  private transformMarketChartResponse(response: MarketChartResponse): DataPoint[] {
    if (!response.prices) {
      throw new DataLayerError(
        'Invalid market_chart response: missing prices',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    return response.prices.map((p) => ({
      time: p[0],
      value: p[1],
    }));
  }

  private transformOHLCResponse(response: OHLCResponse): DataPoint[] {
    if (!Array.isArray(response)) {
      throw new DataLayerError(
        'Invalid OHLC response: expected array',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    return response.map((candle) => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
    }));
  }

  private transformSimplePriceResponse(
    response: SimplePriceResponse,
    config: CoinGeckoConfig
  ): DataPoint[] {
    const coinData = response[config.coinId];
    if (!coinData) {
      throw new DataLayerError(
        `Invalid simple_price response: missing data for ${config.coinId}`,
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const currency = config.vsCurrency || 'usd';
    const point: DataPoint = {
      time: Date.now(),
      value: coinData[currency],
    };

    // Add optional fields if requested and available
    if (config.includeMarketCap) {
      const marketCapKey = `${currency}_market_cap` as keyof typeof coinData;
      if (coinData[marketCapKey] !== undefined) {
        (point as DataPoint & { marketCap?: number }).marketCap = coinData[marketCapKey] as number;
      }
    }

    if (config.include24hrVol) {
      const volKey = `${currency}_24h_vol` as keyof typeof coinData;
      if (coinData[volKey] !== undefined) {
        point.volume = coinData[volKey] as number;
      }
    }

    if (config.include24hrChange) {
      const changeKey = `${currency}_24h_change` as keyof typeof coinData;
      if (coinData[changeKey] !== undefined) {
        (point as DataPoint & { change24h?: number }).change24h = coinData[changeKey] as number;
      }
    }

    return [point];
  }

  protected generateMockData(config: CoinGeckoConfig): DataPoint[] {
    const endpoint = config.endpoint || 'market_chart';
    const now = Date.now();
    let price = config.coinId === 'bitcoin' ? 50000 : 3000;

    if (endpoint === 'simple_price') {
      const point: DataPoint & { marketCap?: number; change24h?: number } = {
        time: now,
        value: price,
      };

      if (config.includeMarketCap) {
        point.marketCap = price * 19000000;
      }
      if (config.include24hrVol) {
        point.volume = 50000000000;
      }
      if (config.include24hrChange) {
        point.change24h = (Math.random() - 0.5) * 10;
      }

      return [point];
    }

    // Generate time series data for market_chart and ohlc
    const days = typeof config.days === 'number' ? config.days : 365;
    const data: DataPoint[] = [];

    for (let i = days; i >= 0; i--) {
      const time = now - i * 24 * 60 * 60 * 1000;

      if (endpoint === 'ohlc') {
        const open = price;
        const change = (Math.random() - 0.5) * price * 0.05;
        const close = open + change;
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);

        data.push({ time, open, high, low, close });
        price = close;
      } else {
        // market_chart returns simple value data
        price = price * (1 + (Math.random() - 0.45) * 0.05);
        data.push({ time, value: price });
      }
    }

    return data;
  }
}
