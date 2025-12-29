/**
 * Convert frequency hint to TTL milliseconds
 */
export function frequencyToTTL(frequency) {
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    switch (frequency) {
        case 'realtime':
            return 5 * 60 * 1000; // 5 minutes
        case 'daily':
            return DAY;
        case 'weekly':
            return 7 * DAY;
        case 'monthly':
            return 30 * DAY;
        case 'quarterly':
            return 90 * DAY;
        case 'annual':
            return 365 * DAY;
        default:
            return DAY;
    }
}
