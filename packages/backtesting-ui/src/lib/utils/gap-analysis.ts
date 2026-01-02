/**
 * Data Gap Analysis Utilities
 * Analyzes gaps in historical data and categorizes them
 */

export type GapReason = 'weekend' | 'holiday' | 'missing' | 'multi-symbol' | 'unknown';

export interface GapInfo {
  /** Gap start index */
  startIndex: number;
  /** Gap end index */
  endIndex: number;
  /** Gap start time */
  startTime: number;
  /** Gap end time */
  endTime: number;
  /** Number of missing bars */
  barsMissing: number;
  /** Reason for gap */
  reason: GapReason;
  /** Affected symbols (for multi-symbol) */
  affectedSymbols?: string[];
}

export interface GapAnalysis {
  /** Total bars in dataset */
  totalBars: number;
  /** Number of gaps filled */
  filledGaps: number;
  /** Number of bars dropped */
  droppedBars: number;
  /** Gap percentage */
  gapPercentage: number;
  /** Individual gap details */
  gaps: GapInfo[];
  /** Gaps by reason */
  byReason: Record<GapReason, number>;
  /** Quality score (0-100) */
  qualityScore: number;
}

/**
 * US Market Holidays (approximate - should be updated annually)
 */
const US_MARKET_HOLIDAYS_2024_2026 = [
  '2024-01-01', '2024-01-15', '2024-02-19', '2024-03-29', '2024-05-27',
  '2024-07-04', '2024-09-02', '2024-11-28', '2024-12-25',
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26',
  '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25',
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
  '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
];

/**
 * Check if date is a weekend
 */
function isWeekend(timestamp: number): boolean {
  const date = new Date(timestamp);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if date is a US market holiday
 */
function isUSHoliday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split('T')[0];
  return US_MARKET_HOLIDAYS_2024_2026.includes(dateStr);
}

/**
 * Categorize gap reason
 */
function categorizeGap(startTime: number, endTime: number, barsMissing: number): GapReason {
  // Check if gap spans weekend
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Weekend gap (Friday close to Monday open)
  if (isWeekend(startTime) || isWeekend(endTime)) {
    return 'weekend';
  }

  // Holiday gap
  if (isUSHoliday(startTime) || isUSHoliday(endTime)) {
    return 'holiday';
  }

  // Single bar missing (likely data quality issue)
  if (barsMissing === 1) {
    return 'missing';
  }

  // Multiple bars missing (could be halt, delisting, etc.)
  if (barsMissing > 5) {
    return 'missing';
  }

  return 'unknown';
}

/**
 * Analyze gaps in data
 * Detects and categorizes gaps in time series data
 */
export function analyzeGaps(
  timestamps: number[],
  expectedInterval: number = 86400000, // 1 day in ms
  filledGaps: number = 0,
  droppedBars: number = 0
): GapAnalysis {
  const gaps: GapInfo[] = [];
  const byReason: Record<GapReason, number> = {
    weekend: 0,
    holiday: 0,
    missing: 0,
    'multi-symbol': 0,
    unknown: 0,
  };

  // Detect gaps by comparing timestamps
  for (let i = 1; i < timestamps.length; i++) {
    const prevTime = timestamps[i - 1];
    const currTime = timestamps[i];
    const diff = currTime - prevTime;

    // Gap detected if difference is more than 1.5x expected interval
    if (diff > expectedInterval * 1.5) {
      const barsMissing = Math.round((diff - expectedInterval) / expectedInterval);
      const reason = categorizeGap(prevTime, currTime, barsMissing);

      gaps.push({
        startIndex: i - 1,
        endIndex: i,
        startTime: prevTime,
        endTime: currTime,
        barsMissing,
        reason,
      });

      byReason[reason] += barsMissing;
    }
  }

  const totalBars = timestamps.length;
  const gapPercentage = totalBars > 0 ? (filledGaps / totalBars) * 100 : 0;

  // Calculate quality score (0-100)
  // Weekends and holidays don't reduce score
  const problematicGaps = byReason.missing + byReason['multi-symbol'] + byReason.unknown;
  const problematicPercent = totalBars > 0 ? (problematicGaps / totalBars) * 100 : 0;
  const qualityScore = Math.max(0, 100 - problematicPercent * 10);

  return {
    totalBars,
    filledGaps,
    droppedBars,
    gapPercentage,
    gaps,
    byReason,
    qualityScore,
  };
}

/**
 * Get gap severity level
 */
export function getGapSeverity(analysis: GapAnalysis): 'excellent' | 'good' | 'warning' | 'error' {
  if (analysis.qualityScore >= 95) return 'excellent';
  if (analysis.qualityScore >= 85) return 'good';
  if (analysis.qualityScore >= 70) return 'warning';
  return 'error';
}

/**
 * Format gap analysis for display
 */
export function formatGapAnalysis(analysis: GapAnalysis): string {
  const lines: string[] = [];

  lines.push(`Quality Score: ${analysis.qualityScore.toFixed(0)}/100`);
  lines.push(`Total Bars: ${analysis.totalBars.toLocaleString()}`);
  lines.push(`Filled Gaps: ${analysis.filledGaps.toLocaleString()} (${analysis.gapPercentage.toFixed(2)}%)`);

  if (analysis.droppedBars > 0) {
    lines.push(`Dropped Bars: ${analysis.droppedBars.toLocaleString()}`);
  }

  lines.push('');
  lines.push('Gaps by Type:');
  lines.push(`  Weekends: ${analysis.byReason.weekend.toLocaleString()}`);
  lines.push(`  Holidays: ${analysis.byReason.holiday.toLocaleString()}`);
  lines.push(`  Missing Data: ${analysis.byReason.missing.toLocaleString()}`);

  if (analysis.byReason['multi-symbol'] > 0) {
    lines.push(`  Multi-Symbol Alignment: ${analysis.byReason['multi-symbol'].toLocaleString()}`);
  }

  if (analysis.byReason.unknown > 0) {
    lines.push(`  Unknown: ${analysis.byReason.unknown.toLocaleString()}`);
  }

  return lines.join('\n');
}

/**
 * Get recommendations based on gap analysis
 */
export function getGapRecommendations(analysis: GapAnalysis): string[] {
  const recommendations: string[] = [];

  const severity = getGapSeverity(analysis);

  if (severity === 'error') {
    recommendations.push('Data quality is poor. Consider using a different symbol or date range.');
  }

  if (analysis.byReason.missing > analysis.totalBars * 0.02) {
    recommendations.push('Significant missing data detected. Results may be unreliable.');
  }

  if (analysis.byReason['multi-symbol'] > 0) {
    recommendations.push('Some symbols have misaligned data. Consider using "drop" gap fill strategy.');
  }

  if (analysis.droppedBars > analysis.totalBars * 0.1) {
    recommendations.push('Over 10% of bars were dropped. Try a different date range with better data coverage.');
  }

  return recommendations;
}
