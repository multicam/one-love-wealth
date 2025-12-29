import { test, expect, describe } from 'bun:test';
import { coingecko } from './coingecko-builder';
import { yahoo } from './yahoo-builder';
import { fred } from './fred-builder';
import { worldbank } from './worldbank-builder';
import { bls } from './bls-builder';
import { treasury } from './treasury-builder';
import { alphavantage } from './alphavantage-builder';
import { quandl } from './quandl-builder';
import { imf } from './imf-builder';
import { oecd } from './oecd-builder';
import { hyperliquid } from './hyperliquid-builder';

describe('Builder Tests - CoinGecko', () => {
  test('creates config with minimal params', () => {
    const config = coingecko('bitcoin').build();
    expect(config.coinId).toBe('bitcoin');
  });

  test('supports all market_chart options', () => {
    const config = coingecko('ethereum')
      .marketChart()
      .days(30)
      .interval('daily')
      .vsCurrency('usd')
      .precision(2)
      .build();

    expect(config.coinId).toBe('ethereum');
    expect(config.endpoint).toBe('market_chart');
    expect(config.days).toBe(30);
    expect(config.interval).toBe('daily');
    expect(config.vsCurrency).toBe('usd');
    expect(config.precision).toBe(2);
  });

  test('supports OHLC endpoint', () => {
    const config = coingecko('bitcoin')
      .ohlc()
      .days(7)
      .build();

    expect(config.endpoint).toBe('ohlc');
    expect(config.days).toBe(7);
  });

  test('supports simple_price endpoint with flags', () => {
    const config = coingecko('bitcoin')
      .simplePrice()
      .includeMarketCap()
      .include24hrVol()
      .include24hrChange()
      .build();

    expect(config.endpoint).toBe('simple_price');
    expect(config.includeMarketCap).toBe(true);
    expect(config.include24hrVol).toBe(true);
    expect(config.include24hrChange).toBe(true);
  });

  test('supports cache configuration', () => {
    const config = coingecko('bitcoin')
      .cache({ ttl: 60000, frequency: 'daily', forceRefresh: true })
      .build();

    expect(config.cache?.ttl).toBe(60000);
    expect(config.cache?.frequency).toBe('daily');
    expect(config.cache?.forceRefresh).toBe(true);
  });

  test('supports mock mode', () => {
    const config = coingecko('bitcoin')
      .mockMode(true)
      .build();

    expect(config.mockMode).toBe(true);
  });

  test('supports error recovery config', () => {
    const config = coingecko('bitcoin')
      .errorRecovery({ fallbackToMock: false, retryCount: 3, timeoutMs: 5000 })
      .build();

    expect(config.errorRecovery?.fallbackToMock).toBe(false);
    expect(config.errorRecovery?.retryCount).toBe(3);
    expect(config.errorRecovery?.timeoutMs).toBe(5000);
  });

  test('throws error when coinId missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      coingecko().build();
    }).toThrow();
  });
});

describe('Builder Tests - Yahoo', () => {
  test('creates config with minimal params', () => {
    const config = yahoo('AAPL').build();
    expect(config.symbol).toBe('AAPL');
  });

  test('supports period and interval', () => {
    const config = yahoo('SPY')
      .period('1y')
      .interval('1d')
      .build();

    expect(config.symbol).toBe('SPY');
    expect(config.period).toBe('1y');
    expect(config.interval).toBe('1d');
  });

  test('supports all period options', () => {
    const periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'] as const;

    periods.forEach(period => {
      const config = yahoo('AAPL').period(period).build();
      expect(config.period).toBe(period);
    });
  });

  test('supports all interval options', () => {
    const intervals = ['1m', '5m', '15m', '1h', '1d', '1wk', '1mo'] as const;

    intervals.forEach(interval => {
      const config = yahoo('AAPL').interval(interval).build();
      expect(config.interval).toBe(interval);
    });
  });

  test('throws error when symbol missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      yahoo().build();
    }).toThrow();
  });
});

describe('Builder Tests - FRED', () => {
  test('creates config with minimal params', () => {
    const config = fred('GDP').build();
    expect(config.seriesId).toBe('GDP');
  });

  test('supports date range', () => {
    const config = fred('GDP')
      .startDate('2020-01-01')
      .endDate('2023-12-31')
      .build();

    expect(config.startDate).toBe('2020-01-01');
    expect(config.endDate).toBe('2023-12-31');
  });

  test('supports units transformation', () => {
    const units = ['lin', 'chg', 'ch1', 'pch', 'pc1', 'pca', 'cch', 'cca', 'log'] as const;

    units.forEach(unit => {
      const config = fred('GDP').units(unit).build();
      expect(config.units).toBe(unit);
    });
  });

  test('supports frequency aggregation', () => {
    const frequencies = ['d', 'w', 'bw', 'm', 'q', 'sa', 'a'] as const;

    frequencies.forEach(frequency => {
      const config = fred('GDP').frequency(frequency).build();
      expect(config.frequency).toBe(frequency);
    });
  });

  test('supports aggregation method', () => {
    const config = fred('GDP')
      .aggregationMethod('avg')
      .build();

    expect(config.aggregationMethod).toBe('avg');
  });

  test('throws error when seriesId missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      fred().build();
    }).toThrow();
  });
});

