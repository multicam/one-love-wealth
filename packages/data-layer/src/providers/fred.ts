import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * FRED Units transformations - server-side calculations
 */
export type FREDUnits =
  | 'lin' // Levels (no transformation)
  | 'chg' // Change
  | 'ch1' // Change from Year Ago
  | 'pch' // Percent Change
  | 'pc1' // Percent Change from Year Ago (YoY!)
  | 'pca' // Compounded Annual Rate of Change
  | 'cch' // Continuously Compounded Rate of Change
  | 'cca' // Continuously Compounded Annual Rate of Change
  | 'log'; // Natural Log

/**
 * FRED Frequency values for aggregation
 */
export type FREDFrequency =
  | 'd' // Daily
  | 'w' // Weekly (Friday)
  | 'bw' // Biweekly (Wednesday)
  | 'm' // Monthly
  | 'q' // Quarterly
  | 'sa' // Semiannual
  | 'a'; // Annual

export interface FREDConfig extends ProviderConfig {
  /** FRED series identifier (e.g., 'M2SL', 'IPMAN', 'GDP') */
  seriesId: string;
  /** Server-side data transformation */
  units?: FREDUnits;
  /** Frequency aggregation - downsample data to lower frequency */
  frequency?: FREDFrequency;
  /** How to aggregate when changing frequency */
  aggregationMethod?: 'avg' | 'sum' | 'eop';
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Most recent N observations (alternative to date range) */
  limit?: number;
}

interface FREDObservation {
  date: string;
  value: string;
}

interface FREDResponse {
  observations?: FREDObservation[];
}

export class FREDProvider extends BaseProvider<FREDConfig> {
  readonly name = 'FRED';
  readonly cachePrefix = 'FRED';

  protected buildRequestConfig(config: FREDConfig): RequestConfig {
    const params: Record<string, string> = {
      series_id: config.seriesId,
    };

    if (config.startDate) params.observation_start = config.startDate;
    if (config.endDate) params.observation_end = config.endDate;
    if (config.limit) {
      params.limit = String(config.limit);
      params.sort_order = 'desc';
    }
    if (config.units) params.units = config.units;
    if (config.frequency) params.frequency = config.frequency;
    if (config.aggregationMethod) params.aggregation_method = config.aggregationMethod;

    return {
      provider: 'fred',
      endpoint: '/series/observations',
      params,
    };
  }

  protected getCacheKeyComponents(config: FREDConfig): CacheKeyComponents {
    const params: Record<string, string | number | boolean> = {
      seriesId: config.seriesId,
    };

    if (config.units) params.units = config.units;
    if (config.frequency) params.frequency = config.frequency;
    if (config.startDate) params.startDate = config.startDate;
    if (config.endDate) params.endDate = config.endDate;
    if (config.limit) params.limit = config.limit;

    return {
      provider: this.cachePrefix,
      endpoint: 'observations',
      params,
    };
  }

  protected transformResponse(json: unknown, _config: FREDConfig): DataPoint[] {
    const response = json as FREDResponse;

    if (!response.observations) {
      throw new DataLayerError(
        'Invalid FRED response: missing observations',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const result: DataPoint[] = [];
    for (const obs of response.observations) {
      const value = parseFloat(obs.value);
      if (!isNaN(value)) {
        result.push({
          time: new Date(obs.date).getTime(),
          value,
        });
      }
    }
    return result;
  }

  protected generateMockData(config: FREDConfig): DataPoint[] {
    const now = Date.now();
    const data: DataPoint[] = [];
    let value = this.getBaselineValue(config.seriesId);

    // Generate 5 years of monthly data by default
    const months = config.limit || 60;

    for (let i = months; i >= 0; i--) {
      const time = now - i * 30 * 24 * 60 * 60 * 1000; // ~monthly intervals
      value = this.simulateValue(config.seriesId, value, i);
      data.push({ time, value });
    }

    // Apply units transformation for mock data
    return this.applyMockUnitsTransform(data, config.units);
  }

  private getBaselineValue(seriesId: string): number {
    const baselines: Record<string, number> = {
      'M2SL': 20000,
      'IPMAN': 100,
      'GFDEGDQ188S': 120,
      'A091RC1Q027SBEA': 500,
      'PPIACO': 250,
      'GS10': 4.0,
      'FEDFUNDS': 4.0,
      'NFCI': -0.5,
      'WPU10': 120,
      'CIVPART': 62,
      'SP500': 4000,
      'NASDAQ100': 15000,
      'GDPC1': 20000,
      'GDP': 25000,
      'DTWEXBGS': 100,
      'UMCSENT': 70,
      'GFDEBTN': 30000,
      'TDSP': 10,
      'CPIAUCSL': 300,
      'UNRATE': 4.0,
    };
    return baselines[seriesId] ?? 100;
  }

  private simulateValue(seriesId: string, currentValue: number, monthsAgo: number): number {
    // Series-specific simulation patterns
    if (seriesId === 'IPMAN') {
      return 100 + 5 * Math.sin((monthsAgo * Math.PI) / 24);
    }
    if (seriesId === 'GFDEGDQ188S' || seriesId === 'TOTDTEUSQ163N') {
      return currentValue * 1.002;
    }
    if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') {
      return 4.0 + 1.5 * Math.sin((monthsAgo * Math.PI) / 36);
    }
    if (seriesId === 'NFCI') {
      return -0.5 + Math.random() * 0.5;
    }
    if (seriesId === 'UNRATE') {
      return 3.5 + Math.random() * 1.5;
    }
    if (seriesId === 'SP500' || seriesId === 'NASDAQ100') {
      return currentValue * (1 + (Math.random() - 0.35) * 0.05);
    }
    // Default: slight upward trend
    return currentValue * 1.001;
  }

  private applyMockUnitsTransform(data: DataPoint[], units?: FREDUnits): DataPoint[] {
    if (!units || units === 'lin') return data;

    if (units === 'pc1' && data.length > 12) {
      // Percent change from year ago
      return data.slice(12).map((point, i) => {
        const current = point.value ?? 0;
        const prevPoint = data[i];
        const previous = prevPoint?.value ?? 1;
        return {
          time: point.time,
          value: ((current - previous) / previous) * 100,
        };
      });
    }

    if (units === 'pch' && data.length > 1) {
      // Percent change from previous period
      return data.slice(1).map((point, i) => {
        const current = point.value ?? 0;
        const prevPoint = data[i];
        const previous = prevPoint?.value ?? 1;
        return {
          time: point.time,
          value: ((current - previous) / previous) * 100,
        };
      });
    }

    if (units === 'log') {
      // Natural log transformation
      return data.map((point) => ({
        time: point.time,
        value: Math.log(point.value ?? 1),
      }));
    }

    if (units === 'chg' && data.length > 1) {
      // Change from previous period
      return data.slice(1).map((point, i) => {
        const prevPoint = data[i];
        return {
          time: point.time,
          value: (point.value ?? 0) - (prevPoint?.value ?? 0),
        };
      });
    }

    if (units === 'ch1' && data.length > 12) {
      // Change from year ago
      return data.slice(12).map((point, i) => {
        const prevPoint = data[i];
        return {
          time: point.time,
          value: (point.value ?? 0) - (prevPoint?.value ?? 0),
        };
      });
    }

    return data;
  }
}
