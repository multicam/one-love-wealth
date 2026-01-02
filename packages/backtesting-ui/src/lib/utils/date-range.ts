/**
 * Date Range Utilities
 * Helper functions for working with backtest date ranges
 */

import type { DateRangePreset } from '../config/defaults';
import { DATE_RANGE_PRESETS } from '../config/defaults';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Calculate date range from years lookback
 *
 * @param years - Number of years to look back
 * @param endDate - End date (defaults to today)
 * @returns DateRange object
 *
 * @example
 * calculateDateRange(5) // Last 5 years from today
 * calculateDateRange(10, new Date('2023-12-31')) // 10 years ending Dec 31, 2023
 */
export function calculateDateRange(years: number, endDate: Date = new Date()): DateRange {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - years);

  return { start, end };
}

/**
 * Get date range from preset
 *
 * @param preset - Preset name ('1y', '5y', etc.)
 * @param endDate - End date (defaults to today)
 * @returns DateRange object
 *
 * @example
 * getPresetDateRange('5y') // Last 5 years
 * getPresetDateRange('max') // Last 50 years (will be clamped to data availability)
 */
export function getPresetDateRange(
  preset: DateRangePreset,
  endDate: Date = new Date()
): DateRange {
  const config = DATE_RANGE_PRESETS[preset];
  return calculateDateRange(config.years, endDate);
}

/**
 * Format date for Yahoo Finance API (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert date range to Yahoo Finance period
 * Maps common ranges to Yahoo's period parameter
 *
 * @param range - Date range
 * @returns Yahoo period string or null if custom range
 *
 * @example
 * dateRangeToYahooPeriod({ start: subYears(new Date(), 1), end: new Date() }) // '1y'
 */
export function dateRangeToYahooPeriod(range: DateRange): string | null {
  const diffMs = range.end.getTime() - range.start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.25;

  // Map to closest Yahoo period
  if (diffDays <= 1) return '1d';
  if (diffDays <= 5) return '5d';
  if (diffDays <= 30) return '1mo';
  if (diffDays <= 90) return '3mo';
  if (diffDays <= 180) return '6mo';
  if (diffYears <= 1.5) return '1y';
  if (diffYears <= 2.5) return '2y';
  if (diffYears <= 5.5) return '5y';
  if (diffYears <= 10.5) return '10y';

  // For very long ranges, use 'max' or return null for custom
  return diffYears > 20 ? 'max' : null;
}

/**
 * Calculate trading days between two dates (rough estimate)
 * Assumes ~252 trading days per year
 *
 * @param start - Start date
 * @param end - End date
 * @returns Estimated trading days
 */
export function estimateTradingDays(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const tradingDaysPerYear = 252;
  const calendarDaysPerYear = 365.25;

  return Math.round((diffDays / calendarDaysPerYear) * tradingDaysPerYear);
}

/**
 * Format date range for display
 *
 * @param range - Date range
 * @returns Formatted string
 *
 * @example
 * formatDateRange({ start: new Date('2020-01-01'), end: new Date('2025-01-01') })
 * // "Jan 1, 2020 - Jan 1, 2025"
 */
export function formatDateRange(range: DateRange): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const startStr = range.start.toLocaleDateString('en-US', formatOptions);
  const endStr = range.end.toLocaleDateString('en-US', formatOptions);

  return `${startStr} - ${endStr}`;
}

/**
 * Get date range duration in human-readable format
 *
 * @param range - Date range
 * @returns Duration string
 *
 * @example
 * getDateRangeDuration({ start: subYears(new Date(), 5), end: new Date() })
 * // "5 years"
 */
export function getDateRangeDuration(range: DateRange): string {
  const diffMs = range.end.getTime() - range.start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffYears = diffDays / 365.25;

  if (diffYears >= 1) {
    const years = Math.round(diffYears * 10) / 10;
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  if (diffDays >= 30) {
    const months = Math.round(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}

/**
 * Validate date range
 * Checks for common issues
 *
 * @param range - Date range to validate
 * @returns Validation result
 */
export function validateDateRange(range: DateRange): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  // Check if start is before end
  if (range.start >= range.end) {
    return {
      valid: false,
      error: 'Start date must be before end date',
    };
  }

  // Check if range is too short
  const diffMs = range.end.getTime() - range.start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    return {
      valid: false,
      error: 'Date range must be at least 30 days for meaningful backtesting',
    };
  }

  // Warning for very short ranges
  if (diffDays < 365) {
    return {
      valid: true,
      warning: 'Date range is less than 1 year. Results may not be statistically significant.',
    };
  }

  // Warning for future dates
  const now = new Date();
  if (range.end > now) {
    return {
      valid: false,
      error: 'End date cannot be in the future',
    };
  }

  // Check if start date is too far in the past (data may not be available)
  const oldestReasonableDate = new Date('1990-01-01');
  if (range.start < oldestReasonableDate) {
    return {
      valid: true,
      warning: 'Start date is very old. Data may not be available for all symbols.',
    };
  }

  return { valid: true };
}

/**
 * Clamp date range to available data
 * Used when 'max' is selected but data doesn't go back that far
 *
 * @param range - Requested date range
 * @param earliestAvailable - Earliest available data date
 * @returns Clamped date range
 */
export function clampDateRange(range: DateRange, earliestAvailable: Date): DateRange {
  return {
    start: range.start < earliestAvailable ? earliestAvailable : range.start,
    end: range.end,
  };
}

/**
 * Convert date to Unix timestamp (milliseconds)
 *
 * @param date - Date to convert
 * @returns Unix timestamp in milliseconds
 */
export function dateToUnixMs(date: Date): number {
  return date.getTime();
}

/**
 * Convert Unix timestamp to Date
 *
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns Date object
 */
export function unixMsToDate(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Get today's date at midnight
 *
 * @returns Date object for today at 00:00:00
 */
export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if two date ranges overlap
 *
 * @param range1 - First date range
 * @param range2 - Second date range
 * @returns True if ranges overlap
 */
export function dateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}
