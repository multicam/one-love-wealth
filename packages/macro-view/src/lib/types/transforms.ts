/**
 * Declarative transformation operations
 * Prefer server-side transforms when available (FRED units, BLS calculations)
 *
 * NOTE: Phase 2 stub - full implementation in Phase 3
 */
export interface DataTransform {
  seriesIndex?: number;
  operation: TransformOperation;
}

export type TransformOperation =
  | { type: 'yoy'; periods?: number }
  | { type: 'mom'; periods?: number }
  | { type: 'normalize'; base?: number }
  | { type: 'normalize_date'; date: string }
  | { type: 'invert' }
  | { type: 'log' }
  | { type: 'log10' }
  | { type: 'abs' }
  | { type: 'cumsum' }
  | { type: 'diff'; periods?: number }
  | { type: 'pct_change'; periods?: number }
  | { type: 'rolling_avg'; window: number }
  | { type: 'rolling_std'; window: number }
  | { type: 'ratio'; dividendIndex: number }
  | { type: 'scale'; factor: number }
  | { type: 'offset'; value: number }
  | { type: 'clip'; min?: number; max?: number }
  | { type: 'zscore' }
  | { type: 'rank' }
  | { type: 'resample'; frequency: 'd' | 'w' | 'm' | 'q' | 'a' };
