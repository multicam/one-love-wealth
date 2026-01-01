/**
 * VIX Hedge Strategy
 * 
 * Uses VIX (volatility index) to manage exposure to a core position.
 * When VIX is low (complacency), stay fully invested in the core asset.
 * When VIX spikes (fear), reduce or exit the position.
 * 
 * This is a multi-symbol strategy that requires both a trading symbol
 * (e.g., TQQQ, SPY) and VIX (^VIX).
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';
import { sma } from '../../indicators';

export interface VIXHedgeParams {
  /** Main symbol to trade (e.g., 'TQQQ', 'SPY') */
  tradingSymbol: string;
  /** VIX symbol (usually '^VIX') */
  vixSymbol: string;
  /** VIX threshold to exit position (e.g., 25) */
  vixExitThreshold: number;
  /** VIX threshold to re-enter position (e.g., 20) */
  vixEntryThreshold: number;
  /** Use VIX moving average crossover instead of absolute levels */
  useMASignal: boolean;
  /** VIX MA period for crossover signal */
  vixMAPeriod: number;
  /** Position size as percentage of portfolio (0-1) */
  positionSize: number;
  /** Optional: reduce position size instead of full exit */
  partialExit: boolean;
  /** If partialExit, what percentage to keep (0-1) */
  reducedPositionSize: number;
}

export const DEFAULT_VIX_HEDGE_PARAMS: VIXHedgeParams = {
  tradingSymbol: 'TQQQ',
  vixSymbol: '^VIX',
  vixExitThreshold: 25,
  vixEntryThreshold: 20,
  useMASignal: false,
  vixMAPeriod: 10,
  positionSize: 0.95,
  partialExit: false,
  reducedPositionSize: 0.5,
};

export class VIXHedgeStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: VIXHedgeParams;
  private isReducedPosition: boolean = false;

  constructor(params: Partial<VIXHedgeParams> = {}) {
    super();
    this.params = { ...DEFAULT_VIX_HEDGE_PARAMS, ...params };
    this.name = `VIX Hedge (exit>${this.params.vixExitThreshold}, entry<${this.params.vixEntryThreshold})`;
    this.symbols = [this.params.tradingSymbol, this.params.vixSymbol];
  }

  init(): void {
    this.isReducedPosition = false;
  }

  onBar(ctx: StrategyContext): Signal[] {
    const {
      tradingSymbol,
      vixSymbol,
      vixExitThreshold,
      vixEntryThreshold,
      useMASignal,
      vixMAPeriod,
      positionSize,
      partialExit,
      reducedPositionSize,
    } = this.params;

    // Get current VIX value
    const vixBar = this.getBar(ctx, vixSymbol);
    const tradingBar = this.getBar(ctx, tradingSymbol);
    
    if (!vixBar || !tradingBar) return [];

    const currentVIX = vixBar.close;
    const hasPosition = this.hasPosition(ctx, tradingSymbol);
    const signals: Signal[] = [];

    // Determine if we should be in risk-off mode
    let riskOff: boolean;
    let riskOn: boolean;

    if (useMASignal) {
      // Use VIX MA crossover signal
      const vixCloses = this.getCloses(ctx, vixSymbol, vixMAPeriod + 5);
      if (vixCloses.length < vixMAPeriod) {
        // Not enough data, stay invested
        if (!hasPosition) {
          return [this.buy(tradingSymbol, {
            percentage: positionSize,
            reason: 'Initial entry - insufficient VIX data',
          })];
        }
        return [];
      }

      const vixMA = sma(vixCloses, vixMAPeriod);
      if (!vixMA) return [];

      // Risk off when VIX is above its MA (rising volatility)
      riskOff = currentVIX > vixMA * 1.1; // 10% above MA
      riskOn = currentVIX < vixMA * 0.95;  // 5% below MA
    } else {
      // Use absolute VIX thresholds
      riskOff = currentVIX > vixExitThreshold;
      riskOn = currentVIX < vixEntryThreshold;
    }

    // Decision logic
    if (riskOff && hasPosition) {
      if (partialExit && !this.isReducedPosition) {
        // Reduce position size
        const currentQty = this.getPositionQuantity(ctx, tradingSymbol);
        const targetQty = Math.floor(currentQty * (reducedPositionSize / positionSize));
        const sellQty = currentQty - targetQty;
        
        if (sellQty > 0) {
          this.isReducedPosition = true;
          signals.push(this.sell(tradingSymbol, {
            quantity: sellQty,
            reason: `VIX spike: ${currentVIX.toFixed(1)} > ${vixExitThreshold} - reducing position`,
          }));
        }
      } else if (!partialExit) {
        // Full exit
        signals.push(this.close(tradingSymbol, 
          `VIX spike: ${currentVIX.toFixed(1)} > ${vixExitThreshold} - exiting position`
        ));
      }
    } else if (riskOn) {
      if (!hasPosition) {
        // Enter full position
        this.isReducedPosition = false;
        signals.push(this.buy(tradingSymbol, {
          percentage: positionSize,
          reason: `VIX calm: ${currentVIX.toFixed(1)} < ${vixEntryThreshold} - entering position`,
        }));
      } else if (this.isReducedPosition) {
        // Restore full position
        this.isReducedPosition = false;
        signals.push(this.buy(tradingSymbol, {
          percentage: positionSize - reducedPositionSize,
          reason: `VIX calm: ${currentVIX.toFixed(1)} < ${vixEntryThreshold} - restoring full position`,
        }));
      }
    } else if (!hasPosition && ctx.barIndex === 0) {
      // Initial entry if VIX is neutral
      signals.push(this.buy(tradingSymbol, {
        percentage: positionSize,
        reason: 'Initial entry',
      }));
    }

    return signals;
  }
}
