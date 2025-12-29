/**
 * Type guard for OHLC data
 */
export function isOHLC(point) {
    return point.open !== undefined;
}
/**
 * Type guard for simple value data
 */
export function hasValue(point) {
    return point.value !== undefined;
}
/**
 * Get the primary value (prefers close > value > high)
 */
export function getValue(point) {
    return point.close ?? point.value ?? point.high ?? 0;
}
/**
 * Time conversion utilities for consumers
 */
export const TimeUtils = {
    toISO: (p) => new Date(p.time).toISOString(),
    toDate: (p) => new Date(p.time),
    toUnixSeconds: (p) => Math.floor(p.time / 1000),
    fromISO: (iso) => new Date(iso).getTime(),
    fromDate: (date) => date.getTime(),
    fromUnixSeconds: (ts) => ts * 1000,
};
