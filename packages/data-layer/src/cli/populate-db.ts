#!/usr/bin/env bun

/**
 * CLI tool to populate and refresh the SQLite database
 *
 * Creates the database if it doesn't exist and fetches data from all providers.
 * Can be run daily to keep data fresh. Reports all changes as it runs.
 *
 * Usage:
 *   bun run src/cli/populate-db.ts [options]
 *
 * Examples:
 *   bun run src/cli/populate-db.ts
 *   bun run src/cli/populate-db.ts --db ./my-data.sqlite
 *   bun run src/cli/populate-db.ts --providers fred,yahoo,coingecko
 *   bun run src/cli/populate-db.ts --force
 *   bun run src/cli/populate-db.ts --dry-run
 */

import { parseArgs } from 'util';
import { existsSync } from 'node:fs';
import { SQLiteAdapter } from '../storage/sqlite-adapter';
import { createDirectAdapter } from '../types/request';
import { getAllProviderNames, PROVIDER_TEST_CONFIGS } from '../testing/provider-configs';
import type { BaseProvider } from '../providers/base-provider';

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

// Default database path
const DEFAULT_DB_PATH = 'data-cache.sqlite';

interface PopulateOptions {
  dbPath: string;
  providers: string[];
  force: boolean;
  dryRun: boolean;
  verbose: boolean;
  apiKeys: Record<string, string>;
}

interface ChangeReport {
  provider: string;
  seriesId: string;
  action: 'added' | 'updated' | 'unchanged' | 'failed';
  dataPoints?: number;
  previousDataPoints?: number;
  error?: string;
  duration?: number;
}

interface PopulateResult {
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
  changes: ChangeReport[];
  totalDuration: number;
  dbPath: string;
  dbCreated: boolean;
}

/**
 * Initialize provider registry with SQLite adapter and direct API access
 */
