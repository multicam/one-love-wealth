/**
 * Canonical data point with required time (Unix ms) and optional value/OHLC
 */
export interface DataPoint {
  /** Required: Unix timestamp in milliseconds */
  time: number;

  /** Simple value (economic indicators, single prices) */
  value?: number;

  /** OHLC data (candlestick charts) */
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

/**
 * Type guard for OHLC data
 */
export function isOHLC(point: DataPoint): boolean {
  return point.open !== undefined;
}

/**
 * Type guard for simple value data
 */
export function hasValue(point: DataPoint): boolean {
  return point.value !== undefined;
}

/**
 * Get the primary value (prefers close > value > high)
 */
export function getValue(point: DataPoint): number {
  return point.close ?? point.value ?? point.high ?? 0;
}

/**
 * Time conversion utilities for consumers
 */
export const TimeUtils = {
  toISO: (p: DataPoint) => new Date(p.time).toISOString(),
  toDate: (p: DataPoint) => new Date(p.time),
  toUnixSeconds: (p: DataPoint) => Math.floor(p.time / 1000),
  fromISO: (iso: string) => new Date(iso).getTime(),
  fromDate: (date: Date) => date.getTime(),
  fromUnixSeconds: (ts: number) => ts * 1000,
};
