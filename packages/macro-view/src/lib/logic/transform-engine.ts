import type { DataPoint } from '../db';
import type { DataTransform, TransformOperation } from '../types/transforms';

/**
 * Transform engine for client-side data transformations
 * Applies transforms that cannot be done server-side
 */

/**
 * Apply a single transform operation to data
 */
export function applyTransform(
	data: DataPoint[],
	operation: TransformOperation
): DataPoint[] {
	switch (operation.type) {
		case 'yoy':
			return transformYoY(data, operation.periods || 365);
		case 'mom':
			return transformMoM(data, operation.periods || 30);
		case 'normalize':
			return transformNormalize(data, operation.base || 100);
		case 'normalize_date':
			return transformNormalizeDate(data, operation.date);
		case 'invert':
			return transformInvert(data);
		case 'log':
			return transformLog(data);
		case 'log10':
			return transformLog10(data);
		case 'abs':
			return transformAbs(data);
		case 'cumsum':
			return transformCumSum(data);
		case 'diff':
			return transformDiff(data, operation.periods || 1);
		case 'pct_change':
			return transformPctChange(data, operation.periods || 1);
		case 'rolling_avg':
			return transformRollingAvg(data, operation.window);
		case 'rolling_std':
			return transformRollingStd(data, operation.window);
		case 'scale':
			return transformScale(data, operation.factor);
		case 'offset':
			return transformOffset(data, operation.value);
		case 'clip':
			return transformClip(data, operation.min, operation.max);
		case 'zscore':
			return transformZScore(data);
		case 'rank':
			return transformRank(data);
		default:
			console.warn(`Unsupported transform type:`, operation);
			return data;
	}
}

/**
 * Apply multiple transforms to dataset
 */
export function applyTransforms(data: DataPoint[], transforms: DataTransform[]): DataPoint[] {
	let result = data;
	for (const transform of transforms) {
		result = applyTransform(result, transform.operation);
	}
	return result;
}

/**
 * Year-over-Year percentage change
 */
function transformYoY(data: DataPoint[], periods: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < periods) return { ...point, value: NaN };
		const previousValue = data[i - periods].value ?? 0;
		if (previousValue === 0) return { ...point, value: NaN };
		const yoyChange = (((point.value ?? 0) - previousValue) / previousValue) * 100;
		return { ...point, value: yoyChange };
	});
}

/**
 * Month-over-Month percentage change
 */
function transformMoM(data: DataPoint[], periods: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < periods) return { ...point, value: NaN };
		const previousValue = data[i - periods].value ?? 0;
		if (previousValue === 0) return { ...point, value: NaN };
		const momChange = (((point.value ?? 0) - previousValue) / previousValue) * 100;
		return { ...point, value: momChange };
	});
}

/**
 * Normalize to base value (default 100)
 */
function transformNormalize(data: DataPoint[], base: number): DataPoint[] {
	if (data.length === 0) return data;
	const firstValue = data[0].value ?? 0;
	if (firstValue === 0) return data;
	return data.map((point) => ({
		...point,
		value: ((point.value ?? 0) / firstValue) * base
	}));
}

/**
 * Normalize to specific date
 */
function transformNormalizeDate(data: DataPoint[], date: string): DataPoint[] {
	const targetTime = new Date(date).getTime();
	const basePoint = data.find((d) => d.time === targetTime);
	if (!basePoint || basePoint.value === undefined || basePoint.value === 0) return data;
	return data.map((point) => ({
		...point,
		value: ((point.value ?? 0) / basePoint.value!) * 100
	}));
}

/**
 * Invert values (multiply by -1)
 */
function transformInvert(data: DataPoint[]): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: -(point.value ?? 0)
	}));
}

/**
 * Natural logarithm
 */
function transformLog(data: DataPoint[]): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: (point.value ?? 0) > 0 ? Math.log(point.value!) : NaN
	}));
}

/**
 * Base-10 logarithm
 */
function transformLog10(data: DataPoint[]): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: (point.value ?? 0) > 0 ? Math.log10(point.value!) : NaN
	}));
}

/**
 * Absolute value
 */
function transformAbs(data: DataPoint[]): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: Math.abs(point.value ?? 0)
	}));
}

/**
 * Cumulative sum
 */
function transformCumSum(data: DataPoint[]): DataPoint[] {
	let sum = 0;
	return data.map((point) => {
		sum += point.value ?? 0;
		return { ...point, value: sum };
	});
}

/**
 * Difference from previous value
 */
function transformDiff(data: DataPoint[], periods: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < periods) return { ...point, value: NaN };
		return { ...point, value: (point.value ?? 0) - (data[i - periods].value ?? 0) };
	});
}

/**
 * Percentage change from previous value
 */
function transformPctChange(data: DataPoint[], periods: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < periods) return { ...point, value: NaN };
		const previousValue = data[i - periods].value ?? 0;
		if (previousValue === 0) return { ...point, value: NaN };
		return { ...point, value: (((point.value ?? 0) - previousValue) / previousValue) * 100 };
	});
}

/**
 * Rolling average (simple moving average)
 */
function transformRollingAvg(data: DataPoint[], window: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < window - 1) return { ...point, value: NaN };
		const windowData = data.slice(i - window + 1, i + 1);
		const avg = windowData.reduce((sum, d) => sum + (d.value ?? 0), 0) / window;
		return { ...point, value: avg };
	});
}

/**
 * Rolling standard deviation
 */
function transformRollingStd(data: DataPoint[], window: number): DataPoint[] {
	return data.map((point, i) => {
		if (i < window - 1) return { ...point, value: NaN };
		const windowData = data.slice(i - window + 1, i + 1);
		const avg = windowData.reduce((sum, d) => sum + (d.value ?? 0), 0) / window;
		const variance = windowData.reduce((sum, d) => sum + Math.pow((d.value ?? 0) - avg, 2), 0) / window;
		return { ...point, value: Math.sqrt(variance) };
	});
}

/**
 * Scale by factor
 */
function transformScale(data: DataPoint[], factor: number): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: (point.value ?? 0) * factor
	}));
}

/**
 * Add offset
 */
function transformOffset(data: DataPoint[], offset: number): DataPoint[] {
	return data.map((point) => ({
		...point,
		value: (point.value ?? 0) + offset
	}));
}

/**
 * Clip values to range
 */
function transformClip(data: DataPoint[], min?: number, max?: number): DataPoint[] {
	return data.map((point) => {
		let value = point.value ?? 0;
		if (min !== undefined && value < min) value = min;
		if (max !== undefined && value > max) value = max;
		return { ...point, value };
	});
}

/**
 * Z-score normalization (standardize)
 */
function transformZScore(data: DataPoint[]): DataPoint[] {
	const values = data.map((d) => d.value ?? 0);
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
	const std = Math.sqrt(variance);

	if (std === 0) return data;

	return data.map((point) => ({
		...point,
		value: ((point.value ?? 0) - mean) / std
	}));
}

/**
 * Rank transformation (percentile)
 */
function transformRank(data: DataPoint[]): DataPoint[] {
	const sorted = [...data].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
	return data.map((point) => {
		const rank = sorted.findIndex((d) => d.time === point.time) + 1;
		return { ...point, value: (rank / data.length) * 100 };
	});
}