function createProviderRegistry(
  storage: SQLiteAdapter,
  apiKeys: Record<string, string> = {}
): Record<string, BaseProvider> {
  // Create direct request adapter with API keys
  const request = createDirectAdapter(apiKeys);

  // Report missing API keys
  const missing = request.getMissingApiKeys();
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing API keys for: ${missing.join(', ')}`);
    console.log('   Set environment variables or use --api-keys option');
    console.log('   Providers without keys may fail or use limited access\n');
  }

  return {
    fred: new FREDProvider(storage, request),
    coingecko: new CoinGeckoProvider(storage, request),
    yahoo: new YahooProvider(storage, request),
    worldbank: new WorldBankProvider(storage, request),
    bls: new BLSProvider(storage, request),
    treasury: new TreasuryProvider(storage, request),
    hyperliquid: new HyperliquidProvider(storage, request),
    alphavantage: new AlphaVantageProvider(storage, request),
    quandl: new QuandlProvider(storage, request),
    imf: new IMFProvider(storage, request),
    oecd: new OECDProvider(storage, request),
  };
}

/**
 * Check if database file exists
 */
function dbExists(dbPath: string): boolean {
  if (dbPath === ':memory:') return false;
  return existsSync(dbPath);
}

/**
 * Format duration in human-readable form
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format timestamp as relative time
 */
function formatAge(timestamp: number): string {
  const age = Date.now() - timestamp;
  const hours = age / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} minutes ago`;
  if (hours < 24) return `${Math.round(hours)} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/**
 * Populate the database with data from providers
 */
async function populateDatabase(options: PopulateOptions): Promise<PopulateResult> {
  const startTime = performance.now();
  const dbCreated = !dbExists(options.dbPath);

  console.log('\n🗃️  SQLite Database Population Script');
  console.log('='.repeat(50));
  console.log(`📁 Database: ${options.dbPath}`);
  console.log(`📦 Providers: ${options.providers.join(', ')}`);
  console.log(`🔄 Force refresh: ${options.force ? 'Yes' : 'No'}`);
  console.log(`🧪 Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log('='.repeat(50));

  if (dbCreated) {
    console.log('\n✨ Creating new database...');
  } else {
    console.log('\n📂 Using existing database...');
  }

  // Initialize storage
  const storage = options.dryRun
    ? new SQLiteAdapter(':memory:')
    : new SQLiteAdapter(options.dbPath);

  // Get initial stats
  const initialStats = await storage.getStats();
  if (!dbCreated && !options.dryRun) {
    console.log(`   Current entries: ${initialStats.totalSeries}`);
    console.log(`   Total data points: ${initialStats.totalDataPoints}`);
    if (initialStats.newestEntry) {
      console.log(`   Last updated: ${formatAge(initialStats.newestEntry)}`);
    }
  }

  // Initialize providers with API keys
  const registry = createProviderRegistry(storage, options.apiKeys);

  const result: PopulateResult = {
    added: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    changes: [],
    totalDuration: 0,
    dbPath: options.dbPath,
    dbCreated,
  };

  console.log('\n📥 Fetching data from providers...\n');

  // Process each provider
  for (const providerName of options.providers) {
    const providerKey = providerName.toLowerCase();
    const provider = registry[providerKey];
    const testConfig = PROVIDER_TEST_CONFIGS[providerKey];

    if (!provider || !testConfig) {
      console.log(`⏭️  ${providerName}: Skipped (unknown provider)`);
      result.changes.push({
        provider: providerName,
        seriesId: 'N/A',
        action: 'failed',
        error: 'Unknown provider',
      });
      result.failed++;
      continue;
    }

    const fetchStart = performance.now();
    const configName = testConfig.name;

    try {
      // Build config - always use live mode for population
      const config = {
        ...testConfig.configBuilder(),
        mockMode: false,
        cache: options.force ? { forceRefresh: true } : undefined,
      };

      // Fetch fresh data
      if (options.verbose) {
        console.log(`   Fetching ${configName}...`);
      }

      const fetchResult = await provider.fetch(config);
      const duration = performance.now() - fetchStart;
      const series = fetchResult.series;

      // Check if this was from cache or new fetch
      const existingEntry = await storage.getStale(series.id);

      let action: ChangeReport['action'];
      let previousDataPoints: number | undefined;

      if (!existingEntry) {
        action = 'added';
        result.added++;
      } else if (fetchResult.fromCache && !options.force) {
        action = 'unchanged';
        result.unchanged++;
        previousDataPoints = existingEntry.data.length;
      } else {
        action = 'updated';
        result.updated++;
        previousDataPoints = existingEntry.data.length;
      }

      // Report the change
      const report: ChangeReport = {
        provider: configName,
        seriesId: series.id,
        action,
        dataPoints: series.data.length,
        previousDataPoints,
        duration,
      };
      result.changes.push(report);

      // Print status line
      const actionIcon = action === 'added' ? '➕' : action === 'updated' ? '🔄' : '✅';
      const actionText = action === 'added' ? 'Added' : action === 'updated' ? 'Updated' : 'Unchanged';
      const pointsInfo = previousDataPoints
        ? `${previousDataPoints} → ${series.data.length} points`
        : `${series.data.length} points`;

      console.log(
        `${actionIcon} ${configName.padEnd(16)} ${actionText.padEnd(10)} ${pointsInfo.padEnd(20)} (${formatDuration(duration)})`
      );

      if (options.verbose && action !== 'unchanged') {
        console.log(`   Series ID: ${series.id}`);
        console.log(`   Source: ${series.source}`);
        console.log(`   Last updated: ${new Date(series.lastUpdated).toISOString()}`);
        if (series.data.length > 0) {
          const firstPoint = series.data[0];
          const lastPoint = series.data[series.data.length - 1];
          if (firstPoint && lastPoint) {
            console.log(`   Date range: ${new Date(firstPoint.time).toLocaleDateString()} - ${new Date(lastPoint.time).toLocaleDateString()}`);
          }
        }
        console.log();
      }
    } catch (error) {
      const duration = performance.now() - fetchStart;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.log(`❌ ${configName.padEnd(16)} Failed: ${errorMessage.substring(0, 50)}`);

      result.changes.push({
        provider: configName,
        seriesId: 'N/A',
        action: 'failed',
        error: errorMessage,
        duration,
      });
      result.failed++;
    }

    // Small delay between providers to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Get final stats
  const finalStats = await storage.getStats();
  result.totalDuration = performance.now() - startTime;

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`➕ Added:     ${result.added}`);
  console.log(`🔄 Updated:   ${result.updated}`);
  console.log(`✅ Unchanged: ${result.unchanged}`);
  console.log(`❌ Failed:    ${result.failed}`);
  console.log('-'.repeat(50));
  console.log(`📦 Total series:      ${finalStats.totalSeries}`);
  console.log(`📈 Total data points: ${finalStats.totalDataPoints}`);
  console.log(`⏱️  Duration:          ${formatDuration(result.totalDuration)}`);

  // Print by-source breakdown
  if (Object.keys(finalStats.bySource).length > 0) {
    console.log('\n📁 By Source:');
    for (const [source, count] of Object.entries(finalStats.bySource)) {
      console.log(`   ${source}: ${count} series`);
    }
  }

  // Print failures if any
  const failures = result.changes.filter((c) => c.action === 'failed');
  if (failures.length > 0) {
    console.log('\n❌ Failed Providers:');
    for (const failure of failures) {
      console.log(`   ${failure.provider}: ${failure.error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (options.dryRun) {
    console.log('🧪 Dry run complete - no changes written to disk');
  } else if (result.added > 0 || result.updated > 0) {
    console.log(`✨ Database ${dbCreated ? 'created and ' : ''}populated successfully!`);
  } else if (result.unchanged > 0) {
    console.log('✅ All data is up to date - no changes needed');
  } else {
    console.log('⚠️  No data was fetched');
  }
  console.log();

  // Clean up
  storage.close();

  return result;
}

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    db: { type: 'string', short: 'd' },
    providers: { type: 'string', short: 'p' },
    force: { type: 'boolean', short: 'f' },
    'dry-run': { type: 'boolean', short: 'n' },
    verbose: { type: 'boolean', short: 'v' },
    help: { type: 'boolean', short: 'h' },
    'api-keys': { type: 'string', short: 'k' },
  },
  allowPositionals: true,
});

// Show help
if (values.help) {
  console.log(`
🗃️  SQLite Database Population Script

Creates and populates a SQLite database with financial data from all providers.
Can be run daily to keep data fresh. Uses direct API calls (no proxy needed).

Usage: bun run src/cli/populate-db.ts [options]

Options:
  -d, --db <path>       Database file path (default: ${DEFAULT_DB_PATH})
  -p, --providers <list> Comma-separated list of providers to fetch
                         (default: all providers)
  -f, --force           Force refresh all data, bypassing cache
  -n, --dry-run         Run without writing to database
  -v, --verbose         Show detailed output
  -k, --api-keys <json> JSON object of API keys: '{"fred":"key","bls":"key"}'
  -h, --help            Show this help message

Available Providers:
  ${getAllProviderNames().join(', ')}

Environment Variables (for API keys):
  FRED_API_KEY        - FRED (Federal Reserve) - required
  BLS_API_KEY         - Bureau of Labor Statistics - optional, increases limits
  ALPHAVANTAGE_API_KEY - Alpha Vantage - required for alphavantage provider
  QUANDL_API_KEY      - Quandl/Nasdaq - optional, increases limits
  COINGECKO_API_KEY   - CoinGecko Pro - optional

Examples:
  # Populate database with all providers
  bun run src/cli/populate-db.ts

  # Use custom database path
  bun run src/cli/populate-db.ts --db ./my-data.sqlite

  # Only fetch from specific providers
  bun run src/cli/populate-db.ts --providers fred,yahoo,coingecko

  # Force refresh all data
  bun run src/cli/populate-db.ts --force

  # Provide API keys inline
  bun run src/cli/populate-db.ts --api-keys '{"fred":"your-key"}'  

  # Set API keys via environment
  FRED_API_KEY=your-key bun run src/cli/populate-db.ts

  # Dry run (don't write to database)
  bun run src/cli/populate-db.ts --dry-run

Daily Usage (cron):
  # Add to crontab for daily refresh at 6 AM:
  # 0 6 * * * cd /path/to/project && FRED_API_KEY=xxx bun run packages/data-layer/src/cli/populate-db.ts

  # Or use with systemd timer for better reliability
`);
  process.exit(0);
}

// Build options
const allProviders = getAllProviderNames();
const selectedProviders = values.providers
  ? values.providers.split(',').map((p) => p.trim().toLowerCase())
  : allProviders;

// Validate providers
const invalidProviders = selectedProviders.filter((p) => !allProviders.includes(p));
if (invalidProviders.length > 0) {
  console.error(`❌ Unknown providers: ${invalidProviders.join(', ')}`);
  console.error(`   Available: ${allProviders.join(', ')}`);
  process.exit(1);
}

// Parse API keys from command line
let apiKeys: Record<string, string> = {};
if (values['api-keys']) {
  try {
    apiKeys = JSON.parse(values['api-keys']);
  } catch (e) {
    console.error('❌ Invalid --api-keys JSON:', e);
    process.exit(1);
  }
}

const options: PopulateOptions = {
  dbPath: values.db || DEFAULT_DB_PATH,
  providers: selectedProviders,
  force: values.force || false,
  dryRun: values['dry-run'] || false,
  verbose: values.verbose || false,
  apiKeys,
};

// Run population
populateDatabase(options)
  .then((result) => {
    // Exit with error code if any failures
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