describe('Builder Tests - WorldBank', () => {
  test('creates config with minimal params', () => {
    const config = worldbank('NY.GDP.MKTP.CD', 'USA').build();
    expect(config.indicator).toBe('NY.GDP.MKTP.CD');
    expect(config.country).toBe('USA');
  });

  test('supports date range', () => {
    const config = worldbank('NY.GDP.MKTP.CD', 'USA')
      .startDate('2020')
      .endDate('2023')
      .build();

    expect(config.startDate).toBe('2020');
    expect(config.endDate).toBe('2023');
  });

  test('supports frequency', () => {
    const config = worldbank('NY.GDP.MKTP.CD', 'USA')
      .frequency('M')
      .build();

    expect(config.frequency).toBe('M');
  });

  test('throws error when indicator missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      worldbank(undefined, 'USA').build();
    }).toThrow();
  });

  test('throws error when country missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      worldbank('NY.GDP.MKTP.CD').build();
    }).toThrow();
  });
});

describe('Builder Tests - BLS', () => {
  test('creates config with minimal params', () => {
    const config = bls('CUUR0000SA0').build();
    expect(config.seriesId).toBe('CUUR0000SA0');
  });

  test('supports date range', () => {
    const config = bls('CUUR0000SA0')
      .startYear('2020')
      .endYear('2023')
      .build();

    expect(config.startYear).toBe('2020');
    expect(config.endYear).toBe('2023');
  });

  test('supports catalog flag', () => {
    const config = bls('CUUR0000SA0')
      .catalog(true)
      .build();

    expect(config.catalog).toBe(true);
  });

  test('throws error when seriesId missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      bls().build();
    }).toThrow();
  });
});

describe('Builder Tests - Treasury', () => {
  test('creates config with minimal params', () => {
    const config = treasury('debt_outstanding').build();
    expect(config.dataset).toBe('debt_outstanding');
  });

  test('supports date filters', () => {
    const config = treasury('debt_outstanding')
      .startDate('2020-01-01')
      .endDate('2023-12-31')
      .build();

    expect(config.startDate).toBe('2020-01-01');
    expect(config.endDate).toBe('2023-12-31');
  });

  test('supports filters', () => {
    const config = treasury('debt_outstanding')
      .filters({ record_type: 'total' })
      .build();

    expect(config.filters).toEqual({ record_type: 'total' });
  });

  test('throws error when dataset missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      treasury().build();
    }).toThrow();
  });
});

describe('Builder Tests - AlphaVantage', () => {
  test('creates config with minimal params', () => {
    const config = alphavantage('IBM').function('TIME_SERIES_DAILY').build();
    expect(config.symbol).toBe('IBM');
    expect(config.function).toBe('TIME_SERIES_DAILY');
  });

  test('supports interval for intraday', () => {
    const config = alphavantage('IBM')
      .function('TIME_SERIES_INTRADAY')
      .interval('5min')
      .build();

    expect(config.function).toBe('TIME_SERIES_INTRADAY');
    expect(config.interval).toBe('5min');
  });

  test('supports outputsize', () => {
    const config = alphavantage('IBM')
      .function('TIME_SERIES_DAILY')
      .outputSize('full')
      .build();

    expect(config.outputsize).toBe('full');
  });

  test('throws error when symbol missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      alphavantage().function('TIME_SERIES_DAILY').build();
    }).toThrow();
  });

  test('throws error when function missing', () => {
    expect(() => {
      alphavantage('IBM').build();
    }).toThrow();
  });
});

describe('Builder Tests - Quandl', () => {
  test('creates config with minimal params', () => {
    const config = quandl('WIKI/AAPL').build();
    expect(config.dataset).toBe('WIKI/AAPL');
  });

  test('supports date range', () => {
    const config = quandl('WIKI/AAPL')
      .startDate('2020-01-01')
      .endDate('2023-12-31')
      .build();

    expect(config.startDate).toBe('2020-01-01');
    expect(config.endDate).toBe('2023-12-31');
  });

  test('supports collapse frequency', () => {
    const collapses = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'] as const;

    collapses.forEach(collapse => {
      const config = quandl('WIKI/AAPL').collapse(collapse).build();
      expect(config.collapse).toBe(collapse);
    });
  });

  test('supports transform', () => {
    const transforms = ['diff', 'rdiff', 'cumul', 'normalize'] as const;

    transforms.forEach(transform => {
      const config = quandl('WIKI/AAPL').transform(transform).build();
      expect(config.transform).toBe(transform);
    });
  });

  test('throws error when dataset missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      quandl().build();
    }).toThrow();
  });
});

