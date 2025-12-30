/**
 * SveltePlot & Financial Visualization Interface Library
 * =====================================================
 *
 * Comprehensive TypeScript interfaces and layout patterns for economic analysis
 * and trading visualization based on best-in-class industry patterns.
 *
 * Sources:
 * - SveltePlot (https://svelteplot.dev/) - Grammar of Graphics for Svelte
 * - Observable Plot - D3-based declarative visualization
 * - FRED (Federal Reserve) - Economic data visualization standards
 * - Bloomberg Terminal - Professional trading UI patterns
 * - TradingView - Advanced charting features
 * - Glassnode/CoinGlass - Crypto on-chain visualization
 *
 * @packageDocumentation
 */

// =============================================================================
// CORE DATA TYPES
// =============================================================================

/**
 * Base time-indexed data point for all financial visualizations
 */
export interface TimePoint {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Date object (computed from time) */
  date?: Date;
}

/**
 * Simple value time series (economic indicators, single prices)
 */
export interface ValuePoint extends TimePoint {
  value: number;
}

/**
 * OHLC candlestick data point
 */
export interface OHLCPoint extends TimePoint {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Extended OHLC with computed fields for Heikin-Ashi
 */
export interface HeikinAshiPoint extends OHLCPoint {
  /** Heikin-Ashi computed values */
  haOpen: number;
  haClose: number;
  haHigh: number;
  haLow: number;
}

/**
 * Volume Profile data point
 */
export interface VolumeProfilePoint {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  isPOC?: boolean;  // Point of Control
  isVAH?: boolean;  // Value Area High
  isVAL?: boolean;  // Value Area Low
}

/**
 * Order book depth level
 */
export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;  // Cumulative
  side: 'bid' | 'ask';
}

/**
 * Liquidation heatmap cell
 */
export interface LiquidationCell {
  time: number;
  price: number;
  liquidations: number;
  type: 'long' | 'short';
  intensity: number;  // 0-1 normalized
}

// =============================================================================
// MULTI-SERIES & CORRELATION DATA
// =============================================================================

/**
 * Multi-series data point for comparing assets
 */
export interface MultiSeriesPoint extends TimePoint {
  symbol: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Correlation matrix cell
 */
export interface CorrelationCell {
  asset1: string;
  asset2: string;
  correlation: number;  // -1 to 1
  period?: string;
}

/**
 * Sector/heatmap cell for market overview
 */
export interface HeatmapCell {
  id: string;
  label: string;
  value: number;
  change: number;
  changePercent: number;
  sector?: string;
  marketCap?: number;
}

// =============================================================================
// ECONOMIC INDICATOR TYPES
// =============================================================================

/**
 * Economic indicator with recession context
 */
export interface EconomicIndicatorPoint extends ValuePoint {
  /** Is this point during a recession? */
  isRecession?: boolean;
  /** Forecast value if available */
  forecast?: number;
  /** Previous value for comparison */
  previous?: number;
}

/**
 * NBER recession period
 */
export interface RecessionPeriod {
  start: number;  // Unix timestamp
  end: number;    // Unix timestamp
  name?: string;  // e.g., "Great Recession"
}

/**
 * Business cycle indicator classification
 */
export type IndicatorType = 'leading' | 'coincident' | 'lagging';

/**
 * Economic indicator metadata
 */
export interface EconomicIndicatorMeta {
  id: string;
  name: string;
  source: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  unit: string;
  indicatorType: IndicatorType;
  description?: string;
  seasonallyAdjusted?: boolean;
}

/**
 * Yield curve data point
 */
export interface YieldCurvePoint {
  time: number;
  maturity: string;  // '3M', '2Y', '10Y', etc.
  yield: number;
}

/**
 * Yield curve spread
 */
export interface YieldSpread extends ValuePoint {
  shortTerm: string;
  longTerm: string;
  isInverted: boolean;
}

// =============================================================================
// TECHNICAL INDICATOR TYPES
// =============================================================================

/**
 * Moving average data point
 */
export interface MovingAveragePoint extends ValuePoint {
  period: number;
  type: 'SMA' | 'EMA' | 'WMA';
}

/**
 * Bollinger Bands data
 */
export interface BollingerBandsPoint extends TimePoint {
  upper: number;
  middle: number;
  lower: number;
  width: number;
  percentB: number;  // Position within bands (0-1)
}

/**
 * RSI data point
 */
export interface RSIPoint extends ValuePoint {
  isOverbought: boolean;  // > 70
  isOversold: boolean;    // < 30
}

/**
 * MACD data point
 */
export interface MACDPoint extends TimePoint {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | null;
}

/**
 * Combined technical indicator signals
 */
export interface TechnicalSignal {
  time: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerPosition: number;
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  confidence: number;  // 0-1
}

// =============================================================================
// CRYPTO ON-CHAIN METRICS
// =============================================================================

/**
 * MVRV (Market Value to Realized Value)
 */
export interface MVRVPoint extends ValuePoint {
  zScore?: number;
  isOvervalued: boolean;   // > 3.7
  isUndervalued: boolean;  // < 1.0
}

/**
 * SOPR (Spent Output Profit Ratio)
 */
export interface SOPRPoint extends ValuePoint {
  type: 'aggregate' | 'STH' | 'LTH';  // Short/Long Term Holder
  isProfit: boolean;  // > 1
}

/**
 * NVT (Network Value to Transaction)
 */
export interface NVTPoint extends ValuePoint {
  transactionVolume: number;
  marketCap: number;
}

/**
 * Exchange flow data
 */
export interface ExchangeFlowPoint extends TimePoint {
  exchange: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  type: 'BTC' | 'ETH' | 'stablecoin';
}

/**
 * Fear & Greed Index
 */
export interface FearGreedPoint extends ValuePoint {
  sentiment: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
}

/**
 * Funding rate data
 */
export interface FundingRatePoint extends TimePoint {
  exchange: string;
  symbol: string;
  rate: number;
  nextFundingTime: number;
}

// =============================================================================
// PORTFOLIO & RISK METRICS
// =============================================================================

/**
 * Portfolio position
 */
export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocation: number;  // Portfolio percentage
}

