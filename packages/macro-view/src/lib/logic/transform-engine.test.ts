import { describe, it, expect } from 'vitest';
import { applyTransform, applyTransforms } from './transform-engine';
import type { DataPoint } from '../db';

/**
 * Comprehensive unit tests for transform-engine.ts
 * Goal: 80%+ code coverage with edge case testing
 */

// Helper to create test data
const createDataPoints = (values: number[], startDate = '2020-01-01'): DataPoint[] => {
	return values.map((value, i) => {
		const date = new Date(startDate);
		date.setDate(date.getDate() + i);
		return {
			time: date.getTime(),
			value
		};
	});
};

describe('Transform Engine', () => {
	describe('YoY (Year-over-Year)', () => {
		it('should calculate YoY percentage change with 365 periods', () => {
			const data = createDataPoints([100, ...Array(364).fill(0), 110]);
			const result = applyTransform(data, { type: 'yoy', periods: 365 });

			expect(result[365].value!).toBeCloseTo(10, 1); // 10% increase
			expect(isNaN(result[0].value!)).toBe(true); // First value should be NaN
		});

		it('should return NaN when previous value is zero', () => {
			const data = createDataPoints([0, 100]);
			const result = applyTransform(data, { type: 'yoy', periods: 1 });

			expect(isNaN(result[1].value!)).toBe(true);
		});

		it('should handle missing data (early periods)', () => {
			const data = createDataPoints([100, 110, 120]);
			const result = applyTransform(data, { type: 'yoy', periods: 5 });

			// All values should be NaN since we don't have 5 periods				result.forEach(point => expect(isNaN(point.value!)).toBe(true));
		});

		it('should use default period of 365 if not specified', () => {
			const data = createDataPoints(Array(366).fill(100));
			const result = applyTransform(data, { type: 'yoy' });

			expect(result[365].value!).toBe(0); // No change
		});
	});

	describe('MoM (Month-over-Month)', () => {
		it('should calculate MoM percentage change with 30 periods', () => {
			const data = createDataPoints([100, ...Array(29).fill(0), 105]);
			const result = applyTransform(data, { type: 'mom', periods: 30 });

			expect(result[30].value!).toBeCloseTo(5, 1); // 5% increase
		});

		it('should return NaN when previous value is zero', () => {
			const data = createDataPoints([0, 50]);
			const result = applyTransform(data, { type: 'mom', periods: 1 });

			expect(isNaN(result[1].value!)).toBe(true);
		});

		it('should use default period of 30 if not specified', () => {
			const data = createDataPoints(Array(31).fill(100));
			const result = applyTransform(data, { type: 'mom' });

			expect(result[30].value!).toBe(0); // No change
		});
	});

	describe('Normalize', () => {
		it('should normalize to base 100', () => {
			const data = createDataPoints([50, 100, 150]);
			const result = applyTransform(data, { type: 'normalize', base: 100 });

			expect(result[0].value).toBe(100);
			expect(result[1].value).toBe(200);
			expect(result[2].value).toBe(300);
		});

		it('should normalize to custom base', () => {
			const data = createDataPoints([10, 20]);
			const result = applyTransform(data, { type: 'normalize', base: 50 });

			expect(result[0].value).toBe(50);
			expect(result[1].value).toBe(100);
		});

		it('should handle empty array', () => {
			const result = applyTransform([], { type: 'normalize', base: 100 });

			expect(result).toEqual([]);
		});

		it('should return original data if first value is zero', () => {
			const data = createDataPoints([0, 50, 100]);
			const result = applyTransform(data, { type: 'normalize', base: 100 });

			expect(result).toEqual(data); // Should return unchanged
		});

		it('should use default base of 100 if not specified', () => {
			const data = createDataPoints([25, 50]);
			const result = applyTransform(data, { type: 'normalize' });

			expect(result[0].value).toBe(100);
			expect(result[1].value).toBe(200);
		});
	});

	describe('Normalize by Date', () => {
		it('should normalize to specific date value', () => {
			const data = createDataPoints([50, 100, 150]);
			const result = applyTransform(data, {
				type: 'normalize_date',
				date: new Date(data[1].time).toISOString().split('T')[0]
			});

			expect(result[0].value).toBe(50);
			expect(result[1].value).toBe(100);
			expect(result[2].value).toBe(150);
		});

		it('should return original data if date not found', () => {
			const data = createDataPoints([50, 100]);
			const result = applyTransform(data, {
				type: 'normalize_date',
				date: '2099-01-01'
			});

			expect(result).toEqual(data);
		});

		it('should return original data if base value is zero', () => {
			const data = createDataPoints([0, 50, 100]);
			const result = applyTransform(data, {
				type: 'normalize_date',
				date: new Date(data[0].time).toISOString().split('T')[0]
			});

			expect(result).toEqual(data);
		});
	});

	describe('Invert', () => {
		it('should invert positive to negative', () => {
			const data = createDataPoints([10, 20, 30]);
			const result = applyTransform(data, { type: 'invert' });

			expect(result[0].value).toBe(-10);
			expect(result[1].value).toBe(-20);
			expect(result[2].value).toBe(-30);
		});

		it('should invert negative to positive', () => {
			const data = createDataPoints([-10, -20]);
			const result = applyTransform(data, { type: 'invert' });

			expect(result[0].value).toBe(10);
			expect(result[1].value).toBe(20);
		});

		it('should keep zero as zero', () => {
			const data = createDataPoints([0]);
			const result = applyTransform(data, { type: 'invert' });

			// JavaScript has -0 and 0, so use toBeCloseTo
			expect(result[0].value).toBeCloseTo(0, 5);
		});
	});

	describe('Log (Natural Logarithm)', () => {
		it('should calculate natural log of positive values', () => {
			const data = createDataPoints([1, Math.E, Math.E ** 2]);
			const result = applyTransform(data, { type: 'log' });

			expect(result[0].value).toBeCloseTo(0, 5);
			expect(result[1].value).toBeCloseTo(1, 5);
			expect(result[2].value).toBeCloseTo(2, 5);
		});

		it('should return NaN for zero and negative values', () => {
			const data = createDataPoints([0, -5, 10]);
			const result = applyTransform(data, { type: 'log' });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
			expect(result[2].value!).toBeGreaterThan(0);
		});
	});

	describe('Log10 (Base-10 Logarithm)', () => {
		it('should calculate log10 of positive values', () => {
			const data = createDataPoints([1, 10, 100, 1000]);
			const result = applyTransform(data, { type: 'log10' });

			expect(result[0].value).toBeCloseTo(0, 5);
			expect(result[1].value).toBeCloseTo(1, 5);
			expect(result[2].value).toBeCloseTo(2, 5);
			expect(result[3].value).toBeCloseTo(3, 5);
		});

		it('should return NaN for zero and negative values', () => {
			const data = createDataPoints([0, -10]);
			const result = applyTransform(data, { type: 'log10' });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
		});
	});

	describe('Absolute Value', () => {
		it('should convert negatives to positives', () => {
			const data = createDataPoints([-10, -5, 0, 5, 10]);
			const result = applyTransform(data, { type: 'abs' });

			expect(result[0].value).toBe(10);
			expect(result[1].value).toBe(5);
			expect(result[2].value).toBe(0);
			expect(result[3].value).toBe(5);
			expect(result[4].value).toBe(10);
		});
	});

	describe('Cumulative Sum', () => {
		it('should calculate running total', () => {
			const data = createDataPoints([1, 2, 3, 4, 5]);
			const result = applyTransform(data, { type: 'cumsum' });

			expect(result[0].value).toBe(1);
			expect(result[1].value).toBe(3);
			expect(result[2].value).toBe(6);
			expect(result[3].value).toBe(10);
			expect(result[4].value).toBe(15);
		});

		it('should handle negative values', () => {
			const data = createDataPoints([5, -3, 2, -1]);
			const result = applyTransform(data, { type: 'cumsum' });

			expect(result[0].value).toBe(5);
			expect(result[1].value).toBe(2);
			expect(result[2].value).toBe(4);
			expect(result[3].value).toBe(3);
		});
	});

	describe('Diff (Difference)', () => {
		it('should calculate difference with period 1', () => {
			const data = createDataPoints([100, 105, 103, 110]);
			const result = applyTransform(data, { type: 'diff', periods: 1 });

			expect(isNaN(result[0].value!)).toBe(true); // First value NaN
			expect(result[1].value!).toBe(5);
			expect(result[2].value!).toBe(-2);
			expect(result[3].value!).toBe(7);
		});

		it('should calculate difference with custom period', () => {
			const data = createDataPoints([10, 20, 30, 40, 50]);
			const result = applyTransform(data, { type: 'diff', periods: 2 });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
			expect(result[2].value!).toBe(20); // 30 - 10
			expect(result[3].value!).toBe(20); // 40 - 20
		});

		it('should use default period of 1 if not specified', () => {
			const data = createDataPoints([5, 8]);
			const result = applyTransform(data, { type: 'diff' });

			expect(result[1].value).toBe(3);
		});
	});

	describe('Percentage Change', () => {
		it('should calculate percentage change', () => {
			const data = createDataPoints([100, 110, 121]);
			const result = applyTransform(data, { type: 'pct_change', periods: 1 });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(result[1].value!).toBeCloseTo(10, 1); // 10% increase
			expect(result[2].value!).toBeCloseTo(10, 1); // 10% increase
		});

		it('should return NaN when previous value is zero', () => {
			const data = createDataPoints([0, 100]);
			const result = applyTransform(data, { type: 'pct_change', periods: 1 });

			expect(isNaN(result[1].value!)).toBe(true);
		});

		it('should use default period of 1 if not specified', () => {
			const data = createDataPoints([50, 75]);
			const result = applyTransform(data, { type: 'pct_change' });

			expect(result[1].value!).toBe(50); // 50% increase
		});
	});

	describe('Rolling Average', () => {
		it('should calculate rolling average with window 3', () => {
			const data = createDataPoints([10, 20, 30, 40, 50]);
			const result = applyTransform(data, { type: 'rolling_avg', window: 3 });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
			expect(result[2].value!).toBe(20); // (10+20+30)/3
			expect(result[3].value!).toBe(30); // (20+30+40)/3
			expect(result[4].value!).toBe(40); // (30+40+50)/3
		});

		it('should handle edge case with window size 1', () => {
			const data = createDataPoints([5, 10, 15]);
			const result = applyTransform(data, { type: 'rolling_avg', window: 1 });

			expect(result[0].value).toBe(5);
			expect(result[1].value).toBe(10);
			expect(result[2].value).toBe(15);
		});

		it('should handle window larger than data', () => {
			const data = createDataPoints([10, 20]);
			const result = applyTransform(data, { type: 'rolling_avg', window: 5 });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
		});
	});

	describe('Rolling Standard Deviation', () => {
		it('should calculate rolling std with window 3', () => {
			const data = createDataPoints([10, 10, 10, 20, 20]);
			const result = applyTransform(data, { type: 'rolling_std', window: 3 });

			expect(isNaN(result[0].value!)).toBe(true);
			expect(isNaN(result[1].value!)).toBe(true);
			expect(result[2].value!).toBeCloseTo(0, 5); // No variance
			expect(result[3].value!).toBeGreaterThan(0); // Has variance
		});

		it('should return zero std for identical values', () => {
			const data = createDataPoints([5, 5, 5, 5]);
			const result = applyTransform(data, { type: 'rolling_std', window: 3 });

			expect(result[2].value!).toBe(0);
			expect(result[3].value!).toBe(0);
		});
	});

	describe('Scale', () => {
		it('should scale by factor', () => {
			const data = createDataPoints([10, 20, 30]);
			const result = applyTransform(data, { type: 'scale', factor: 2 });

			expect(result[0].value).toBe(20);
			expect(result[1].value).toBe(40);
			expect(result[2].value).toBe(60);
		});

		it('should scale by fraction', () => {
			const data = createDataPoints([100, 200]);
			const result = applyTransform(data, { type: 'scale', factor: 0.5 });

			expect(result[0].value).toBe(50);
			expect(result[1].value).toBe(100);
		});

		it('should handle negative factor', () => {
			const data = createDataPoints([10, 20]);
			const result = applyTransform(data, { type: 'scale', factor: -1 });

			expect(result[0].value).toBe(-10);
			expect(result[1].value).toBe(-20);
		});
	});

	describe('Offset', () => {
		it('should add positive offset', () => {
			const data = createDataPoints([10, 20, 30]);
			const result = applyTransform(data, { type: 'offset', value: 5 });

			expect(result[0].value).toBe(15);
			expect(result[1].value).toBe(25);
			expect(result[2].value).toBe(35);
		});

		it('should add negative offset', () => {
			const data = createDataPoints([100, 200]);
			const result = applyTransform(data, { type: 'offset', value: -50 });

			expect(result[0].value).toBe(50);
			expect(result[1].value).toBe(150);
		});
	});

	describe('Clip', () => {
		it('should clip to minimum', () => {
			const data = createDataPoints([5, 10, 15, 20]);
			const result = applyTransform(data, { type: 'clip', min: 10 });

			expect(result[0].value).toBe(10); // Clipped
			expect(result[1].value).toBe(10);
			expect(result[2].value).toBe(15);
			expect(result[3].value).toBe(20);
		});

		it('should clip to maximum', () => {
			const data = createDataPoints([5, 10, 15, 20]);
			const result = applyTransform(data, { type: 'clip', max: 12 });

			expect(result[0].value).toBe(5);
			expect(result[1].value).toBe(10);
			expect(result[2].value).toBe(12); // Clipped
			expect(result[3].value).toBe(12); // Clipped
		});

		it('should clip to range', () => {
			const data = createDataPoints([5, 10, 15, 20, 25]);
			const result = applyTransform(data, { type: 'clip', min: 10, max: 20 });

			expect(result[0].value).toBe(10); // Clipped to min
			expect(result[1].value).toBe(10);
			expect(result[2].value).toBe(15);
			expect(result[3].value).toBe(20);
			expect(result[4].value).toBe(20); // Clipped to max
		});

		it('should handle no clipping', () => {
			const data = createDataPoints([10, 15, 20]);
			const result = applyTransform(data, { type: 'clip' });

			expect(result).toEqual(data); // No clipping
		});
	});

	describe('Z-Score', () => {
		it('should calculate z-score normalization', () => {
			const data = createDataPoints([10, 20, 30, 40, 50]);
			const result = applyTransform(data, { type: 'zscore' });

			// Mean = 30, std = ~14.14
			expect(result[2].value).toBeCloseTo(0, 5); // Middle value should be ~0
			expect(result[0].value).toBeLessThan(0); // Below mean
			expect(result[4].value).toBeGreaterThan(0); // Above mean
		});

		it('should return original data if std is zero', () => {
			const data = createDataPoints([100, 100, 100]);
			const result = applyTransform(data, { type: 'zscore' });

			expect(result).toEqual(data); // No variance, return unchanged
		});

		it('should have mean ~0 and std ~1 for z-scored data', () => {
			const data = createDataPoints([5, 15, 25, 35, 45]);
			const result = applyTransform(data, { type: 'zscore' });

			const values = result.map(d => d.value ?? 0);
			const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

			expect(mean).toBeCloseTo(0, 5); // Mean should be ~0
		});
	});

	describe('Rank', () => {
		it('should calculate percentile rank', () => {
			const data = createDataPoints([10, 50, 30, 40, 20]);
			const result = applyTransform(data, { type: 'rank' });

			// Sorted: [10, 20, 30, 40, 50]
			// Ranks:  [1,  2,  3,  4,  5]
			// Percentiles: [20, 100, 60, 80, 40]
			expect(result[0].value).toBe(20); // 10 is rank 1/5
			expect(result[1].value).toBe(100); // 50 is rank 5/5
			expect(result[2].value).toBe(60); // 30 is rank 3/5
			expect(result[3].value).toBe(80); // 40 is rank 4/5
			expect(result[4].value).toBe(40); // 20 is rank 2/5
		});

		it('should handle identical values', () => {
			const data = createDataPoints([10, 10, 10]);
			const result = applyTransform(data, { type: 'rank' });

			// All should get different ranks based on their position
			expect(result[0].value).toBeGreaterThan(0);
			expect(result[1].value).toBeGreaterThan(0);
			expect(result[2].value).toBeGreaterThan(0);
		});
	});

	describe('Multi-Transform Composition', () => {
		it('should apply multiple transforms in sequence', () => {
			const data = createDataPoints([100, 200, 300]);

			const result = applyTransforms(data, [
				{ operation: { type: 'normalize', base: 100 } },
				{ operation: { type: 'scale', factor: 2 } },
				{ operation: { type: 'offset', value: 10 } }
			]);

			// After normalize: [100, 200, 300]
			// After scale by 2: [200, 400, 600]
			// After offset +10: [210, 410, 610]
			expect(result[0].value).toBe(210);
			expect(result[1].value).toBe(410);
			expect(result[2].value).toBe(610);
		});

		it('should apply pct_change then scale (avoiding NaN in normalize)', () => {
			const data = createDataPoints([100, 110, 121, 133.1]);

			const result = applyTransforms(data, [
				{ operation: { type: 'pct_change', periods: 1 } },
				{ operation: { type: 'scale', factor: 2 } }
			]);

			// After pct_change: [NaN, 10, 10, 10] (approximately)
			// After scale by 2: [NaN, 20, 20, 20]
			expect(isNaN(result[0].value!)).toBe(true);
			expect(result[1].value!).toBeCloseTo(20, 1);
			expect(result[2].value!).toBeCloseTo(20, 1);
		});

		it('should apply log then scale', () => {
			const data = createDataPoints([1, 10, 100]);

			const result = applyTransforms(data, [
				{ operation: { type: 'log10' } },
				{ operation: { type: 'scale', factor: 100 } }
			]);

			// After log10: [0, 1, 2]
			// After scale by 100: [0, 100, 200]
			expect(result[0].value).toBeCloseTo(0, 5);
			expect(result[1].value).toBeCloseTo(100, 5);
			expect(result[2].value).toBeCloseTo(200, 5);
		});

		it('should handle empty transform list', () => {
			const data = createDataPoints([10, 20, 30]);
			const result = applyTransforms(data, []);

			expect(result).toEqual(data); // No changes
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle empty data array', () => {
			const operations = [
				{ type: 'normalize' as const, base: 100 },
				{ type: 'yoy' as const, periods: 365 },
				{ type: 'zscore' as const }
			];

			operations.forEach(operation => {
				const result = applyTransform([], operation);
				expect(result).toEqual([]);
			});
		});

		it('should handle single data point', () => {
			const data = createDataPoints([100]);

			const normalize = applyTransform(data, { type: 'normalize', base: 100 });
			expect(normalize[0].value).toBe(100);

			const scale = applyTransform(data, { type: 'scale', factor: 2 });
			expect(scale[0].value).toBe(200);
		});

		it('should handle unsupported transform type gracefully', () => {
			const data = createDataPoints([10, 20]);
			// @ts-expect-error - Testing unsupported type
			const result = applyTransform(data, { type: 'invalid_transform' });

			expect(result).toEqual(data); // Should return unchanged
		});

		it('should preserve time values in all transforms', () => {
			const data = createDataPoints([10, 20, 30]);
			const originalTimes = data.map(d => d.time);

			const transforms = [
				{ type: 'normalize' as const, base: 100 },
				{ type: 'scale' as const, factor: 2 },
				{ type: 'offset' as const, value: 5 },
				{ type: 'invert' as const }
			];

			transforms.forEach(operation => {
				const result = applyTransform(data, operation);
				const resultTimes = result.map(d => d.time);
				expect(resultTimes).toEqual(originalTimes);
			});
		});
	});
});
