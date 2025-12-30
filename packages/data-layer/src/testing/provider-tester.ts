/**
 * Provider testing framework
 */

import type { BaseProvider } from '../providers/base-provider';
import { MemoryAdapter } from '../cache/memory-adapter';
import { ProxyRequestAdapter } from '../types/request';
import type { TestOptions, TestResult, TestStatus } from './types';
import {
  getProviderTestConfig,
  getAllProviderNames,
} from './provider-configs';
import { runQualityChecks } from './quality-checker';

// Import all providers
import { FREDProvider } from '../providers/fred';
import { CoinGeckoProvider } from '../providers/coingecko';
import { YahooProvider } from '../providers/yahoo';
import { WorldBankProvider } from '../providers/worldbank';
import { BLSProvider } from '../providers/bls';
import { TreasuryProvider } from '../providers/treasury';
import { HyperliquidProvider } from '../providers/hyperliquid';
import { AlphaVantageProvider } from '../providers/alphavantage';
import { QuandlProvider } from '../providers/quandl';
import { IMFProvider } from '../providers/imf';
import { OECDProvider } from '../providers/oecd';

/**
 * Provider registry for testing
 */
const PROVIDER_REGISTRY: Record<string, BaseProvider> = {};

/**
 * Initialize provider registry (lazy)
 */
function initProviderRegistry() {
  if (Object.keys(PROVIDER_REGISTRY).length > 0) {
    return; // Already initialized
  }

  const cache = new MemoryAdapter();
  const request = new ProxyRequestAdapter('/api/proxy');

  PROVIDER_REGISTRY.fred = new FREDProvider(cache, request);
  PROVIDER_REGISTRY.coingecko = new CoinGeckoProvider(cache, request);
  PROVIDER_REGISTRY.yahoo = new YahooProvider(cache, request);
  PROVIDER_REGISTRY.worldbank = new WorldBankProvider(cache, request);
  PROVIDER_REGISTRY.bls = new BLSProvider(cache, request);
  PROVIDER_REGISTRY.treasury = new TreasuryProvider(cache, request);
  PROVIDER_REGISTRY.hyperliquid = new HyperliquidProvider(cache, request);
  PROVIDER_REGISTRY.alphavantage = new AlphaVantageProvider(cache, request);
  PROVIDER_REGISTRY.quandl = new QuandlProvider(cache, request);
  PROVIDER_REGISTRY.imf = new IMFProvider(cache, request);
  PROVIDER_REGISTRY.oecd = new OECDProvider(cache, request);
}

/**
 * Test a single provider
 */