/**
 * Risk metrics snapshot
 */
export interface RiskMetrics {
  time: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  valueAtRisk: number;  // 95% confidence
  volatility: number;
  beta: number;
  alpha: number;
}

/**
 * Drawdown period
 */
export interface DrawdownPeriod {
  start: number;
  end: number;
  peak: number;
  trough: number;
  drawdown: number;
  recoveryTime: number | null;
}

// =============================================================================
// SVELTEPLOT MARK CONFIGURATIONS
// =============================================================================

/**
 * SveltePlot color scale options
 */
export interface ColorScaleConfig {
  type: 'ordinal' | 'linear' | 'diverging' | 'threshold';
  scheme?: string;  // 'blues', 'rdylbu', 'brbg', 'viridis', etc.
  domain?: number[] | string[];
  range?: string[];
  pivot?: number;       // For diverging scales
  symmetric?: boolean;  // Equal range on both sides
  legend?: boolean;
  label?: string;
}

/**
 * SveltePlot scale options
 */
export interface ScaleConfig {
  type?: 'linear' | 'log' | 'sqrt' | 'pow' | 'ordinal' | 'time' | 'utc' | 'band';
  domain?: [number, number] | Date[] | string[];
  range?: [number, number] | string[];
  reverse?: boolean;
  grid?: boolean;
  label?: string;
  tickFormat?: string | ((d: unknown) => string);
  tickRotate?: number;
  nice?: boolean;
  zero?: boolean;
  percent?: boolean;
}

/**
 * SveltePlot mark base options
 */
export interface MarkOptions {
  x?: string | ((d: unknown) => unknown);
  y?: string | ((d: unknown) => unknown);
  z?: string;  // Series grouping
  stroke?: string | ((d: unknown) => unknown);
  fill?: string | ((d: unknown) => unknown);
  strokeWidth?: number;
  strokeOpacity?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
  r?: number | string;  // Dot radius
  tip?: boolean | TipConfig;
}

/**
 * Tooltip configuration
 */
