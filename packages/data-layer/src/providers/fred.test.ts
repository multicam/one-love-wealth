import { test, expect, describe } from 'bun:test';
import { FREDProvider, type FREDConfig } from './fred';
import { FREDBuilder, fred } from '../builders/fred-builder';
import { MemoryAdapter } from '../cache/memory-adapter';
import { ProxyRequestAdapter } from '../types/request';

describe('FREDBuilder', () => {
  test('builds config with seriesId', () => {
    const config = fred('M2SL').build();
    expect(config.seriesId).toBe('M2SL');
  });

  test('builds config with all options', () => {
    const config = fred('GDP')
      .units('pc1')
      .frequency('q')
      .aggregationMethod('avg')
      .startDate('2020-01-01')
      .endDate('2024-01-01')
      .cache({ frequency: 'weekly' })
      .mockMode(true)
      .errorRecovery({ retryCount: 3 })
      .build();

    expect(config.seriesId).toBe('GDP');
    expect(config.units).toBe('pc1');
    expect(config.frequency).toBe('q');
    expect(config.aggregationMethod).toBe('avg');
    expect(config.startDate).toBe('2020-01-01');
    expect(config.endDate).toBe('2024-01-01');
    expect(config.cache?.frequency).toBe('weekly');
    expect(config.mockMode).toBe(true);
    expect(config.errorRecovery?.retryCount).toBe(3);
  });

  test('convenience method yoyChange sets pc1 units', () => {
    const config = fred('M2SL').yoyChange().build();
    expect(config.units).toBe('pc1');
  });

  test('convenience method percentChange sets pch units', () => {
    const config = fred('GDP').percentChange().build();
    expect(config.units).toBe('pch');
  });

  test('convenience method naturalLog sets log units', () => {
    const config = fred('M2SL').naturalLog().build();
    expect(config.units).toBe('log');
  });

  test('convenience frequency methods work', () => {
    expect(fred('GDP').daily().build().frequency).toBe('d');
    expect(fred('GDP').weekly().build().frequency).toBe('w');
    expect(fred('GDP').monthly().build().frequency).toBe('m');
    expect(fred('GDP').quarterly().build().frequency).toBe('q');
    expect(fred('GDP').annual().build().frequency).toBe('a');
  });

  test('dateRange sets both start and end dates', () => {
    const config = fred('M2SL').dateRange('2020-01-01', '2024-12-31').build();
    expect(config.startDate).toBe('2020-01-01');
    expect(config.endDate).toBe('2024-12-31');
  });

  test('limit sets count', () => {
    const config = fred('FEDFUNDS').limit(100).build();
    expect(config.limit).toBe(100);
  });

  test('throws when seriesId is missing', () => {
    const builder = new FREDBuilder();
    expect(() => builder.build()).toThrow('FRED seriesId is required');
  });

  test('fluent API returns same instance', () => {
    const builder = new FREDBuilder();
    const result = builder.seriesId('GDP').units('pc1').monthly();
    expect(result).toBe(builder);
  });
});

describe('FREDProvider', () => {
  const cache = new MemoryAdapter();
  const request = new ProxyRequestAdapter('/api/proxy');
  const provider = new FREDProvider(cache, request);

  test('has correct name and cachePrefix', () => {
    expect(provider.name).toBe('FRED');
    expect(provider.cachePrefix).toBe('FRED');
  });

  describe('mock data generation', () => {
    test('generates mock data', async () => {
      const config = fred('M2SL').mockMode().build();
      const result = await provider.fetch(config);

      expect(result.isMock).toBe(true);
      expect(result.fromCache).toBe(false);
      expect(result.series.data.length).toBeGreaterThan(0);
      expect(result.series.source).toBe('FRED');
    });

    test('mock data has value structure', async () => {
      const config = fred('GDP').mockMode().build();
      const result = await provider.fetch(config);

      const point = result.series.data[0]!;
      expect(point.time).toBeDefined();
      expect(point.value).toBeDefined();
    });

    test('generates different baseline values for different series', async () => {
      const m2Config = fred('M2SL').mockMode().build();
      const rateConfig = fred('FEDFUNDS').mockMode().build();

      const m2Result = await provider.fetch(m2Config);
      const rateResult = await provider.fetch(rateConfig);

      // M2 should have much larger values than interest rates
      const m2Value = m2Result.series.data[0]!.value!;
      const rateValue = rateResult.series.data[0]!.value!;
      expect(m2Value).toBeGreaterThan(rateValue);
    });

    test('applies pc1 units transformation to mock data', async () => {
      const config = fred('M2SL').yoyChange().mockMode().build();
      const result = await provider.fetch(config);

      // YoY change should produce percentage values (typically -100 to +100 range)
      const values = result.series.data.map((p) => p.value!);
      const maxAbsValue = Math.max(...values.map(Math.abs));
      expect(maxAbsValue).toBeLessThan(200); // Reasonable YoY change range
    });

    test('applies log units transformation to mock data', async () => {
      const config = fred('M2SL').naturalLog().mockMode().build();
      const result = await provider.fetch(config);

      // Log of M2 (~20000) should be around 10
      const firstValue = result.series.data[0]!.value!;
      expect(firstValue).toBeGreaterThan(5);
      expect(firstValue).toBeLessThan(15);
    });
  });

  describe('response transformation', () => {
    test('transforms FRED response correctly', () => {
      const mockResponse = {
        observations: [
          { date: '2024-01-01', value: '21000.5' },
          { date: '2024-02-01', value: '21100.2' },
          { date: '2024-03-01', value: '.' }, // Missing value
        ],
      };

      const config: FREDConfig = { seriesId: 'M2SL' };
      const data = (provider as any).transformResponse(mockResponse, config);

      expect(data.length).toBe(2); // Missing value filtered out
      expect(data[0].time).toBe(new Date('2024-01-01').getTime());
      expect(data[0].value).toBe(21000.5);
      expect(data[1].value).toBe(21100.2);
    });

    test('throws on invalid response', () => {
      const config: FREDConfig = { seriesId: 'M2SL' };
      expect(() => (provider as any).transformResponse({}, config)).toThrow(
        'Invalid FRED response'
      );
    });
  });

  describe('cache key components', () => {
    test('generates correct cache key for basic config', () => {
      const config: FREDConfig = { seriesId: 'M2SL' };
      const components = (provider as any).getCacheKeyComponents(config);

      expect(components.provider).toBe('FRED');
      expect(components.endpoint).toBe('observations');
      expect(components.params.seriesId).toBe('M2SL');
    });

    test('includes units and frequency in cache key', () => {
      const config: FREDConfig = {
        seriesId: 'GDP',
        units: 'pc1',
        frequency: 'q',
      };

      const components = (provider as any).getCacheKeyComponents(config);
      expect(components.params.units).toBe('pc1');
      expect(components.params.frequency).toBe('q');
    });

    test('includes date range in cache key', () => {
      const config: FREDConfig = {
        seriesId: 'M2SL',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
      };

      const components = (provider as any).getCacheKeyComponents(config);
      expect(components.params.startDate).toBe('2020-01-01');
      expect(components.params.endDate).toBe('2024-01-01');
    });
  });
});
