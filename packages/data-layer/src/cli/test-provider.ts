#!/usr/bin/env bun

/**
 * CLI tool for testing data providers
 *
 * Usage:
 *   bun run src/cli/test-provider.ts <provider-name> [options]
 *   bun run src/cli/test-provider.ts --all [options]
 *
 * Examples:
 *   bun run src/cli/test-provider.ts fred
 *   bun run src/cli/test-provider.ts fred --verbose --quality
 *   bun run src/cli/test-provider.ts fred --live
 *   bun run src/cli/test-provider.ts --all
 *   bun run src/cli/test-provider.ts --all --quality
 */

import { parseArgs } from 'util';
import {
  testProvider,
  testAllProviders,
  printTestSummary,
  printQualityReportJSON,
} from '../testing/provider-tester';
import { getAllProviderNames } from '../testing/provider-configs';
import type { TestOptions } from '../testing/types';

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    verbose: { type: 'boolean', short: 'v' },
    quality: { type: 'boolean', short: 'q' },
    live: { type: 'boolean', short: 'l' },
    all: { type: 'boolean', short: 'a' },
    json: { type: 'boolean', short: 'j' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

// Show help
if (values.help || (positionals.length === 0 && !values.all)) {
  console.log(`
🧪 Data Provider Test CLI

Usage: bun run src/cli/test-provider.ts <provider-name> [options]

Providers: ${getAllProviderNames().join(', ')}

Options:
  -v, --verbose   Detailed output with request/response logging
  -q, --quality   Run data quality checks (freshness, completeness, format)
  -l, --live      Use live API (default: mock mode)
  -a, --all       Test all providers
  -j, --json      Output quality report as JSON (use with --quality)
  -h, --help      Show this help message

Examples:
  # Test FRED provider in mock mode
  bun run src/cli/test-provider.ts fred

  # Test FRED with verbose output and quality checks
  bun run src/cli/test-provider.ts fred -v -q

  # Test FRED against live API
  bun run src/cli/test-provider.ts fred --live

  # Test all providers
  bun run src/cli/test-provider.ts --all

  # Test all providers with quality checks (for CI/CD)
  bun run src/cli/test-provider.ts --all --quality

  # Test all providers and output JSON report
  bun run src/cli/test-provider.ts --all --quality --json
`);
  process.exit(0);
}

// Build options
const options: TestOptions = {
  verbose: values.verbose || false,
  quality: values.quality || false,
  live: values.live || false,
  all: values.all || false,
};

// Run tests
async function main() {
  try {
    if (options.all) {
      // Test all providers
      const results = await testAllProviders(options);

      // Output results
      if (values.json && options.quality) {
        printQualityReportJSON(results);
      } else {
        printTestSummary(results);
      }

      // Exit with error code if any tests failed
      const failed = results.filter((r) => r.status === 'fail').length;
      process.exit(failed > 0 ? 1 : 0);
    } else {
      // Test single provider
      const providerName = positionals[0];
      if (!providerName) {
        console.error(
          '❌ Error: Provider name required. Use --help for usage.'
        );
        process.exit(1);
      }

      const result = await testProvider(providerName, options);

      // Output result
      if (values.json && options.quality && result.qualityReport) {
        printQualityReportJSON([result]);
      } else if (!options.verbose) {
        // Print simple summary for non-verbose mode
        console.log(
          `\n${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️ '} ${result.provider}: ${result.status.toUpperCase()}`
        );
        if (result.dataPoints !== undefined) {
          console.log(`   Data points: ${result.dataPoints}`);
        }
        if (result.duration !== undefined) {
          console.log(`   Duration: ${result.duration.toFixed(2)}ms`);
        }
        if (result.errors && result.errors.length > 0) {
          console.log(`   Errors:`);
          result.errors.forEach((error) => {
            console.log(`      - ${error}`);
          });
        }
        console.log();
      }

      // Exit with error code if test failed
      process.exit(result.status === 'fail' ? 1 : 0);
    }
  } catch (error) {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  }
}

main();
