import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * Quandl data frequency options
 */
export type QuandlCollapse = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

/**
 * Quandl transformation options
 */
export type QuandlTransform = 'none' | 'diff' | 'rdiff' | 'rdiff_from' | 'cumul' | 'normalize';

export interface QuandlConfig extends ProviderConfig {
  /** Database code (e.g., 'FRED', 'WIKI', 'LBMA') */
  databaseCode: string;
  /** Dataset code (e.g., 'GDP', 'AAPL', 'GOLD') */
  datasetCode: string;
  /** Which column to extract (default: last column) */
  column?: number;
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Data frequency */
  collapse?: QuandlCollapse;
  /** Data transformation */
  transform?: QuandlTransform;
  /** Limit number of rows */
  rows?: number;
}

/**
 * Common Quandl datasets for reference
 */
export const QUANDL_DATASETS = {
  FRED_GDP: { database: 'FRED', dataset: 'GDP' },
  FRED_UNRATE: { database: 'FRED', dataset: 'UNRATE' },
  FRED_CPIAUCSL: { database: 'FRED', dataset: 'CPIAUCSL' },
  LBMA_GOLD: { database: 'LBMA', dataset: 'GOLD' },
  LBMA_SILVER: { database: 'LBMA', dataset: 'SILVER' },
  CME_CL1: { database: 'CHRIS', dataset: 'CME_CL1' },
  CME_GC1: { database: 'CHRIS', dataset: 'CME_GC1' },
  OPEC_ORB: { database: 'OPEC', dataset: 'ORB' },
} as const;

interface QuandlResponse {
  dataset?: {
    column_names?: string[];
    data?: (string | number | null)[][];
  };
  dataset_data?: {
    column_names?: string[];
    data?: (string | number | null)[][];
  };
}

export class QuandlProvider extends BaseProvider<QuandlConfig> {
  override readonly name = 'Quandl';
  override readonly cachePrefix = 'QUANDL';
  protected override defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  protected override buildRequestConfig(config: QuandlConfig): RequestConfig {
    const params: Record<string, string> = {
      database: config.databaseCode,
      dataset: config.datasetCode,
    };

    if (config.column !== undefined) {
      params.column_index = String(config.column);
    }
    if (config.startDate) params.start_date = config.startDate;
    if (config.endDate) params.end_date = config.endDate;
    if (config.collapse && config.collapse !== 'none') {
      params.collapse = config.collapse;
    }
    if (config.transform && config.transform !== 'none') {
      params.transform = config.transform;
    }
    if (config.rows) params.rows = String(config.rows);

    return {
      provider: 'quandl',
      endpoint: '/datasets',
      params,
    };
  }

  protected override getCacheKeyComponents(config: QuandlConfig): CacheKeyComponents {
    const params: Record<string, string | number | boolean> = {
      database: config.databaseCode,
      dataset: config.datasetCode,
    };

    if (config.column !== undefined) params.column = config.column;
    if (config.startDate) params.startDate = config.startDate;
    if (config.endDate) params.endDate = config.endDate;
    if (config.collapse) params.collapse = config.collapse;
    if (config.transform) params.transform = config.transform;
    if (config.rows) params.rows = config.rows;

    return {
      provider: this.cachePrefix,
      endpoint: `${config.databaseCode}/${config.datasetCode}`,
      params,
    };
  }

  protected override transformResponse(json: unknown, config: QuandlConfig): DataPoint[] {
    const response = json as QuandlResponse;
    const dataset = response.dataset || response.dataset_data;

    if (!dataset) {
      throw new DataLayerError(
        'Invalid Quandl response format',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const data = dataset.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new DataLayerError(
        `No data found for ${config.databaseCode}/${config.datasetCode}`,
        ErrorCode.NOT_FOUND,
        this.name
      );
    }

    const columnNames = dataset.column_names || [];
    const columnIndex = config.column !== undefined ? config.column : columnNames.length - 1;

    const results: DataPoint[] = [];
    for (const row of data) {
      const date = row[0];
      const value = row[columnIndex];

      if (!date || value === null || value === undefined) {
        continue;
      }

      const parsedValue = parseFloat(String(value));
      if (!isNaN(parsedValue)) {
        results.push({
          time: new Date(String(date)).getTime(),
          value: parsedValue,
        });
      }
    }

    return results.sort((a, b) => a.time - b.time);
  }

  protected override generateMockData(_config: QuandlConfig): DataPoint[] {
    const points: DataPoint[] = [];
    const today = new Date();
    let value = 100;

    for (let i = 199; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      value += (Math.random() - 0.5) * 5;
      value = Math.max(value, 50);

      points.push({
        time: date.getTime(),
        value,
      });
    }

    return points;
  }
}
