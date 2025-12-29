import { test, expect, describe } from 'bun:test';
import { isOHLC, hasValue, getValue, TimeUtils, type DataPoint } from './data-point';

describe('DataPoint utilities', () => {
  describe('isOHLC', () => {
    test('returns true for OHLC data', () => {
      const point: DataPoint = {
        time: 1704067200000,
        open: 100,
        high: 110,
        low: 95,
        close: 105,
      };
      expect(isOHLC(point)).toBe(true);
    });

    test('returns false for value data', () => {
      const point: DataPoint = {
        time: 1704067200000,
        value: 100,
      };
      expect(isOHLC(point)).toBe(false);
    });
  });

  describe('hasValue', () => {
    test('returns true for value data', () => {
      const point: DataPoint = {
        time: 1704067200000,
        value: 100,
      };
      expect(hasValue(point)).toBe(true);
    });

    test('returns false for OHLC data without value', () => {
      const point: DataPoint = {
        time: 1704067200000,
        open: 100,
        high: 110,
        low: 95,
        close: 105,
      };
      expect(hasValue(point)).toBe(false);
    });
  });

  describe('getValue', () => {
    test('prefers close over value', () => {
      const point: DataPoint = {
        time: 1704067200000,
        value: 100,
        close: 105,
      };
      expect(getValue(point)).toBe(105);
    });

    test('uses value when no close', () => {
      const point: DataPoint = {
        time: 1704067200000,
        value: 100,
      };
      expect(getValue(point)).toBe(100);
    });

    test('uses high as fallback', () => {
      const point: DataPoint = {
        time: 1704067200000,
        high: 110,
      };
      expect(getValue(point)).toBe(110);
    });

    test('returns 0 when no values', () => {
      const point: DataPoint = {
        time: 1704067200000,
      };
      expect(getValue(point)).toBe(0);
    });
  });

  describe('TimeUtils', () => {
    const point: DataPoint = { time: 1704067200000, value: 100 }; // 2024-01-01 00:00:00 UTC

    test('toISO converts to ISO string', () => {
      expect(TimeUtils.toISO(point)).toBe('2024-01-01T00:00:00.000Z');
    });

    test('toDate converts to Date object', () => {
      const date = TimeUtils.toDate(point);
      expect(date.getTime()).toBe(1704067200000);
    });

    test('toUnixSeconds converts to seconds', () => {
      expect(TimeUtils.toUnixSeconds(point)).toBe(1704067200);
    });

    test('fromISO converts from ISO string', () => {
      expect(TimeUtils.fromISO('2024-01-01T00:00:00.000Z')).toBe(1704067200000);
    });

    test('fromDate converts from Date', () => {
      expect(TimeUtils.fromDate(new Date(1704067200000))).toBe(1704067200000);
    });

    test('fromUnixSeconds converts from seconds', () => {
      expect(TimeUtils.fromUnixSeconds(1704067200)).toBe(1704067200000);
    });
  });
});
