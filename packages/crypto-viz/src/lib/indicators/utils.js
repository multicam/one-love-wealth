/**
 * Calculate Simple Moving Average
 * @param {number[]} values - Array of values
 * @param {number} period - SMA period
 * @returns {number[]} SMA values (shorter array, starts at index period-1)
 */
export function sma(values, period) {
    /** @type {number[]} */
    const result = [];
    for (let i = period - 1; i < values.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += values[i - j];
        }
        result.push(sum / period);
    }
    return result;
}

/**
 * Find highest value in a window
 * @param {number[]} values - Array of values
 * @param {number} period - Window size
 * @param {number} index - Current index
 * @returns {number} Highest value
 */
export function highest(values, period, index) {
    let max = -Infinity;
    const start = Math.max(0, index - period + 1);
    for (let i = start; i <= index; i++) {
        if (values[i] > max) max = values[i];
    }
    return max;
}

/**
 * Find lowest value in a window
 * @param {number[]} values - Array of values
 * @param {number} period - Window size
 * @param {number} index - Current index
 * @returns {number} Lowest value
 */
export function lowest(values, period, index) {
    let min = Infinity;
    const start = Math.max(0, index - period + 1);
    for (let i = start; i <= index; i++) {
        if (values[i] < min) min = values[i];
    }
    return min;
}
