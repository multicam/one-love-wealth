/**
 * Detect crossover events between two lines
 * @param {Array<{time: number, k: number, d: number}>} data - Indicator data
 * @param {string} direction - 'above' or 'below'
 * @returns {number[]} Array of timestamps where crossover occurred
 */
export function detectCrossover(data, direction = 'above') {
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
 * @param {Array<{time: number, k: number, d: number}>} data - Indicator data
 * @param {number} threshold - Threshold value (e.g., 20 or 80)
 * @param {string} direction - 'above' or 'below'
 * @param {string} line - 'k' or 'd'
 * @returns {number[]} Array of timestamps where threshold was crossed
 */
export function detectThreshold(data, threshold, direction = 'above', line = 'k') {
    const events = [];
    
    for (let i = 1; i < data.length; i++) {
        const prevValue = data[i - 1][line];
        const currValue = data[i][line];
        
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
 * Create a strategy event object
 * @param {string} type - Event type
 * @param {string} name - Event name
 * @param {Object} condition - Event condition
 * @param {number[]} detectedAt - Timestamps
 * @returns {Object}
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