export interface TipConfig {
  format?: Record<string, boolean | string | ((d: unknown) => string)>;
  channels?: Record<string, string | ((d: unknown) => unknown)>;
  anchor?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Facet configuration for small multiples
 */
export interface FacetConfig {
  x?: string;  // Horizontal facet field
  y?: string;  // Vertical facet field
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  grid?: boolean;
  label?: string | null;
}

/**
 * Window transform options (for moving averages)
 */
export interface WindowConfig {
  k: number;  // Window size
  anchor?: 'start' | 'middle' | 'end';
  reduce?: 'mean' | 'median' | 'min' | 'max' | 'sum' | 'first' | 'last';
  strict?: boolean;
}

// =============================================================================
// CHART LAYOUT CONFIGURATIONS
// =============================================================================

/**
 * Base chart layout options
 */
export interface ChartLayoutConfig {
  width?: number | 'auto';
  height?: number | 'auto';
  aspectRatio?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  padding?: number;
}

/**
 * Multi-panel dashboard layout
 */
export interface DashboardLayoutConfig {
  columns: number;
  rows: number;
  gap: number;
  panelMinWidth: number;
  panelMinHeight: number;
  responsive?: boolean;
}

/**
 * Panel configuration for dashboard
 */
export interface PanelConfig {
  id: string;
  title: string;
  type: ChartType;
  colspan?: number;
  rowspan?: number;
  priority?: 'primary' | 'secondary' | 'tertiary';
}

/**
 * Supported chart types
 */
export type ChartType =
  | 'line'
  | 'area'
  | 'candlestick'
  | 'heikinAshi'
  | 'renko'
  | 'volumeProfile'
  | 'orderBook'
  | 'heatmap'
  | 'correlation'
  | 'scatter'
  | 'bar'
  | 'histogram'
  | 'boxplot'
  | 'sparkline'
  | 'bullet'
  | 'gauge'
  | 'horizon'
  | 'treemap'
  | 'waterfall'
  | 'ridgeline'
  | 'liquidation'
  | 'fundingRate'
  | 'fearGreed';

// =============================================================================
// VISUALIZATION PRESETS
// =============================================================================

/**
 * Economic dashboard preset
 */
export interface EconomicDashboardPreset {
  layout: DashboardLayoutConfig;
  panels: PanelConfig[];
  recessionShading: boolean;
  defaultTimeRange: '1Y' | '5Y' | '10Y' | 'MAX';
  indicators: EconomicIndicatorMeta[];
}

/**
 * Trading dashboard preset
 */
export interface TradingDashboardPreset {
  layout: DashboardLayoutConfig;
  panels: PanelConfig[];
  defaultTimeframe: string;
  technicalIndicators: string[];
  showVolume: boolean;
  showOrderBook: boolean;
}

/**
 * Crypto analytics preset
 */
export interface CryptoAnalyticsPreset {
  layout: DashboardLayoutConfig;
  panels: PanelConfig[];
  onChainMetrics: string[];
  showLiquidations: boolean;
  showFundingRates: boolean;
  showExchangeFlows: boolean;
}

// =============================================================================
// COLOR SCHEMES
// =============================================================================

/**
 * Financial color scheme
 */
export interface FinancialColorScheme {
  /** Positive/bullish */
  positive: string;
  /** Negative/bearish */
  negative: string;
  /** Neutral */
  neutral: string;
  /** Background */
  background: string;
  /** Grid lines */
  grid: string;
  /** Axis text */
  axis: string;
  /** Text primary */
  text: string;
  /** Series colors (10 max) */
  series: string[];
  /** Diverging scale colors */
  diverging: {
    low: string;
    mid: string;
    high: string;
  };
  /** Recession shading */
  recession: string;
}

/**
 * Pre-defined color schemes
 */
export const COLOR_SCHEMES: Record<string, FinancialColorScheme> = {
  /**
   * Classic dark theme (Bloomberg-inspired)
   */
  dark: {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#64748b',
    background: '#0f172a',
    grid: '#1e293b',
    axis: '#64748b',
    text: '#e2e8f0',
    series: [
      '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6',
      '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'
    ],
    diverging: {
      low: '#ef4444',
      mid: '#fbbf24',
      high: '#22c55e'
    },
    recession: 'rgba(100, 116, 139, 0.3)'
  },

  /**
   * TradingView dark theme
   */
  tradingview: {
    positive: '#089981',
    negative: '#f23645',
    neutral: '#787b86',
    background: '#131722',
    grid: '#2a2e39',
    axis: '#787b86',
    text: '#d1d4dc',
    series: [
      '#2962ff', '#ff9800', '#4caf50', '#f44336', '#9c27b0',
      '#00bcd4', '#e91e63', '#8bc34a', '#ff5722', '#009688'
    ],
    diverging: {
      low: '#f23645',
      mid: '#787b86',
      high: '#089981'
    },
    recession: 'rgba(120, 123, 134, 0.2)'
  },

  /**
   * FRED-inspired theme
   */
  fred: {
    positive: '#0066cc',
    negative: '#cc0000',
    neutral: '#666666',
    background: '#ffffff',
    grid: '#e5e5e5',
    axis: '#666666',
    text: '#333333',
    series: [
      '#0066cc', '#ff6600', '#00cc66', '#cc0066', '#6600cc',
      '#00cccc', '#cc6600', '#66cc00', '#cc00cc', '#0099cc'
    ],
    diverging: {
      low: '#d73027',
      mid: '#ffffbf',
      high: '#1a9850'
    },
    recession: 'rgba(200, 200, 200, 0.5)'
  }
} as const;

// =============================================================================
// LAYOUT TEMPLATES
// =============================================================================

/**
 * Pre-defined dashboard layouts
 */
export const LAYOUT_TEMPLATES = {
  /**
   * Economic Analysis Dashboard (FRED-style)
   * - Large main chart with recession shading
   * - 3 smaller indicator panels below
   * - Sparklines sidebar
   */
  economicAnalysis: {
    name: 'Economic Analysis',
    description: 'FRED-style macroeconomic dashboard with recession shading',
    layout: {
      columns: 12,
      rows: 8,
      gap: 16,
      panelMinWidth: 280,
      panelMinHeight: 200,
      responsive: true
    },
    panels: [
      { id: 'main', title: 'Primary Indicator', type: 'line' as ChartType, colspan: 9, rowspan: 5, priority: 'primary' },
      { id: 'sparklines', title: 'Quick View', type: 'sparkline' as ChartType, colspan: 3, rowspan: 5, priority: 'tertiary' },
      { id: 'leading', title: 'Leading Indicators', type: 'line' as ChartType, colspan: 4, rowspan: 3, priority: 'secondary' },
      { id: 'coincident', title: 'Coincident Indicators', type: 'line' as ChartType, colspan: 4, rowspan: 3, priority: 'secondary' },
      { id: 'lagging', title: 'Lagging Indicators', type: 'line' as ChartType, colspan: 4, rowspan: 3, priority: 'secondary' }
    ],
    features: {
      recessionShading: true,
      yieldCurveWidget: true,
      correlationMatrix: false
    }
  },

  /**
   * Macro Trading Dashboard
   * - Candlestick main chart
   * - Volume profile sidebar
   * - Technical indicators below
   * - Order book depth
   */
  macroTrading: {
    name: 'Macro Trading',
    description: 'Multi-timeframe analysis with technical indicators',
    layout: {
      columns: 12,
      rows: 10,
      gap: 12,
      panelMinWidth: 320,
      panelMinHeight: 180,
      responsive: true
    },
    panels: [
      { id: 'price', title: 'Price Action', type: 'candlestick' as ChartType, colspan: 8, rowspan: 6, priority: 'primary' },
      { id: 'volume', title: 'Volume Profile', type: 'volumeProfile' as ChartType, colspan: 2, rowspan: 6, priority: 'secondary' },
      { id: 'orderbook', title: 'Order Book', type: 'orderBook' as ChartType, colspan: 2, rowspan: 6, priority: 'secondary' },
      { id: 'rsi', title: 'RSI', type: 'line' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'macd', title: 'MACD', type: 'bar' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'volume-bar', title: 'Volume', type: 'bar' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'heatmap', title: 'Sector Heatmap', type: 'heatmap' as ChartType, colspan: 12, rowspan: 2, priority: 'secondary' }
    ],
    features: {
      multiTimeframe: true,
      technicalIndicators: ['SMA20', 'SMA50', 'SMA200', 'BB', 'RSI', 'MACD'],
      volumeProfile: true
    }
  },

  /**
   * Crypto On-Chain Analytics
   * - Price with on-chain overlays
   * - MVRV/SOPR metrics
   * - Liquidation heatmap
   * - Exchange flows
   */
  cryptoOnChain: {
    name: 'Crypto On-Chain',
    description: 'Bitcoin/ETH on-chain metrics and derivatives data',
    layout: {
      columns: 12,
      rows: 12,
      gap: 12,
      panelMinWidth: 300,
      panelMinHeight: 160,
      responsive: true
    },
    panels: [
      { id: 'price', title: 'Price', type: 'candlestick' as ChartType, colspan: 8, rowspan: 4, priority: 'primary' },
      { id: 'feargreed', title: 'Fear & Greed', type: 'fearGreed' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'funding', title: 'Funding Rates', type: 'fundingRate' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'mvrv', title: 'MVRV Z-Score', type: 'line' as ChartType, colspan: 6, rowspan: 3, priority: 'secondary' },
      { id: 'sopr', title: 'SOPR', type: 'line' as ChartType, colspan: 6, rowspan: 3, priority: 'secondary' },
      { id: 'liquidation', title: 'Liquidation Heatmap', type: 'liquidation' as ChartType, colspan: 8, rowspan: 3, priority: 'secondary' },
      { id: 'flows', title: 'Exchange Flows', type: 'bar' as ChartType, colspan: 4, rowspan: 3, priority: 'tertiary' },
      { id: 'nvt', title: 'NVT Signal', type: 'line' as ChartType, colspan: 4, rowspan: 2, priority: 'tertiary' },
      { id: 'supply', title: 'Supply Distribution', type: 'area' as ChartType, colspan: 8, rowspan: 2, priority: 'tertiary' }
    ],
    features: {
      onChainMetrics: ['MVRV', 'SOPR', 'NVT', 'NUPL'],
      liquidationHeatmap: true,
      exchangeFlows: true,
      fundingRates: true
    }
  },

  /**
   * Correlation Analysis Dashboard
   * - Correlation matrix
   * - Small multiples for assets
   * - Rolling correlation chart
   */
  correlationAnalysis: {
    name: 'Correlation Analysis',
    description: 'Cross-asset correlation and relationship analysis',
    layout: {
      columns: 12,
      rows: 8,
      gap: 16,
      panelMinWidth: 280,
      panelMinHeight: 200,
      responsive: true
    },
    panels: [
      { id: 'matrix', title: 'Correlation Matrix', type: 'correlation' as ChartType, colspan: 6, rowspan: 6, priority: 'primary' },
      { id: 'rolling', title: 'Rolling Correlation', type: 'line' as ChartType, colspan: 6, rowspan: 3, priority: 'secondary' },
      { id: 'scatter', title: 'Scatter Plot', type: 'scatter' as ChartType, colspan: 6, rowspan: 3, priority: 'secondary' },
      { id: 'facets', title: 'Asset Comparison', type: 'line' as ChartType, colspan: 12, rowspan: 2, priority: 'tertiary' }
    ],
    features: {
      rollingWindow: 30,
      faceting: true,
      regressionLine: true
    }
  },

  /**
   * Portfolio Risk Dashboard
   * - Equity curve
   * - Drawdown chart
   * - Risk metrics cards
   * - Position breakdown
   */
  portfolioRisk: {
    name: 'Portfolio Risk',
    description: 'Portfolio performance and risk analytics',
    layout: {
      columns: 12,
      rows: 10,
      gap: 12,
      panelMinWidth: 260,
      panelMinHeight: 150,
      responsive: true
    },
    panels: [
      { id: 'equity', title: 'Equity Curve', type: 'area' as ChartType, colspan: 8, rowspan: 4, priority: 'primary' },
      { id: 'metrics', title: 'Risk Metrics', type: 'bullet' as ChartType, colspan: 4, rowspan: 4, priority: 'secondary' },
      { id: 'drawdown', title: 'Underwater Chart', type: 'area' as ChartType, colspan: 8, rowspan: 3, priority: 'secondary' },
      { id: 'allocation', title: 'Allocation', type: 'treemap' as ChartType, colspan: 4, rowspan: 3, priority: 'secondary' },
      { id: 'returns', title: 'Return Distribution', type: 'histogram' as ChartType, colspan: 6, rowspan: 3, priority: 'tertiary' },
      { id: 'rolling-sharpe', title: 'Rolling Sharpe', type: 'line' as ChartType, colspan: 6, rowspan: 3, priority: 'tertiary' }
    ],
    features: {
      benchmarkComparison: true,
      monteCarlo: false,
      riskDecomposition: true
    }
  }
} as const;

// =============================================================================
// SVELTEPLOT COMPONENT CONFIGURATIONS
// =============================================================================

/**
 * Candlestick chart configuration for SveltePlot
 * Uses layered RuleX marks (Observable Plot pattern)
 */
export interface CandlestickConfig {
  /** OHLC data */
  data: OHLCPoint[];
  /** Chart dimensions */
  width?: number;
  height?: number;
  /** Color for up candles */
  upColor?: string;
  /** Color for down candles */
  downColor?: string;
  /** Body width */
  bodyWidth?: number;
  /** Show volume bars */
  showVolume?: boolean;
  /** Volume bar color */
  volumeColor?: string;
  /** Enable tooltips */
  tip?: boolean;
  /** Y-axis scale type */
  yScale?: 'linear' | 'log';
}

/**
 * Time series line chart configuration
 */
export interface TimeSeriesConfig {
  /** Data array */
  data: ValuePoint[] | MultiSeriesPoint[];
  /** X field (default: 'time') */
  x?: string;
  /** Y field (default: 'value') */
  y?: string;
  /** Series grouping field */
  z?: string;
  /** Stroke color or field */
  stroke?: string;
  /** Fill for area chart */
  fill?: string | boolean;
  /** Curve interpolation */
  curve?: 'linear' | 'step' | 'step-before' | 'step-after' | 'basis' | 'cardinal' | 'catmull-rom' | 'monotone-x';
  /** Show recession shading */
  recessionPeriods?: RecessionPeriod[];
  /** Moving average windows */
  movingAverages?: WindowConfig[];
  /** Enable tooltips */
  tip?: boolean;
}

/**
 * Heatmap/cell chart configuration
 */
export interface HeatmapConfig {
  /** Cell data */
  data: Array<{ x: string | number; y: string | number; value: number }>;
  /** X field */
  x: string;
  /** Y field */
  y: string;
  /** Value field for color */
  fill: string;
  /** Color scale */
  color?: ColorScaleConfig;
  /** Show value labels */
  showLabels?: boolean;
  /** Label format */
  labelFormat?: (d: number) => string;
}

/**
 * Volume Profile configuration
 */
export interface VolumeProfileConfig {
  /** Volume profile data */
  data: VolumeProfilePoint[];
  /** Chart orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Show buy/sell split */
  showBuySell?: boolean;
  /** Highlight POC */
  highlightPOC?: boolean;
  /** Show value area */
  showValueArea?: boolean;
  /** Value area percentage */
  valueAreaPercent?: number;
}

/**
 * Order Book configuration
 */
export interface OrderBookConfig {
  /** Bid levels */
  bids: OrderBookLevel[];
  /** Ask levels */
  asks: OrderBookLevel[];
  /** Price precision */
  pricePrecision?: number;
  /** Size precision */
  sizePrecision?: number;
  /** Show spread */
  showSpread?: boolean;
  /** Depth levels to show */
  depth?: number;
  /** Color scheme */
  bidColor?: string;
  askColor?: string;
}

/**
 * Liquidation heatmap configuration
 */
export interface LiquidationHeatmapConfig {
  /** Liquidation data */
  data: LiquidationCell[];
  /** Time range */
  timeRange?: '3d' | '7d' | '30d';
  /** Color scale */
  colorScheme?: 'viridis' | 'magma' | 'inferno' | 'plasma';
  /** Intensity multiplier */
  intensityMultiplier?: number;
}

// =============================================================================
// CHART ANNOTATION TYPES
// =============================================================================

/**
 * Horizontal line annotation (support/resistance)
 */
export interface HorizontalLine {
  value: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

/**
 * Vertical line annotation (events)
 */
export interface VerticalLine {
  time: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Price zone annotation
 */
export interface PriceZone {
  high: number;
  low: number;
  label?: string;
  color?: string;
  opacity?: number;
}

/**
 * Text annotation
 */
export interface TextAnnotation {
  x: number | Date;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  baseline?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
  color?: string;
}

/**
 * Chart annotations collection
 */
export interface ChartAnnotations {
  horizontalLines?: HorizontalLine[];
  verticalLines?: VerticalLine[];
  zones?: PriceZone[];
  text?: TextAnnotation[];
  recessionPeriods?: RecessionPeriod[];
}

// =============================================================================
// INTERACTIVE FEATURES
// =============================================================================

/**
 * Brush selection state
 */
export interface BrushSelection {
  x1: number;
  x2: number;
  y1?: number;
  y2?: number;
}

/**
 * Crosshair position
 */
export interface CrosshairPosition {
  x: number | Date;
  y: number;
  data?: Record<string, unknown>;
}

/**
 * Zoom state
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  domain?: {
    x: [number, number];
    y: [number, number];
  };
}

/**
 * Chart interaction callbacks
 */
export interface ChartInteractions {
  onBrush?: (selection: BrushSelection | null) => void;
  onCrosshairMove?: (position: CrosshairPosition | null) => void;
  onZoom?: (state: ZoomState) => void;
  onClick?: (data: unknown, event: MouseEvent) => void;
  onHover?: (data: unknown, event: MouseEvent) => void;
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

/**
 * Helper to convert DataPoint array to SveltePlot format
 */
export function toPlotData<T extends TimePoint>(
  data: T[],
  options?: { dateField?: string }
): Array<T & { Date: Date }> {
  return data.map(d => ({
    ...d,
    Date: new Date(d.time)
  }));
}

/**
 * Helper to calculate moving average
 */
export function calculateMA(
  data: ValuePoint[],
  period: number,
  type: 'SMA' | 'EMA' = 'SMA'
): MovingAveragePoint[] {
  if (data.length < period) return [];

  const result: MovingAveragePoint[] = [];

  if (type === 'SMA') {
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, d) => sum + d.value, 0) / period;
      result.push({
        time: data[i].time,
        value: avg,
        period,
        type: 'SMA'
      });
    }
  } else {
    // EMA
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, d) => sum + d.value, 0) / period;

