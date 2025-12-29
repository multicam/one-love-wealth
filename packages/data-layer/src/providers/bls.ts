import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

export interface BLSConfig extends ProviderConfig {
  /** BLS series identifier (e.g., 'LNS14000000', 'CUUR0000SA0') */
  seriesId: string;
  /** Date range by year */
  dateRange?: {
    startYear: number;
    endYear: number;
  };
  /** Include percent changes (API v2 only) */
  calculations?: boolean;
  /** Include annual averages (API v2 only) */
  annualAverage?: boolean;
}

interface BLSDataItem {
  year: string;
  period: string;
  value: string;
}

interface BLSSeries {
  seriesID: string;
  data: BLSDataItem[];
}

interface BLSResponse {
  status: string;
  message?: string[];
  Results?: {
    series?: BLSSeries[];
  };
}

/**
 * Common BLS series IDs for labor market analysis
 */
export const BLS_SERIES = {
  // Unemployment Rate
  UNEMPLOYMENT_RATE: 'LNS14000000',
  UNEMPLOYMENT_WHITE: 'LNS14000003',
  UNEMPLOYMENT_BLACK: 'LNS14000006',
  UNEMPLOYMENT_HISPANIC: 'LNS14000009',

  // Labor Force Participation
  LABOR_FORCE_PARTICIPATION: 'LNS11300000',
  CIVILIAN_EMPLOYMENT: 'LNS11000000',
  EMPLOYMENT_LEVEL: 'LNS12000000',

  // Employment
  NONFARM_PAYROLLS: 'CES0000000001',
  MANUFACTURING_EMPLOYMENT: 'CES3000000001',

  // Consumer Price Index (CPI)
  CPI_ALL_ITEMS: 'CUUR0000SA0',
  CPI_ALL_ITEMS_SA: 'CUSR0000SA0',
  CPI_CORE: 'CUSR0000SA0L2',
  CPI_FOOD: 'CUUR0000SAF',
  CPI_HOUSING: 'CUUR0000SAH',
  CPI_MEDICAL: 'CUUR0000SAM',

  // Producer Price Index (PPI)
  PPI_FINAL_DEMAND: 'WPUFD4',
  PPI_FINAL_DEMAND_SA: 'WPSFD4',
  PPI_SERVICES: 'WPUFD49116',
  PPI_GOODS: 'WPUFD49207',
} as const;

export class BLSProvider extends BaseProvider<BLSConfig> {
  override readonly name = 'BLS';
  override readonly cachePrefix = 'BLS';
  protected override defaultTTL = 30 * 24 * 60 * 60 * 1000; // 30 days (monthly data)

  protected override buildRequestConfig(config: BLSConfig): RequestConfig {
    const params: Record<string, string> = {
      seriesId: config.seriesId,
    };

    if (config.dateRange) {
      params.startYear = String(config.dateRange.startYear);
      params.endYear = String(config.dateRange.endYear);
    } else {
      const endYear = new Date().getFullYear();
      const startYear = endYear - 5;
      params.startYear = String(startYear);
      params.endYear = String(endYear);
    }

    if (config.calculations) {
      params.calculations = 'true';
    }

    if (config.annualAverage) {
      params.annualaverage = 'true';
    }

    return {
      provider: 'bls',
      endpoint: '/timeseries/data',
      params,
    };
  }

  protected override getCacheKeyComponents(config: BLSConfig): CacheKeyComponents {
    const params: Record<string, string | number | boolean> = {
      seriesId: config.seriesId,
    };

    if (config.dateRange) {
      params.startYear = config.dateRange.startYear;
      params.endYear = config.dateRange.endYear;
    }
    if (config.calculations) params.calculations = config.calculations;
    if (config.annualAverage) params.annualAverage = config.annualAverage;

    return {
      provider: this.cachePrefix,
      endpoint: 'timeseries',
      params,
    };
  }

  protected override transformResponse(json: unknown, config: BLSConfig): DataPoint[] {
    const response = json as BLSResponse;

    if (response.status !== 'REQUEST_SUCCEEDED') {
      const messages = response.message?.join(', ') || 'Unknown error';
      throw new DataLayerError(
        `BLS API error: ${messages}`,
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const series = response.Results?.series?.[0];
    if (!series || !Array.isArray(series.data)) {
      throw new DataLayerError(
        'Invalid BLS response format',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    return series.data
      .filter((d) => {
        if (config.annualAverage) return true;
        return d.period !== 'M13' && d.period !== 'A01';
      })
      .map((d) => {
        let dateStr: string;

        if (d.period.startsWith('M')) {
          const month = d.period.replace('M', '').padStart(2, '0');
          dateStr = `${d.year}-${month}-01`;
        } else if (d.period.startsWith('Q')) {
          const quarter = parseInt(d.period.replace('Q', ''));
          const month = ((quarter - 1) * 3 + 1).toString().padStart(2, '0');
          dateStr = `${d.year}-${month}-01`;
        } else {
          dateStr = `${d.year}-12-31`;
        }

        return {
          time: new Date(dateStr).getTime(),
          value: parseFloat(d.value),
        };
      })
      .reverse()
      .filter((dp) => !isNaN(dp.value));
  }

  protected override generateMockData(config: BLSConfig): DataPoint[] {
    const mockData: DataPoint[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5);

    let baseValue = 5;
    let volatility = 0.1;
    let trend = 0;

    if (config.seriesId.startsWith('LNS14')) {
      baseValue = 4.5;
      volatility = 0.15;
      trend = -0.0005;
    } else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
      baseValue = 63;
      volatility = 0.05;
      trend = 0.0002;
    } else if (config.seriesId.startsWith('CES')) {
      baseValue = 150_000_000;
      volatility = 0.002;
      trend = 0.001;
    } else if (config.seriesId.startsWith('CUUR') || config.seriesId.startsWith('CUSR')) {
      baseValue = 250;
      volatility = 0.01;
      trend = 0.002;
    } else if (config.seriesId.startsWith('WP')) {
      baseValue = 180;
      volatility = 0.015;
      trend = 0.0015;
    }

    let currentValue = baseValue;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      currentValue = currentValue * (1 + trend + randomChange);

      if (config.seriesId.startsWith('LNS14')) {
        currentValue = Math.max(2, Math.min(10, currentValue));
      } else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
        currentValue = Math.max(60, Math.min(67, currentValue));
      } else {
        currentValue = Math.max(0, currentValue);
      }

      mockData.push({
        time: currentDate.getTime(),
        value: Math.round(currentValue * 100) / 100,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return mockData;
  }
}
