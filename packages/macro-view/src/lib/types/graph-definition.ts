import type { DataSourceConfig } from './data-provider';
import type { DataTransform } from './transforms';

/**
 * Enhanced graph definition with full parametrization
 */
export interface EnhancedGraphDefinition {
  id: string;
  title: string;
  description: string;

  /**
   * Data sources with full provider configuration
   */
  dataSources: DataSourceConfig[];

  /**
   * Client-side transformations (for ops not in APIs)
   */
  transforms?: DataTransform[];

  /**
   * Chart configuration
   */
  chartConfig: ChartConfig;

  /**
   * Time alignment configuration
   */
  timeAlignment?: TimeAlignmentConfig;
}

export type ChartConfig =
  | LineChartConfig
  | ScatterChartConfig
  | BarChartConfig
  | AreaChartConfig;

interface BaseChartConfig {
  yAxisLog?: boolean;
  dualAxis?: boolean;
}

export interface LineChartConfig extends BaseChartConfig {
  type: 'line';
  smooth?: boolean;
  stepped?: boolean;
}

export interface ScatterChartConfig extends BaseChartConfig {
  type: 'scatter';
  regression?: boolean;
  trendline?: boolean;
}

export interface BarChartConfig extends BaseChartConfig {
  type: 'bar';
  stacked?: boolean;
  horizontal?: boolean;
}

export interface AreaChartConfig extends BaseChartConfig {
  type: 'area';
  filled?: boolean;
  baseline?: number;
}

export interface TimeAlignmentConfig {
  shifts?: Array<{
    seriesIndex: number;
    months: number;
    direction: 'lead' | 'lag';
    description?: string;
  }>;
  recentPoints?: number;
  dateRange?: { start?: string; end?: string };
}

/**
 * Legacy GraphDefinition for backward compatibility
 */
export interface LegacyGraphDefinition {
  id: string;
  title: string;
  description: string;
  dataSources: {
    name: string;
    id: string;
    type: 'fred' | 'coingecko';
    color?: string;
    label?: string;
  }[];
  chartConfig: {
    type: 'line';
    yAxisLog?: boolean;
    dualAxis?: boolean;
    timeShift?: number;
  };
}
