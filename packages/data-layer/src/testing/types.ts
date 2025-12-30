/**
 * Testing infrastructure types
 */

import type { DataSeries } from '../types/series';

export interface TestOptions {
  verbose?: boolean;
  quality?: boolean;
  live?: boolean;
  all?: boolean;
}

export type TestStatus = 'pass' | 'fail' | 'skip';

export interface TestResult {
  provider: string;
  status: TestStatus;
  duration: number;
  dataPoints?: number;
  errors?: string[];
  qualityReport?: QualityReport;
}

export interface QualityReport {
  freshness: FreshnessResult;
  completeness: CompletenessResult;
  format: FormatResult;
}

export interface FreshnessResult {
  lastUpdate: Date;
  ageMs: number;
  maxAgeMs: number;
  isStale: boolean;
  message?: string;
}

export interface CompletenessResult {
  expected: number;
  actual: number;
  percentage: number;
  gaps: number;
  hasMissingData: boolean;
  message?: string;
}

export interface FormatResult {
  valid: boolean;
  issues: string[];
  totalPoints: number;
  validPoints: number;
}

export interface ProviderTestConfig {
  name: string;
  configBuilder: () => any; // Provider-specific config
  maxAgeMs: number; // Max acceptable data age for freshness check
  expectedMinPoints?: number; // Minimum expected data points
}