describe('Builder Tests - IMF', () => {
  test('creates config with minimal params', () => {
    const config = imf('IFS', 'Q.US.PMP_IX').build();
    expect(config.database).toBe('IFS');
    expect(config.indicator).toBe('Q.US.PMP_IX');
  });

  test('supports date range', () => {
    const config = imf('IFS', 'Q.US.PMP_IX')
      .startPeriod('2020-Q1')
      .endPeriod('2023-Q4')
      .build();

    expect(config.startPeriod).toBe('2020-Q1');
    expect(config.endPeriod).toBe('2023-Q4');
  });

  test('supports frequency', () => {
    const frequencies = ['M', 'Q', 'A'] as const;

    frequencies.forEach(frequency => {
      const config = imf('IFS', 'Q.US.PMP_IX').frequency(frequency).build();
      expect(config.frequency).toBe(frequency);
    });
  });

  test('throws error when database missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      imf(undefined, 'Q.US.PMP_IX').build();
    }).toThrow();
  });

  test('throws error when indicator missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      imf('IFS').build();
    }).toThrow();
  });
});

describe('Builder Tests - OECD', () => {
  test('creates config with minimal params', () => {
    const config = oecd('QNA', 'USA+DEU.B1_GE.CUR.Q').build();
    expect(config.dataset).toBe('QNA');
    expect(config.filter).toBe('USA+DEU.B1_GE.CUR.Q');
  });

  test('supports date range', () => {
    const config = oecd('QNA', 'USA.B1_GE.CUR.Q')
      .startTime('2020-Q1')
      .endTime('2023-Q4')
      .build();

    expect(config.startTime).toBe('2020-Q1');
    expect(config.endTime).toBe('2023-Q4');
  });

  test('supports detail level', () => {
    const config = oecd('QNA', 'USA.B1_GE.CUR.Q')
      .detail('full')
      .build();

    expect(config.detail).toBe('full');
  });

  test('throws error when dataset missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      oecd(undefined, 'USA.B1_GE.CUR.Q').build();
    }).toThrow();
  });

  test('throws error when filter missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      oecd('QNA').build();
    }).toThrow();
  });
});

describe('Builder Tests - Hyperliquid', () => {
  test('creates config with minimal params', () => {
    const config = hyperliquid('BTC').build();
    expect(config.coin).toBe('BTC');
  });

  test('supports data type', () => {
    const dataTypes = ['candles', 'trades', 'funding', 'liquidations'] as const;

    dataTypes.forEach(dataType => {
      const config = hyperliquid('BTC').dataType(dataType).build();
      expect(config.dataType).toBe(dataType);
    });
  });

  test('supports interval for candles', () => {
    const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

    intervals.forEach(interval => {
      const config = hyperliquid('BTC')
        .dataType('candles')
        .interval(interval)
        .build();

      expect(config.interval).toBe(interval);
    });
  });

  test('supports time range', () => {
    const config = hyperliquid('BTC')
      .startTime(1700000000000)
      .endTime(1710000000000)
      .build();

    expect(config.startTime).toBe(1700000000000);
    expect(config.endTime).toBe(1710000000000);
  });

  test('throws error when coin missing', () => {
    expect(() => {
      // @ts-expect-error Testing missing required field
      hyperliquid().build();
    }).toThrow();
  });
});

describe('Builder Tests - Method Chaining', () => {
  test('all methods return builder instance for chaining', () => {
    const builder = coingecko('bitcoin');

    const result = builder
      .marketChart()
      .days(30)
      .interval('daily')
      .vsCurrency('usd')
      .cache({ ttl: 60000 })
      .mockMode(true)
      .errorRecovery({ fallbackToMock: true });

    // Should still be a builder, not a config
    expect(typeof result.build).toBe('function');

    // Should produce valid config
    const config = result.build();
    expect(config.coinId).toBe('bitcoin');
  });

  test('can reuse builder for multiple configs', () => {
    const baseBuilder = coingecko('bitcoin');

    const config1 = baseBuilder.marketChart().days(7).build();
    const config2 = baseBuilder.ohlc().days(30).build();

    expect(config1.endpoint).toBe('market_chart');
    expect(config1.days).toBe(7);
    expect(config2.endpoint).toBe('ohlc');
    expect(config2.days).toBe(30);
  });
});
