/**
 * @typedef {Object} StochasticPoint
 * @property {number} time
 * @property {number} k
 * @property {number} d
 */

/**
 * Detect crossover events between two lines
 * @param {StochasticPoint[]} data - Indicator data
 * @param {'above' | 'below'} direction - 'above' or 'below'
 * @returns {number[]} Array of timestamps where crossover occurred
 */
export function detectCrossover(data, direction = 'above') {
    /** @type {number[]} */
    const events = [];
    
    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        
        if (direction === 'above') {
            // %K crosses above %D
            if (prev.k <= prev.d && curr.k > curr.d) {
                events.push(curr.time);
            }
        } else {
            // %K crosses below %D
            if (prev.k >= prev.d && curr.k < curr.d) {
                events.push(curr.time);
            }
        }
    }
    
    return events;
}

/**
 * Detect threshold crossing events
 * @param {StochasticPoint[]} data - Indicator data
 * @param {number} threshold - Threshold value (e.g., 20 or 80)
 * @param {'above' | 'below'} direction - 'above' or 'below'
 * @param {'k' | 'd'} line - 'k' or 'd'
 * @returns {number[]} Array of timestamps where threshold was crossed
 */
export function detectThreshold(data, threshold, direction = 'above', line = 'k') {
    /** @type {number[]} */
    const events = [];
    
    for (let i = 1; i < data.length; i++) {
        const prevValue = line === 'k' ? data[i - 1].k : data[i - 1].d;
        const currValue = line === 'k' ? data[i].k : data[i].d;
        
        if (direction === 'above') {
            if (prevValue <= threshold && currValue > threshold) {
                events.push(data[i].time);
            }
        } else {
            if (prevValue >= threshold && currValue < threshold) {
                events.push(data[i].time);
            }
        }
    }
    
    return events;
}

/**
 * Generate unique event ID
 * @returns {string}
 */
export function generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * @typedef {Object} EventCondition
 * @property {string} [type]
 * @property {number} [threshold]
 * @property {string} [direction]
 */

/**
 * @typedef {Object} StrategyEvent
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {EventCondition} condition
 * @property {number[]} detectedAt
 * @property {string} createdAt
 */

/**
 * Create a strategy event object
 * @param {string} type - Event type
 * @param {string} name - Event name
 * @param {EventCondition} condition - Event condition
 * @param {number[]} detectedAt - Timestamps
 * @returns {StrategyEvent}
 */
export function createEvent(type, name, condition, detectedAt = []) {
    return {
        id: generateEventId(),
        type,
        name,
        condition,
        detectedAt,
        createdAt: new Date().toISOString()
    };
}
