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
export declare function isOHLC(point: DataPoint): boolean;
/**
 * Type guard for simple value data
 */
export declare function hasValue(point: DataPoint): boolean;
/**
 * Get the primary value (prefers close > value > high)
 */
export declare function getValue(point: DataPoint): number;
/**
 * Time conversion utilities for consumers
 */
export declare const TimeUtils: {
    toISO: (p: DataPoint) => string;
    toDate: (p: DataPoint) => Date;
    toUnixSeconds: (p: DataPoint) => number;
    fromISO: (iso: string) => number;
    fromDate: (date: Date) => number;
    fromUnixSeconds: (ts: number) => number;
};
//# sourceMappingURL=data-point.d.ts.map