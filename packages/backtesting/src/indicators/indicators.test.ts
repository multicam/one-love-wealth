/**
 * Tests for technical indicators
 */

import { test, expect, describe } from 'bun:test';
import {
  // Trend
  sma,
  smaSeries,
  ema,
  emaSeries,
  wma,
  wmaSeries,
  dema,
  tema,
  // Momentum
  rsi,
  rsiSeries,
  macd,
  macdSeries,
  stochastic,
  stochasticSeries,
  roc,
  rocSeries,
  williamsR,
  cci,
  // Volatility
  standardDeviation,
  standardDeviationSeries,
  bollingerBands,
  bollingerBandsSeries,
  trueRange,
  atr,
  atrSeries,
  keltnerChannels,
  historicalVolatility,
  chaikinVolatility,
} from './index';

describe('Trend Indicators', () => {
  describe('SMA', () => {
    test('calculates simple moving average', () => {
      const values = [1, 2, 3, 4, 5];
      expect(sma(values, 3)).toBe(4); // (3+4+5)/3
    });

    test('returns undefined for insufficient data', () => {
      const values = [1, 2];
      expect(sma(values, 3)).toBeUndefined();
    });

    test('handles exact period length', () => {
      const values = [2, 4, 6];
      expect(sma(values, 3)).toBe(4); // (2+4+6)/3
    });

    test('smaSeries returns correct length', () => {
      const values = [1, 2, 3, 4, 5];
      const result = smaSeries(values, 3);
      expect(result.length).toBe(5);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toBeUndefined();
      expect(result[2]).toBe(2); // (1+2+3)/3
      expect(result[3]).toBe(3); // (2+3+4)/3
      expect(result[4]).toBe(4); // (3+4+5)/3
    });
  });

  describe('EMA', () => {
    test('calculates exponential moving average', () => {
      const values = [22, 24, 23, 25, 26, 28, 27, 29, 30, 31];
      const result = ema(values, 5);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(27);
      expect(result).toBeLessThan(31);
    });

    test('returns undefined for insufficient data', () => {
      const values = [1, 2, 3];
      expect(ema(values, 5)).toBeUndefined();
    });

    test('emaSeries returns correct structure', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = emaSeries(values, 3);
      expect(result.length).toBe(10);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toBeUndefined();
      expect(result[2]).toBeDefined();
    });

    test('first EMA equals SMA', () => {
      const values = [1, 2, 3];
      const result = emaSeries(values, 3);
      expect(result[2]).toBe(2); // SMA of first 3 values
    });
  });

  describe('WMA', () => {
    test('calculates weighted moving average', () => {
      const values = [1, 2, 3, 4, 5];
      // WMA(3) = (3*1 + 4*2 + 5*3) / (1+2+3) = (3+8+15)/6 = 26/6 ≈ 4.33
      const result = wma(values, 3);
      expect(result).toBeDefined();
      expect(result).toBeCloseTo(4.333, 2);
    });

    test('returns undefined for insufficient data', () => {
      expect(wma([1, 2], 3)).toBeUndefined();
    });

    test('wmaSeries returns correct length', () => {
      const values = [1, 2, 3, 4, 5];
      const result = wmaSeries(values, 3);
      expect(result.length).toBe(5);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toBeUndefined();
      expect(result[2]).toBeDefined();
    });
  });

  describe('DEMA', () => {
    test('calculates double exponential moving average', () => {
      const values = Array.from({ length: 20 }, (_, i) => 100 + i);
      const result = dema(values, 5);
      expect(result).toBeDefined();
    });

    test('returns undefined for insufficient data', () => {
      const values = [1, 2, 3, 4, 5];
      expect(dema(values, 5)).toBeUndefined();
    });
  });

  describe('TEMA', () => {
    test('calculates triple exponential moving average', () => {
      const values = Array.from({ length: 30 }, (_, i) => 100 + i);
      const result = tema(values, 5);
      expect(result).toBeDefined();
    });

    test('returns undefined for insufficient data', () => {
      const values = Array.from({ length: 10 }, (_, i) => i);
      expect(tema(values, 5)).toBeUndefined();
    });
  });
});