    result.push({ time: data[period - 1].time, value: ema, period, type: 'EMA' });

    for (let i = period; i < data.length; i++) {
      ema = (data[i].value - ema) * multiplier + ema;
      result.push({ time: data[i].time, value: ema, period, type: 'EMA' });
    }
  }

  return result;
}

/**
 * Helper to calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: ValuePoint[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsPoint[] {
  if (data.length < period) return [];

  const result: BollingerBandsPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, d) => sum + d.value, 0) / period;
    const variance = slice.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / period;
    const std = Math.sqrt(variance);

    const upper = mean + stdDev * std;
    const lower = mean - stdDev * std;
    const width = (upper - lower) / mean;
    const percentB = (data[i].value - lower) / (upper - lower);

    result.push({
      time: data[i].time,
      upper,
      middle: mean,
      lower,
      width,
      percentB
    });
  }

  return result;
}

/**
 * Helper to calculate RSI
 */
export function calculateRSI(
  data: ValuePoint[],
  period: number = 14
): RSIPoint[] {
  if (data.length < period + 1) return [];

  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].value - data[i - 1].value);
  }

  const result: RSIPoint[] = [];

  for (let i = period; i < changes.length + 1; i++) {
    const slice = changes.slice(i - period, i);
    const gains = slice.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period;
    const losses = Math.abs(slice.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period;

    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - (100 / (1 + rs));

    result.push({
      time: data[i].time,
      value: rsi,
      isOverbought: rsi > 70,
      isOversold: rsi < 30
    });
  }

  return result;
}

