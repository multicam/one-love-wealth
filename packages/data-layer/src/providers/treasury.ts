import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * Available Treasury datasets
 */
export type TreasuryDataset =
  | 'debt_to_penny'
  | 'historical_debt'
  | 'avg_interest_rates'
  | 'interest_expense';

export interface TreasuryConfig extends ProviderConfig {
  /** Treasury dataset to fetch */
  dataset: TreasuryDataset;
  /** Date range */
  dateRange?: {
    start?: string; // YYYY-MM-DD
    end?: string; // YYYY-MM-DD
  };
  /** Specific fields to fetch */
  fields?: string[];
}

/**
 * Treasury API endpoint mappings
 */
export const TREASURY_ENDPOINTS: Record<TreasuryDataset, string> = {
  debt_to_penny: 'v2/accounting/od/debt_to_penny',
  historical_debt: 'v1/accounting/od/historical_debt_outstanding',
  avg_interest_rates: 'v2/accounting/od/avg_interest_rates',
  interest_expense: 'v1/accounting/od/interest_expense',
};

/**
 * Value field mappings per dataset
 */
export const TREASURY_VALUE_FIELDS: Record<TreasuryDataset, string> = {
  debt_to_penny: 'tot_pub_debt_out_amt',
  historical_debt: 'debt_outstanding_amt',
  avg_interest_rates: 'avg_interest_rate_amt',
  interest_expense: 'month_expense_amt',
};

/**
 * Date field mappings per dataset
 */
export const TREASURY_DATE_FIELDS: Record<TreasuryDataset, string> = {
  debt_to_penny: 'record_date',
  historical_debt: 'record_date',
  avg_interest_rates: 'record_date',
  interest_expense: 'record_date',
};

interface TreasuryResponse {
  data?: Record<string, string | number>[];
}

export class TreasuryProvider extends BaseProvider<TreasuryConfig> {
  override readonly name = 'Treasury';
  override readonly cachePrefix = 'TREASURY';
  protected override defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  protected override buildRequestConfig(config: TreasuryConfig): RequestConfig {
    const params: Record<string, string> = {
      dataset: config.dataset,
    };

    if (config.dateRange?.start) {
      params.start = config.dateRange.start;
    }

    if (config.dateRange?.end) {
      params.end = config.dateRange.end;
    }

    if (config.fields && config.fields.length > 0) {
      params.fields = config.fields.join(',');
    }

    return {
      provider: 'treasury',
      endpoint: `/${config.dataset}`,
      params,
    };
  }

  protected override getCacheKeyComponents(config: TreasuryConfig): CacheKeyComponents {
    const params: Record<string, string | number | boolean> = {
      dataset: config.dataset,
    };

    if (config.dateRange?.start) params.start = config.dateRange.start;
    if (config.dateRange?.end) params.end = config.dateRange.end;
    if (config.fields) params.fields = config.fields.join(',');

    return {
      provider: this.cachePrefix,
      endpoint: config.dataset,
      params,
    };
  }

  protected override transformResponse(json: unknown, config: TreasuryConfig): DataPoint[] {
    const response = json as TreasuryResponse;

    if (!response.data || !Array.isArray(response.data)) {
      throw new DataLayerError(
        'Invalid Treasury API response format',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const dateField = TREASURY_DATE_FIELDS[config.dataset];
    const valueField = TREASURY_VALUE_FIELDS[config.dataset];

    const results: DataPoint[] = [];
    for (const row of response.data) {
      const date = row[dateField];
      const value = row[valueField];

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

    return results;
  }

  protected override generateMockData(config: TreasuryConfig): DataPoint[] {
    const mockData: DataPoint[] = [];
    const endDate = new Date();
    const startDate = new Date();

    if (config.dataset === 'historical_debt') {
      startDate.setFullYear(startDate.getFullYear() - 30);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 5);
    }

    let baseValue = 1;
    let growthRate = 0.0005;
    let volatility = 0.001;

    if (config.dataset === 'debt_to_penny' || config.dataset === 'historical_debt') {
      baseValue = 25_000_000_000_000;
      growthRate = 0.0003;
      volatility = 0.0005;
    } else if (config.dataset === 'avg_interest_rates') {
      baseValue = 2.5;
      growthRate = 0.00005;
      volatility = 0.02;
    } else if (config.dataset === 'interest_expense') {
      baseValue = 60_000_000_000;
      growthRate = 0.001;
      volatility = 0.05;
    }

    let currentValue = baseValue;
    let currentDate = new Date(startDate);
    const isMonthly = config.dataset === 'interest_expense';

    while (currentDate <= endDate) {
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      currentValue = currentValue * (1 + growthRate + randomChange);

      if (config.dataset === 'avg_interest_rates') {
        currentValue = Math.max(0.5, Math.min(5, currentValue));
      } else {
        currentValue = Math.max(0, currentValue);
      }

      mockData.push({
        time: currentDate.getTime(),
        value: Math.round(currentValue * 100) / 100,
      });

      if (isMonthly) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return mockData;
  }
}