describe('Momentum Indicators', () => {
  describe('RSI', () => {
    test('calculates RSI for uptrend', () => {
      // Steady uptrend should have high RSI
      const values = Array.from({ length: 20 }, (_, i) => 100 + i);
      const result = rsi(values, 14);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(70); // Overbought territory
    });

    test('calculates RSI for downtrend', () => {
      // Steady downtrend should have low RSI
      const values = Array.from({ length: 20 }, (_, i) => 100 - i);
      const result = rsi(values, 14);
      expect(result).toBeDefined();
      expect(result).toBeLessThan(30); // Oversold territory
    });

    test('RSI is bounded between 0 and 100', () => {
      const values = [100, 110, 105, 115, 108, 120, 112, 125, 118, 130, 122, 135, 128, 140, 132, 145];
      const result = rsi(values, 14);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    test('returns undefined for insufficient data', () => {
      const values = Array.from({ length: 10 }, (_, i) => i);
      expect(rsi(values, 14)).toBeUndefined();
    });

    test('rsiSeries returns correct structure', () => {
      const values = Array.from({ length: 20 }, (_, i) => 100 + i);
      const result = rsiSeries(values, 14);
      expect(result.length).toBe(20);
      expect(result[13]).toBeUndefined();
      expect(result[14]).toBeDefined();
    });
  });

  describe('MACD', () => {
    test('calculates MACD components', () => {
      const values = Array.from({ length: 40 }, (_, i) => 100 + Math.sin(i / 5) * 10);
      const result = macd(values);
      expect(result).toBeDefined();
      expect(result?.macd).toBeDefined();
      expect(result?.signal).toBeDefined();
      expect(result?.histogram).toBeDefined();
    });

    test('histogram equals macd minus signal', () => {
      const values = Array.from({ length: 50 }, (_, i) => 100 + i);
      const result = macd(values);
      expect(result).toBeDefined();
      if (result) {
        expect(result.histogram).toBeCloseTo(result.macd - result.signal, 10);
      }
    });

    test('returns undefined for insufficient data', () => {
      const values = Array.from({ length: 20 }, (_, i) => i);
      expect(macd(values)).toBeUndefined();
    });

    test('macdSeries returns correct structure', () => {
      const values = Array.from({ length: 50 }, (_, i) => 100 + i);
      const result = macdSeries(values);
      expect(result.length).toBe(50);
    });
  });

  describe('Stochastic', () => {
    test('calculates stochastic oscillator', () => {
      const highs = Array.from({ length: 20 }, (_, i) => 105 + i);
      const lows = Array.from({ length: 20 }, (_, i) => 95 + i);
      const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
      
      const result = stochastic(highs, lows, closes);
      expect(result).toBeDefined();
      expect(result?.k).toBeGreaterThanOrEqual(0);
      expect(result?.k).toBeLessThanOrEqual(100);
      expect(result?.d).toBeDefined();
    });

    test('returns undefined for insufficient data', () => {
      const highs = [105, 106, 107];
      const lows = [95, 96, 97];
      const closes = [100, 101, 102];
      expect(stochastic(highs, lows, closes)).toBeUndefined();
    });

    test('stochasticSeries returns correct structure', () => {
      const len = 25;
      const highs = Array.from({ length: len }, (_, i) => 105 + i);
      const lows = Array.from({ length: len }, (_, i) => 95 + i);
      const closes = Array.from({ length: len }, (_, i) => 100 + i);
      
      const result = stochasticSeries(highs, lows, closes);
      expect(result.length).toBe(len);
    });
  });

  describe('ROC', () => {
    test('calculates rate of change', () => {
      const values = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160];
      const result = roc(values, 12);
      expect(result).toBeDefined();
      expect(result).toBeCloseTo(60, 0); // (160-100)/100 * 100 = 60%
    });

    test('returns undefined for insufficient data', () => {
      const values = [100, 105, 110];
      expect(roc(values, 12)).toBeUndefined();
    });

    test('rocSeries returns correct structure', () => {
      const values = Array.from({ length: 20 }, (_, i) => 100 + i);
      const result = rocSeries(values, 5);
      expect(result.length).toBe(20);
      expect(result[4]).toBeUndefined();
      expect(result[5]).toBeDefined();
    });
  });

  describe('Williams %R', () => {
    test('calculates Williams %R', () => {
      const highs = Array.from({ length: 20 }, (_, i) => 110 + i);
      const lows = Array.from({ length: 20 }, (_, i) => 90 + i);
      const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
      
      const result = williamsR(highs, lows, closes);
      expect(result).toBeDefined();
      expect(result).toBeLessThanOrEqual(0);
      expect(result).toBeGreaterThanOrEqual(-100);
    });

    test('returns undefined for insufficient data', () => {
      expect(williamsR([110], [90], [100])).toBeUndefined();
    });
  });

  describe('CCI', () => {
    test('calculates CCI', () => {
      const len = 25;
      const highs = Array.from({ length: len }, (_, i) => 110 + Math.sin(i) * 5);
      const lows = Array.from({ length: len }, (_, i) => 90 + Math.sin(i) * 5);
      const closes = Array.from({ length: len }, (_, i) => 100 + Math.sin(i) * 5);
      
      const result = cci(highs, lows, closes);
      expect(result).toBeDefined();
    });

    test('returns undefined for insufficient data', () => {
      expect(cci([110], [90], [100])).toBeUndefined();
    });
  });
});

describe('Volatility Indicators', () => {
  describe('Standard Deviation', () => {
    test('calculates standard deviation', () => {
      // Values with known std dev: [2, 4, 4, 4, 5, 5, 7, 9] has stddev ≈ 2
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const result = standardDeviation(values, 8);
      expect(result).toBeDefined();
      expect(result).toBeCloseTo(2, 0);
    });

    test('returns undefined for insufficient data', () => {
      expect(standardDeviation([1, 2], 5)).toBeUndefined();
    });

    test('standardDeviationSeries returns correct structure', () => {
      const values = Array.from({ length: 10 }, (_, i) => i + 1);
      const result = standardDeviationSeries(values, 5);
      expect(result.length).toBe(10);
      expect(result[3]).toBeUndefined();
      expect(result[4]).toBeDefined();
    });
  });

  describe('Bollinger Bands', () => {
    test('calculates Bollinger Bands', () => {
      const values = Array.from({ length: 25 }, (_, i) => 100 + Math.sin(i) * 5);
      const result = bollingerBands(values);
      expect(result).toBeDefined();
      expect(result?.upper).toBeGreaterThan(result?.middle!);
      expect(result?.lower).toBeLessThan(result?.middle!);
    });

    test('bands are symmetric around middle', () => {
      const values = Array.from({ length: 25 }, () => 100); // Constant price
      const result = bollingerBands(values, 20, 2);
      expect(result).toBeDefined();
      if (result) {
        const upperDiff = result.upper - result.middle;
        const lowerDiff = result.middle - result.lower;
        expect(upperDiff).toBeCloseTo(lowerDiff, 10);
      }
    });

    test('returns undefined for insufficient data', () => {
      const values = Array.from({ length: 10 }, (_, i) => i);
      expect(bollingerBands(values, 20)).toBeUndefined();
    });

    test('bollingerBandsSeries returns correct structure', () => {
      const values = Array.from({ length: 30 }, (_, i) => 100 + i);
      const result = bollingerBandsSeries(values, 20, 2);
      expect(result.length).toBe(30);
      expect(result[18]).toBeUndefined();
      expect(result[19]).toBeDefined();
    });

    test('percentB is 0.5 at middle band', () => {
      const values = Array.from({ length: 25 }, () => 100);
      const result = bollingerBands(values);
      expect(result?.percentB).toBeCloseTo(0.5, 5);
    });
  });

  describe('True Range', () => {
    test('calculates true range correctly', () => {
      // TR = max(high-low, |high-prevClose|, |low-prevClose|)
      expect(trueRange(110, 90, 100)).toBe(20); // high-low
      expect(trueRange(110, 95, 85)).toBe(25); // |high-prevClose|
      expect(trueRange(105, 80, 110)).toBe(30); // |low-prevClose|
    });
  });

  describe('ATR', () => {
    test('calculates ATR', () => {
      const len = 20;
      const highs = Array.from({ length: len }, (_, i) => 110 + i);
      const lows = Array.from({ length: len }, (_, i) => 90 + i);
      const closes = Array.from({ length: len }, (_, i) => 100 + i);
      
      const result = atr(highs, lows, closes);
      expect(result).toBeDefined();
      expect(result?.atr).toBeGreaterThan(0);
      expect(result?.trueRange).toBeGreaterThan(0);
    });

    test('returns undefined for insufficient data', () => {
      expect(atr([110], [90], [100])).toBeUndefined();
    });

    test('atrSeries returns correct structure', () => {
      const len = 20;
      const highs = Array.from({ length: len }, (_, i) => 110 + i);
      const lows = Array.from({ length: len }, (_, i) => 90 + i);
      const closes = Array.from({ length: len }, (_, i) => 100 + i);
      
      const result = atrSeries(highs, lows, closes);
      expect(result.length).toBe(len);
    });
  });

  describe('Keltner Channels', () => {
    test('calculates Keltner Channels', () => {
      const len = 30;
      const highs = Array.from({ length: len }, (_, i) => 110 + i);
      const lows = Array.from({ length: len }, (_, i) => 90 + i);
      const closes = Array.from({ length: len }, (_, i) => 100 + i);
      
      const result = keltnerChannels(highs, lows, closes);
      expect(result).toBeDefined();
      expect(result?.upper).toBeGreaterThan(result?.middle!);
      expect(result?.lower).toBeLessThan(result?.middle!);
    });

    test('returns undefined for insufficient data', () => {
      expect(keltnerChannels([110], [90], [100])).toBeUndefined();
    });
  });

  describe('Historical Volatility', () => {
    test('calculates annualized volatility', () => {
      // Generate random walk
      const values: number[] = [100];
      for (let i = 1; i < 30; i++) {
        values.push(values[i - 1] * (1 + (Math.random() - 0.5) * 0.02));
      }
      
      const result = historicalVolatility(values);
      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(0);
    });

    test('returns undefined for insufficient data', () => {
      expect(historicalVolatility([100, 101, 102])).toBeUndefined();
    });
  });

  describe('Chaikin Volatility', () => {
    test('calculates Chaikin Volatility', () => {
      const len = 30;
      const highs = Array.from({ length: len }, (_, i) => 110 + Math.sin(i) * 5);
      const lows = Array.from({ length: len }, (_, i) => 90 + Math.sin(i) * 5);
      
      const result = chaikinVolatility(highs, lows);
      expect(result).toBeDefined();
    });

    test('returns undefined for insufficient data', () => {
      expect(chaikinVolatility([110], [90])).toBeUndefined();
    });
  });
});

describe('Edge Cases', () => {
  test('handles empty arrays', () => {
    expect(sma([], 5)).toBeUndefined();
    expect(ema([], 5)).toBeUndefined();
    expect(rsi([], 14)).toBeUndefined();
  });

  test('handles zero period', () => {
    expect(sma([1, 2, 3], 0)).toBeUndefined();
    expect(ema([1, 2, 3], 0)).toBeUndefined();
  });

  test('handles single value', () => {
    expect(sma([100], 1)).toBe(100);
    expect(ema([100], 1)).toBe(100);
  });

  test('handles constant values', () => {
    const constant = Array(20).fill(100);
    expect(sma(constant, 5)).toBe(100);
    expect(standardDeviation(constant, 5)).toBe(0);
  });
});
