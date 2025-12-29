import type { DataPoint } from '../db';
import type { DataTransform, TransformOperation } from '../types/transforms';

/**
 * Apply a series of transformations to time series data
 *
 * @param data - Array of data series (each series is DataPoint[])
 * @param transforms - Array of transformations to apply
 * @returns Transformed data series
 */
export function applyTransforms(
  data: DataPoint[][],
  transforms: DataTransform[]
): DataPoint[][] {
  let result = data.map(series => [...series]);

  for (const transform of transforms) {
    if (transform.seriesIndex !== undefined) {
      // Apply to specific series
      result[transform.seriesIndex] = applyOperation(
        result[transform.seriesIndex],
        transform.operation,
        result
      );
    } else {
      // Apply to all series
      result = result.map(series => applyOperation(series, transform.operation, result));
    }
  }

  return result;
}

/**
 * Apply a single transformation operation to a series
 */
function applyOperation(
  series: DataPoint[],
  operation: TransformOperation,
  allSeries: DataPoint[][]
): DataPoint[] {
  switch (operation.type) {
    case 'yoy':
      return calculateChange(series, operation.periods || 12, 'percent');
    case 'mom':
      return calculateChange(series, operation.periods || 1, 'percent');
    case 'normalize':
      return normalize(series, operation.base || 100);
    case 'normalize_date':
      return normalizeToDate(series, operation.date);
    case 'invert':
      return series.map(d => ({ ...d, value: -d.value }));
    case 'log':
      return series.map(d => ({ ...d, value: Math.log(d.value) }));
    case 'log10':
      return series.map(d => ({ ...d, value: Math.log10(d.value) }));
    case 'abs':
      return series.map(d => ({ ...d, value: Math.abs(d.value) }));
    case 'cumsum':
      return cumulativeSum(series);
    case 'diff':
      return calculateChange(series, operation.periods || 1, 'absolute');
    case 'pct_change':
      return calculateChange(series, operation.periods || 1, 'percent');
    case 'rolling_avg':
      return rollingWindow(series, operation.window, 'avg');
    case 'rolling_std':
      return rollingWindow(series, operation.window, 'std');
    case 'ratio':
      return calculateRatio(series, allSeries[operation.dividendIndex]);
    case 'scale':
      return series.map(d => ({ ...d, value: d.value * operation.factor }));
    case 'offset':
      return series.map(d => ({ ...d, value: d.value + operation.value }));
    case 'clip':
      return series.map(d => ({
        ...d,
        value: Math.max(
          operation.min ?? -Infinity,
          Math.min(operation.max ?? Infinity, d.value)
        )
      }));
    case 'zscore':
      return zScore(series);
    case 'rank':
      return percentileRank(series);
    case 'resample':
      return resample(series, operation.frequency);
    default:
      return series;
  }
}

/**
 * Calculate period-over-period change (absolute or percent)
 *
 * @param series - Input data series
 * @param periods - Number of periods to look back (12 for YoY, 1 for MoM)
 * @param type - 'absolute' for difference, 'percent' for percentage change
 * @returns Transformed series with NaN values filtered out
 */
function calculateChange(
  series: DataPoint[],
  periods: number,
  type: 'absolute' | 'percent'
): DataPoint[] {
  return series.map((point, i) => {
    if (i < periods) return { ...point, value: NaN };
    const prevValue = series[i - periods].value;
    if (type === 'percent') {
      return { ...point, value: ((point.value - prevValue) / prevValue) * 100 };
    }
    return { ...point, value: point.value - prevValue };
  }).filter(d => !isNaN(d.value));
}

/**
 * Normalize series to a base value at the start
 *
 * @param series - Input data series
 * @param base - Base value (default 100)
 * @returns Normalized series
 */
function normalize(series: DataPoint[], base: number): DataPoint[] {
  if (series.length === 0) return series;
  const firstValue = series[0].value;
  return series.map(d => ({ ...d, value: (d.value / firstValue) * base }));
}

/**
 * Normalize series to a specific date
 *
 * @param series - Input data series
 * @param date - Date to normalize to (ISO format YYYY-MM-DD)
 * @returns Normalized series (base 100 at specified date)
 */
