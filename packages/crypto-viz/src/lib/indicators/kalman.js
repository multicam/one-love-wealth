/**
 * Kalman Filter for price data
 * A simple 1D Kalman filter implementation for smoothing price series
 * 
 * @param {Array<{time: number, open: number, high: number, low: number, close: number}>} candles
 * @param {number} processNoise - Process noise covariance Q (higher = more responsive, default 0.01)
 * @param {number} measurementNoise - Measurement noise covariance R (higher = smoother, default 0.1)
 * @returns {Array<{time: number, price: number, filtered: number, crossover: 'up' | 'down' | null}>}
 */
export function calculateKalman(candles, processNoise = 0.01, measurementNoise = 0.1) {
    if (!candles || candles.length < 2) {
        return [];
    }

    const result = [];
    
    // Initial state
    let x = candles[0].close; // State estimate (filtered price)
    let p = 1; // Error covariance estimate
    
    const Q = processNoise; // Process noise covariance
    const R = measurementNoise; // Measurement noise covariance
    
    let prevPrice = candles[0].close;
    let prevFiltered = x;
    
    for (let i = 0; i < candles.length; i++) {
        const price = candles[i].close;
        
        // Prediction step
        // x_pred = x (state transition is identity for random walk model)
        // p_pred = p + Q
        const pPred = p + Q;
        
        // Update step
        // Kalman gain: K = p_pred / (p_pred + R)
        const K = pPred / (pPred + R);
        
        // Updated state estimate: x = x_pred + K * (measurement - x_pred)
        x = x + K * (price - x);
        
        // Updated error covariance: p = (1 - K) * p_pred
        p = (1 - K) * pPred;
        
        // Detect crossover
        let crossover = null;
        if (i > 0) {
            const prevAbove = prevPrice > prevFiltered;
            const currAbove = price > x;
            
            if (!prevAbove && currAbove) {
                crossover = 'up'; // Price crossed above filter (bullish)
            } else if (prevAbove && !currAbove) {
                crossover = 'down'; // Price crossed below filter (bearish)
            }
        }
        
        result.push({
            time: candles[i].time,
            price: price,
            filtered: x,
            crossover: crossover
        });
        
        prevPrice = price;
        prevFiltered = x;
    }
    
    return result;
}

/**
 * Extract crossover points from Kalman data
 * @param {Array<{time: number, price: number, filtered: number, crossover: 'up' | 'down' | null}>} kalmanData
 * @returns {Array<{time: number, value: number, direction: 'up' | 'down'}>}
 */
export function extractCrossovers(kalmanData) {
    return kalmanData
        .filter(d => d.crossover !== null)
        .map(d => ({
            time: d.time,
            value: d.price,
            direction: d.crossover
        }));
}
