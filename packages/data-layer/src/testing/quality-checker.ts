/**
 * Data quality validation for time series data
 */

import type { DataSeries } from '../types/series';
import type { DataPoint } from '../types/data-point';
import type {
  FreshnessResult,
  CompletenessResult,
  FormatResult,
  QualityReport,
} from './types';

/**
 * Check if data is fresh (not stale)
 */
export function checkDataFreshness(
  series: DataSeries,
  maxAgeMs: number
): FreshnessResult {
  if (!series.data || series.data.length === 0) {
    return {
      lastUpdate: new Date(0),
      ageMs: Infinity,
      maxAgeMs,
      isStale: true,
      message: 'No data points available',
    };
  }

  const lastPoint = series.data[series.data.length - 1];
  if (!lastPoint) {
    return {
      lastUpdate: new Date(0),
      ageMs: Infinity,
      maxAgeMs,
      isStale: true,
      message: 'Last data point is undefined',
    };
  }
  const age = Date.now() - lastPoint.time;

  return {
    lastUpdate: new Date(lastPoint.time),
    ageMs: age,
    maxAgeMs,
    isStale: age > maxAgeMs,
    message:
      age > maxAgeMs
        ? `Data is ${Math.floor(age / (24 * 60 * 60 * 1000))} days old (max: ${Math.floor(maxAgeMs / (24 * 60 * 60 * 1000))} days)`
        : 'Data is fresh',
  };
}

/**
 * Check data completeness (gaps in time series)
 */
export function checkDataCompleteness(
  series: DataSeries,
  expectedMinPoints?: number
): CompletenessResult {
  const actual = series.data.length;
  const expected = expectedMinPoints || actual;

  if (actual === 0) {
    return {
      expected,
      actual: 0,
      percentage: 0,
      gaps: 0,
      hasMissingData: true,
      message: 'No data points',
    };
  }

  // Count gaps in time series (check if point has no valid values)
  const gaps = series.data.filter((point) => {
    const hasValue =
      point.value !== null &&
      point.value !== undefined &&
      !isNaN(point.value || 0);
    const hasClose =
      point.close !== null &&
      point.close !== undefined &&
      !isNaN(point.close || 0);
    const hasOpen =
      point.open !== null && point.open !== undefined && !isNaN(point.open || 0);

    // Point has a gap if it has no valid value, close, or open
    return !hasValue && !hasClose && !hasOpen;
  }).length;

  const percentage = (actual / expected) * 100;
  const hasMissingData = actual < expected || gaps > 0;

  return {
    expected,
    actual,
    percentage,
    gaps,
    hasMissingData,
    message: hasMissingData
      ? `Found ${gaps} gaps, ${actual}/${expected} points (${percentage.toFixed(1)}%)`
      : 'Complete data',
  };
}

/**
 * Check data format validity
 */
export function checkDataFormat(series: DataSeries): FormatResult {
  const issues: string[] = [];
  let validPoints = 0;

  for (let i = 0; i < series.data.length; i++) {
    const point = series.data[i];
    const pointNum = i + 1;

    if (!point) {
      issues.push(`Point ${pointNum}: undefined`);
      continue;
    }

    // Check required time field
    if (!point.time || typeof point.time !== 'number') {
      issues.push(`Point ${pointNum}: Invalid time field`);
      continue;
    }

    // Check time is valid Unix timestamp
    if (point.time < 0 || point.time > Date.now() + 86400000) {
      // Allow 1 day future
      issues.push(
        `Point ${pointNum}: Time out of valid range (${new Date(point.time).toISOString()})`
      );
    }

    // Check for at least one value field
    const hasValue =
      point.value !== undefined ||
      point.close !== undefined ||
      point.open !== undefined;
    if (!hasValue) {
      issues.push(`Point ${pointNum}: No value fields (value/close/open)`);
      continue;
    }

    // Check values are numbers
    if (point.value !== undefined && typeof point.value !== 'number') {
      issues.push(`Point ${pointNum}: value is not a number`);
      continue;
    }

    if (point.close !== undefined && typeof point.close !== 'number') {
      issues.push(`Point ${pointNum}: close is not a number`);
      continue;
    }

    // Check for NaN or Infinity
    if (point.value !== undefined && !isFinite(point.value)) {
      issues.push(`Point ${pointNum}: value is NaN or Infinity`);
      continue;
    }

    if (point.close !== undefined && !isFinite(point.close)) {
      issues.push(`Point ${pointNum}: close is NaN or Infinity`);
      continue;
    }

    validPoints++;
  }

  const totalPoints = series.data.length;
  const valid = issues.length === 0;

  return {
    valid,
    issues: issues.slice(0, 10), // Limit to first 10 issues
    totalPoints,
    validPoints,
  };
}

/**
 * Run all quality checks on a data series
 */
export function runQualityChecks(
  series: DataSeries,
  maxAgeMs: number,
  expectedMinPoints?: number
): QualityReport {
  return {
    freshness: checkDataFreshness(series, maxAgeMs),
    completeness: checkDataCompleteness(series, expectedMinPoints),
    format: checkDataFormat(series),
  };
}

/**
 * Get max acceptable age for a provider (in milliseconds)
 */
export function getMaxAgeForProvider(providerName: string): number {
  const maxAges: Record<string, number> = {
    // Real-time/High frequency (5 minutes)
    coingecko: 5 * 60 * 1000,
    hyperliquid: 5 * 60 * 1000,

    // Daily updates (2 days)
    fred: 2 * 24 * 60 * 60 * 1000,
    yahoo: 2 * 24 * 60 * 60 * 1000,
    treasury: 2 * 24 * 60 * 60 * 1000,
    alphavantage: 2 * 24 * 60 * 60 * 1000,
    quandl: 2 * 24 * 60 * 60 * 1000,

    // Monthly/Quarterly updates (60 days)
    bls: 60 * 24 * 60 * 60 * 1000,
    worldbank: 60 * 24 * 60 * 60 * 1000,
    imf: 60 * 24 * 60 * 60 * 1000,
    oecd: 60 * 24 * 60 * 60 * 1000,
  };

  return maxAges[providerName.toLowerCase()] || 7 * 24 * 60 * 60 * 1000; // Default: 7 days
}