function normalizeToDate(series: DataPoint[], date: string): DataPoint[] {
  const basePoint = series.find(d => d.date === date);
  if (!basePoint) return series;
  return series.map(d => ({ ...d, value: (d.value / basePoint.value) * 100 }));
}

/**
 * Calculate cumulative sum
 *
 * @param series - Input data series
 * @returns Cumulative sum series
 */
function cumulativeSum(series: DataPoint[]): DataPoint[] {
  let sum = 0;
  return series.map(d => {
    sum += d.value;
    return { ...d, value: sum };
  });
}

/**
 * Calculate rolling window statistic (average or standard deviation)
 *
 * @param series - Input data series
 * @param window - Window size
 * @param operation - 'avg' for moving average, 'std' for rolling standard deviation
 * @returns Transformed series with NaN values filtered out
 */
function rollingWindow(
  series: DataPoint[],
  window: number,
  operation: 'avg' | 'std'
): DataPoint[] {
  return series.map((point, i) => {
    if (i < window - 1) return { ...point, value: NaN };
    const windowValues = series.slice(i - window + 1, i + 1).map(d => d.value);
    let result: number;
    if (operation === 'avg') {
      result = windowValues.reduce((a, b) => a + b, 0) / window;
    } else {
      const mean = windowValues.reduce((a, b) => a + b, 0) / window;
      const variance = windowValues.reduce((a, b) => a + (b - mean) ** 2, 0) / window;
      result = Math.sqrt(variance);
    }
    return { ...point, value: result };
  }).filter(d => !isNaN(d.value));
}

/**
 * Calculate ratio between two series (numerator / denominator)
 *
 * @param numerator - Numerator series
 * @param denominator - Denominator series
 * @returns Ratio series (only includes dates present in both series)
 */
function calculateRatio(numerator: DataPoint[], denominator: DataPoint[]): DataPoint[] {
  const denomMap = new Map(denominator.map(d => [d.date, d.value]));
  return numerator
    .filter(d => denomMap.has(d.date))
    .map(d => ({ ...d, value: d.value / denomMap.get(d.date)! }));
}

/**
 * Calculate z-score (standardize to mean=0, std=1)
 *
 * @param series - Input data series
 * @returns Z-score normalized series
 */
function zScore(series: DataPoint[]): DataPoint[] {
  const values = series.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  return series.map(d => ({ ...d, value: (d.value - mean) / std }));
}

/**
 * Calculate percentile rank (0-100)
 *
 * @param series - Input data series
 * @returns Percentile rank series
 */
function percentileRank(series: DataPoint[]): DataPoint[] {
  const sorted = [...series].sort((a, b) => a.value - b.value);
  const ranks = new Map(sorted.map((d, i) => [d.date, (i / (series.length - 1)) * 100]));
  return series.map(d => ({ ...d, value: ranks.get(d.date)! }));
}

/**
 * Resample series to different frequency
 *
 * @param series - Input data series
 * @param frequency - Target frequency ('d', 'w', 'm', 'q', 'a')
 * @returns Resampled series (averaged within each period)
 */
function resample(series: DataPoint[], frequency: 'd' | 'w' | 'm' | 'q' | 'a'): DataPoint[] {
  const groups = new Map<string, DataPoint[]>();
  for (const point of series) {
    const key = getPeriodKey(point.date, frequency);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(point);
  }
  return Array.from(groups.entries()).map(([key, points]) => ({
    date: points[points.length - 1].date,
    value: points.reduce((a, b) => a + b.value, 0) / points.length
  }));
}

/**
 * Get period key for resampling
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param frequency - Target frequency
 * @returns Period key string
 */
function getPeriodKey(date: string, frequency: 'd' | 'w' | 'm' | 'q' | 'a'): string {
  const d = new Date(date);
  switch (frequency) {
    case 'd': return date;
    case 'w': return `${d.getFullYear()}-W${Math.ceil((d.getDate() + d.getDay()) / 7)}`;
    case 'm': return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    case 'q': return `${d.getFullYear()}-Q${Math.ceil((d.getMonth() + 1) / 3)}`;
    case 'a': return d.getFullYear().toString();
  }
}