export async function testProvider(
  providerName: string,
  options: TestOptions = {}
): Promise<TestResult> {
  const startTime = performance.now();
  const providerKey = providerName.toLowerCase();

  // Get test config
  const testConfig = getProviderTestConfig(providerKey);
  if (!testConfig) {
    return {
      provider: providerName,
      status: 'skip',
      duration: 0,
      errors: [`Unknown provider: ${providerName}`],
    };
  }

  // Initialize providers
  initProviderRegistry();
  const provider = PROVIDER_REGISTRY[providerKey];
  if (!provider) {
    return {
      provider: providerName,
      status: 'skip',
      duration: 0,
      errors: [`Provider not registered: ${providerName}`],
    };
  }

  if (options.verbose) {
    console.log(`\n🧪 Testing ${testConfig.name}...`);
  }

  try {
    // Build config
    const config = {
      ...testConfig.configBuilder(),
      mockMode: !options.live, // Use mock mode unless --live is specified
    };

    if (options.verbose) {
      console.log(`   Config:`, JSON.stringify(config, null, 2));
      console.log(`   Mode: ${options.live ? 'LIVE API' : 'MOCK'}`);
    }

    // Fetch data
    const result = await provider.fetch(config);
    const duration = performance.now() - startTime;

    if (options.verbose) {
      console.log(`   Duration: ${duration.toFixed(2)}ms`);
      console.log(`   Data points: ${result.series.data.length}`);
      console.log(`   From cache: ${result.fromCache}`);
      console.log(`   Is mock: ${result.isMock}`);
    }

    // Run quality checks if requested
    let qualityReport;
    if (options.quality) {
      qualityReport = runQualityChecks(
        result.series,
        testConfig.maxAgeMs,
        testConfig.expectedMinPoints
      );

      if (options.verbose) {
        console.log(`\n   📊 Quality Report:`);
        console.log(
          `      Freshness: ${qualityReport.freshness.isStale ? '❌ STALE' : '✅ Fresh'} (${qualityReport.freshness.message})`
        );
        console.log(
          `      Completeness: ${qualityReport.completeness.hasMissingData ? '⚠️  Has gaps' : '✅ Complete'} (${qualityReport.completeness.message})`
        );
        console.log(
          `      Format: ${qualityReport.format.valid ? '✅ Valid' : '❌ Invalid'} (${qualityReport.format.validPoints}/${qualityReport.format.totalPoints} valid)`
        );

        if (qualityReport.format.issues.length > 0) {
          console.log(`      Format Issues:`);
          qualityReport.format.issues.forEach((issue) => {
            console.log(`        - ${issue}`);
          });
        }
      }

      // Check quality failures
      const qualityFailed =
        qualityReport.freshness.isStale ||
        qualityReport.completeness.hasMissingData ||
        !qualityReport.format.valid;

      if (qualityFailed) {
        const issues = [];
        if (qualityReport.freshness.isStale)
          issues.push('Data is stale');
        if (qualityReport.completeness.hasMissingData)
          issues.push('Data has gaps');
        if (!qualityReport.format.valid)
          issues.push('Data format invalid');

        return {
          provider: testConfig.name,
          status: 'fail',
          duration,
          dataPoints: result.series.data.length,
          errors: issues,
          qualityReport,
        };
      }
    }

    // Success
    if (options.verbose) {
      console.log(`   ✅ Test passed`);
    }

    return {
      provider: testConfig.name,
      status: 'pass',
      duration,
      dataPoints: result.series.data.length,
      qualityReport,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (options.verbose) {
      console.log(`   ❌ Test failed: ${errorMessage}`);
    }

    return {
      provider: testConfig.name,
      status: 'fail',
      duration,
      errors: [errorMessage],
    };
  }
}

/**
 * Test all providers
 */
export async function testAllProviders(
  options: TestOptions = {}
): Promise<TestResult[]> {
  const providerNames = getAllProviderNames();

  if (options.verbose) {
    console.log(`\n🚀 Testing ${providerNames.length} providers...\n`);
  }

  // Run tests in parallel for speed
  const results = await Promise.all(
    providerNames.map((name) => testProvider(name, options))
  );

  return results;
}

/**
 * Print summary of test results
 */
export function printTestSummary(results: TestResult[]) {
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Test Summary`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total:   ${total}`);
  console.log(`✅ Pass:   ${passed}`);
  console.log(`❌ Fail:   ${failed}`);
  console.log(`⏭️  Skip:   ${skipped}`);
  console.log(`${'='.repeat(60)}\n`);

  // Print failures
  const failures = results.filter((r) => r.status === 'fail');
  if (failures.length > 0) {
    console.log(`❌ Failed Providers:\n`);
    failures.forEach((result) => {
      console.log(`   ${result.provider}:`);
      result.errors?.forEach((error) => {
        console.log(`      - ${error}`);
      });
    });
    console.log();
  }

  // Print skipped
  const skippedResults = results.filter((r) => r.status === 'skip');
  if (skippedResults.length > 0) {
    console.log(`⏭️  Skipped Providers:\n`);
    skippedResults.forEach((result) => {
      console.log(`   ${result.provider}:`);
      result.errors?.forEach((error) => {
        console.log(`      - ${error}`);
      });
    });
    console.log();
  }

  // Overall status
  if (failed === 0 && skipped === 0) {
    console.log(`✨ All tests passed!\n`);
  } else if (failed > 0) {
    console.log(`💥 Some tests failed. Fix the issues above.\n`);
  }
}

/**
 * Print quality report as JSON
 */
export function printQualityReportJSON(results: TestResult[]) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      skipped: results.filter((r) => r.status === 'skip').length,
    },
    providers: results.map((r) => ({
      provider: r.provider,
      status: r.status,
      duration: r.duration,
      dataPoints: r.dataPoints,
      errors: r.errors,
      quality: r.qualityReport
        ? {
            freshness: {
              isStale: r.qualityReport.freshness.isStale,
              ageMs: r.qualityReport.freshness.ageMs,
              message: r.qualityReport.freshness.message,
            },
            completeness: {
              hasMissingData: r.qualityReport.completeness.hasMissingData,
              percentage: r.qualityReport.completeness.percentage,
              gaps: r.qualityReport.completeness.gaps,
              message: r.qualityReport.completeness.message,
            },
            format: {
              valid: r.qualityReport.format.valid,
              validPoints: r.qualityReport.format.validPoints,
              totalPoints: r.qualityReport.format.totalPoints,
              issues: r.qualityReport.format.issues,
            },
          }
        : undefined,
    })),
  };

  console.log(JSON.stringify(report, null, 2));
}