/**
 * Helper to calculate correlation
 */
export function calculateCorrelation(
  x: number[],
  y: number[]
): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenom += xDiff * xDiff;
    yDenom += yDiff * yDiff;
  }

  const denominator = Math.sqrt(xDenom * yDenom);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Helper to convert OHLC to Heikin-Ashi
 */
export function toHeikinAshi(data: OHLCPoint[]): HeikinAshiPoint[] {
  if (data.length === 0) return [];

  const result: HeikinAshiPoint[] = [];

  // First candle
  const first = data[0];
  result.push({
    ...first,
    haOpen: (first.open + first.close) / 2,
    haClose: (first.open + first.high + first.low + first.close) / 4,
    haHigh: first.high,
    haLow: first.low
  });

  // Subsequent candles
  for (let i = 1; i < data.length; i++) {
    const prev = result[i - 1];
    const curr = data[i];

    const haOpen = (prev.haOpen + prev.haClose) / 2;
    const haClose = (curr.open + curr.high + curr.low + curr.close) / 4;
    const haHigh = Math.max(curr.high, haOpen, haClose);
    const haLow = Math.min(curr.low, haOpen, haClose);

    result.push({
      ...curr,
      haOpen,
      haClose,
      haHigh,
      haLow
    });
  }

  return result;
}
